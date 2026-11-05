"use server";

import { prisma } from "@/lib/prisma";
import { Order } from "@/types/order";
import { GetDBUser } from "./user_action";
import { predictPrice } from "@/lib/pricing/pricing-client";
import { sendOrderEmail } from "@/lib/email-notifications";
import {
  getCompletedRevenueTotal,
  getOrderStatusCountsByMonth,
  getOrderStatusCountsInRange,
  getUserOrderDayCounts,
  localDateKey,
} from "@/lib/db-aggregations";

function toPricingSource(source: "rule_based" | "ml_model") {
  return source === "ml_model" ? "ML_MODEL" as const : "RULE_BASED" as const;
}

function toPricingConfidence(confidence: "low" | "medium" | "high") {
  return confidence.toUpperCase() as "LOW" | "MEDIUM" | "HIGH";
}

// Prisma Decimal instances cannot be passed from Server to Client Components.
// Convert them to plain numbers so the data is serializable.
function serializeOrder<T extends Record<string, any>>(order: T) {
  return {
    ...order,
    estimatedAmount:
      order.estimatedAmount == null ? null : Number(order.estimatedAmount),
    finalAmount:
      order.finalAmount == null ? null : Number(order.finalAmount),
  };
}

export async function SaveOrder(order: Order | Order[]) {
  try {
    const dbUser = await GetDBUser();
    if (!dbUser) {
      return { success: false, error: "User not found in database" };
    }

    const orders = Array.isArray(order) ? order : [order];

    const pricedOrders = await Promise.all(
      orders.map(async (item) => {
        const pricing = await predictPrice(item);

        return {
        userId: dbUser.id,
        product: item.product,
        service: item.service,
        quantity: String(pricing.features.quantity),
        amount: String(pricing.predictedAmount),
        quantityValue: pricing.features.quantity,
        estimatedAmount: pricing.predictedAmount,
        finalAmount: null,
        pricingSource: toPricingSource(pricing.pricingSource),
        pricingConfidence: toPricingConfidence(pricing.confidence),
        pricingStatus: "PENDING_REVIEW" as const,
        pricingBreakdown: pricing.breakdown,
        pricingFeatures: pricing.features,
        pricingModelVersion:
          pricing.pricingSource === "ml_model"
            ? "external-model"
            : "rule-based-v1",
        adminAdjusted: false,
        adjustmentReason: null,
        priceReviewedById: null,
        priceEstimatedAt: new Date(),
        priceReviewedAt: null,
        status: item.status || "pending",
        orderDate: item.orderDate ? new Date(item.orderDate) : new Date(),
        deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : null,
        paperType: item.paperType,
        size: item.size,
        gsm: item.gsm,
        colorMode: item.colorMode,
        sides: item.sides,
        finishingOptions: item.finishingOptions || [],
        designs: item.designs || [],
        requirements: item.requirements,
        isReorder: item.isReorder || false,
        };
      })
    );

    await prisma.order.createMany({
      data: pricedOrders,
    });
    const uploadKeys = pricedOrders.flatMap(({ designs }) =>
      Array.isArray(designs)
        ? designs.flatMap((design) =>
            design && typeof design === "object" && "key" in design && typeof design.key === "string"
              ? [design.key]
              : []
          )
        : []
    );
    if (uploadKeys.length) {
      await prisma.uploadedFile.deleteMany({ where: { key: { in: uploadKeys }, userId: dbUser.id } }).catch((error) => {
        console.error("Temporary upload record cleanup failed:", error);
      });
    }
    await sendOrderEmail({
      enabled: dbUser.emailNotifications,
      to: dbUser.email,
      subject: "We received your NF Printers order",
      message: `We received ${pricedOrders.length} order${pricedOrders.length === 1 ? "" : "s"}. Our team will review the details and follow up with updates.`,
    });
    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Failed to save order. Please try again.");
  }
}

/** Load an order owned by the signed-in user as a source for a new cart draft. */
export async function getOrderForReorder(orderId: string) {
  const dbUser = await GetDBUser();
  if (!dbUser) throw new Error("User not found in database");
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: dbUser.id },
    include: { payment: true },
  });
  if (!order) throw new Error("Order not found");
  if (order.status !== "completed") throw new Error("Only completed orders can be reordered");
  return serializeOrder(order);
}

export async function getUserOrdersForReorder() {
  const dbUser = await GetDBUser();
  if (!dbUser) return [];
  const orders = await prisma.order.findMany({
    where: { userId: dbUser.id },
    orderBy: { orderDate: "desc" },
    include: { payment: true },
  });
  return orders.map(serializeOrder);
}

