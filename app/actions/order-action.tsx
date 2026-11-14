"use server";

import { prisma } from "@/lib/prisma";
import { invalidateOrderCaches } from "@/lib/cache/invalidate";
import { CACHE_TTL, cacheKeys } from "@/lib/cache/keys";
import { getOrSet } from "@/lib/cache/store";
import type { Order, OrderDetail } from "@/types/order";
import {
  orderDetailSelect,
  toOrderDetail,
} from "@/lib/order-mappers";
import { GetDBUser } from "./user_action";
import { predictPrice } from "@/lib/pricing/pricing-client";
import { sendOrderEmail } from "@/lib/email-notifications";
import { getOrderStatusCountsByMonth } from "@/lib/db-aggregations";

function toPricingSource(source: "rule_based" | "ml_model") {
  return source === "ml_model" ? "ML_MODEL" as const : "RULE_BASED" as const;
}

function toPricingConfidence(confidence: "low" | "medium" | "high") {
  return confidence.toUpperCase() as "LOW" | "MEDIUM" | "HIGH";
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
    await invalidateOrderCaches(dbUser.id);
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
    select: orderDetailSelect,
  });
  if (!order) throw new Error("Order not found");
  if (order.status !== "completed") throw new Error("Only completed orders can be reordered");
  return toOrderDetail(order);
}

export async function getUserOrdersForReorder(): Promise<OrderDetail[]> {
  const dbUser = await GetDBUser();
  if (!dbUser) return [];

  return getOrSet(
    cacheKeys.user.reorder(dbUser.id),
    CACHE_TTL.userReorder,
    async () => {
      const orders = await prisma.order.findMany({
        where: { userId: dbUser.id },
        orderBy: { orderDate: "desc" },
        select: orderDetailSelect,
      });
      return orders.map(toOrderDetail);
    }
  );
}

/** Load a single order owned by the signed-in user for detail dialogs. */
export async function getOrderById(
  orderId: string
): Promise<OrderDetail | null> {
  const dbUser = await GetDBUser();
  if (!dbUser) return null;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: dbUser.id },
    select: orderDetailSelect,
  });

  if (!order) return null;

  return toOrderDetail(order);
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

    await invalidateOrderCaches(dbUser.id);

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