//  update the order
type OrderUpdatePayload = {
  id: string;
} & Partial<Order>;

export async function UpdateOrder(
  orderDraft: OrderUpdatePayload | OrderUpdatePayload[]
) {
  try {
    const dbUser = await GetDBUser();
    if (!dbUser) {
      throw new Error("User not found in database");
    }

    const drafts = Array.isArray(orderDraft) ? orderDraft : [orderDraft];

    const updatedOrders = await prisma.$transaction(async (prismaTx) => {
      const results = [];

      for (const draft of drafts) {
        // 🔒 Ownership check inside transaction
        const existingOrder = await prismaTx.order.findFirst({
          where: {
            id: draft.id,
            userId: dbUser.id,
          },
        });

        if (!existingOrder) {
          throw new Error(`Order ${draft.id} not found or unauthorized`);
        }

        const pricing = await predictPrice({
          product: draft.product ?? existingOrder.product,
          service: draft.service ?? existingOrder.service,
          quantity: draft.quantity ?? existingOrder.quantity,
          paperType: draft.paperType ?? existingOrder.paperType ?? "",
          size: draft.size ?? existingOrder.size ?? "",
          gsm: draft.gsm ?? existingOrder.gsm ?? "",
          colorMode: draft.colorMode ?? existingOrder.colorMode ?? "",
          sides: draft.sides ?? existingOrder.sides ?? "",
          finishingOptions:
            draft.finishingOptions ?? existingOrder.finishingOptions,
          requirements:
            draft.requirements ?? existingOrder.requirements ?? "",
          isReorder: true,
        });

        const updated = await prismaTx.order.update({
          where: { id: draft.id },
          data: {
            product: draft.product ?? existingOrder.product,
            service: draft.service ?? existingOrder.service,

            quantity:
              draft.quantity !== undefined
                ? draft.quantity
                : existingOrder.quantity,

            amount: String(pricing.predictedAmount),
            quantityValue: pricing.features.quantity,
            estimatedAmount: pricing.predictedAmount,
            finalAmount: null,
            pricingSource: toPricingSource(pricing.pricingSource),
            pricingConfidence: toPricingConfidence(pricing.confidence),
            pricingStatus: "PENDING_REVIEW",
            pricingBreakdown: pricing.breakdown,
            pricingFeatures: pricing.features,
            pricingModelVersion:
              pricing.pricingSource === "ml_model"
                ? "external-model"
                : "rule-based-v1",
            adminAdjusted: false,
            adjustmentReason: null,
            priceReviewedById: null,
            priceEstimatedAt: new Date(),
            priceReviewedAt: null,
            status: "pending",

            orderDate: new Date(),
            deliveryDate: draft.deliveryDate
              ? new Date(draft.deliveryDate)
              : existingOrder.deliveryDate,

            paperType: draft.paperType ?? existingOrder.paperType,
            size: draft.size ?? existingOrder.size,
            gsm: draft.gsm ?? existingOrder.gsm,
            colorMode: draft.colorMode ?? existingOrder.colorMode,
            sides: draft.sides ?? existingOrder.sides,

            finishingOptions:
              draft.finishingOptions ?? existingOrder.finishingOptions,

            designs:
              draft.designs !== undefined
                ? draft.designs
                : existingOrder.designs ?? [],

            requirements: draft.requirements ?? existingOrder.requirements,

            isReorder: true,
          },
        });

        results.push(updated);
      }

      return results;
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("UpdateOrder error:", error);
    return {
      success: false,
      error: "Failed to update order. Please try again.",
    };
  }
}

// fetch Crads and graph Data
export const fetchCardsDataAndAllOrders = async () => {
  const dbUser = await GetDBUser();

  if (!dbUser) {
    return {
      allOrders: [],
      activeOrders: [],
      pendingOrders: [],
      completedOrders: [],
      totalPaid: 0,
      weeklyData: [],
      lastWeekData: [],
      currentWeekPaid: 0,
      currentMonthPaid: 0,
    };
  }

  const now = new Date();
  const today = new Date(now);

  // Monday-based week index
  const dayOfWeek = (today.getDay() + 6) % 7;

  // -------- CURRENT WEEK --------
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // -------- LAST WEEK --------
  const lastWeekStart = new Date(startOfWeek);
  lastWeekStart.setDate(startOfWeek.getDate() - 7);
  lastWeekStart.setHours(0, 0, 0, 0);

  // -------- CURRENT MONTH --------
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    allOrders,
    totalPaid,
    currentWeekPaid,
    currentMonthPaid,
    dayCounts,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    }),
    getCompletedRevenueTotal({ userId: dbUser.id }),
    getCompletedRevenueTotal({
      userId: dbUser.id,
      from: startOfWeek,
      to: endOfWeek,
    }),
    getCompletedRevenueTotal({
      userId: dbUser.id,
      from: startOfMonth,
      to: endOfMonth,
    }),
    getUserOrderDayCounts(dbUser.id, lastWeekStart, endOfWeek),
  ]);

  const completedOrders = allOrders.filter((o) => o.status === "completed");
  const activeOrders = allOrders.filter((o) => o.status === "in_progress");
  const pendingOrders = allOrders.filter((o) => o.status === "pending");

  // -------- BUILD WEEKLY DATA --------
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const buildWeekData = (start: Date) =>
    Array.from({ length: 7 }, (_, index) => {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + index);
      const row = dayCounts.get(localDateKey(currentDay));

      return {
        label: days[index],
        total: row?.total ?? 0,
        completed: row?.completed ?? 0,
        pending: row?.pending ?? 0,
        cancelled: row?.cancelled ?? 0,
      };
    });

  const weeklyData = buildWeekData(startOfWeek);
  const lastWeekData = buildWeekData(lastWeekStart);

  return {
    allOrders: allOrders.map(serializeOrder),
    activeOrders: activeOrders.map(serializeOrder),
    pendingOrders: pendingOrders.map(serializeOrder),
    completedOrders: completedOrders.map(serializeOrder),
    totalPaid,
    currentWeekPaid,
    currentMonthPaid,
    weeklyData,
    lastWeekData,
  };
};

// get the orders for current month

export const fetchCurrentMonthOrders = async () => {
  const dbuser = await GetDBUser();
  if (!dbuser) {
    // Return empty data instead of throwing to prevent infinite loops
    return {
      currentMonth: {
        orders: [],
        totalOrders: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        cancelled: 0,
        totalPaid: 0,
      },
      lastMonth: {
        orders: [],
        totalOrders: 0,
        completed: 0,
        pending: 0,
        inProgress: 0,
        cancelled: 0,
        totalPaid: 0,
      },
    };
  }

  const now = new Date();

  // -------- CURRENT MONTH --------
  const currentFirstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentLastDay = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  // -------- LAST MONTH --------
  const lastFirstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastLastDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
    999
  );

  const getMonthStats = async (start: Date, end: Date) => {
    const [counts, revenue] = await Promise.all([
      getOrderStatusCountsInRange(start, end, dbuser.id),
      prisma.order.aggregate({
        where: {
          userId: dbuser.id,
          status: "completed",
          orderDate: { gte: start, lte: end },
        },
        _sum: { finalAmount: true },
      }),
    ]);

    return {
      orders: [],
      totalOrders: counts.total,
      completed: counts.completed,
      pending: counts.pending,
      processing: counts.processing,
      inProgress: counts.inProgress,
      cancelled: counts.cancelled,
      totalPaid: Number(revenue._sum.finalAmount ?? 0),
    };
  };

  // Keep these reads sequential for deployments using a single DB connection.
  const currentMonth = await getMonthStats(currentFirstDay, currentLastDay);
  const lastMonth = await getMonthStats(lastFirstDay, lastLastDay);

  return {
    currentMonth,   // ✅ this month data
    lastMonth,      // ✅ last month data
  };
};

// get Monthly orders for the current year

type MonthlyOrdersProps = {
  label: string;
  pending: number;
  completed: number;
  cancelled: number;
  inprogress: number;
  total: number;
};

export async function getMonthlyOrdersAction() {
  const dbuser = await GetDBUser();
  if (!dbuser) {
    // Return empty data instead of throwing to prevent infinite loops
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((label) => ({
      label,
      pending: 0,
      completed: 0,
      cancelled: 0,
      inprogress: 0,
      total: 0,
    }));
  }

  const currentYear = new Date().getFullYear();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const rows = await getOrderStatusCountsByMonth(currentYear, dbuser.id);
  const countsByMonth = new Map(rows.map((row) => [row.month, row]));

  const monthlyData: MonthlyOrdersProps[] = months.map((month, index) => {
    const row = countsByMonth.get(index + 1);

    return {
      label: month,
      pending: row?.pending ?? 0,
      completed: row?.completed ?? 0,
      cancelled: row?.cancelled ?? 0,
      inprogress: row?.inProgress ?? 0,
      total: row?.total ?? 0,
    };
  });

  return monthlyData;
}
