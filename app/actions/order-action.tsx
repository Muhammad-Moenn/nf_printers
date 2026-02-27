"use server";

import { prisma } from "@/lib/prisma";
import { Order } from "@/types/order";
import { GetDBUser } from "./user_action";
import { toast } from "react-toastify";

export async function SaveOrder(order: Order | Order[]) {
  try {
    const dbUser = await GetDBUser();
    if (!dbUser) {
      return { success: false, error: "User not found in database" };
    }

    const orders = Array.isArray(order) ? order : [order];

    await prisma.order.createMany({
      data: orders.map((item) => ({
        userId: dbUser.id,
        product: item.product,
        service: item.service,
        quantity: item.quantity,
        amount: item.amount,
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
      })),
    });
    return {
      success: true,
    };
  } catch (error) {
    throw new Error("Failed to save order. Please try again.");
  }
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

        const updated = await prismaTx.order.update({
          where: { id: draft.id },
          data: {
            product: draft.product ?? existingOrder.product,
            service: draft.service ?? existingOrder.service,

            quantity:
              draft.quantity !== undefined
                ? draft.quantity
                : existingOrder.quantity,

            amount: draft.amount ?? existingOrder.amount,
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

  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
  lastWeekEnd.setHours(23, 59, 59, 999);

  // -------- CURRENT MONTH --------
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  // Helper to parse amounts
  const parseAmount = (amountStr: string) => {
    const clean = amountStr.replace(/[^\d.]/g, "");
    const amount = Number(clean);
    return isNaN(amount) ? 0 : amount;
  };

  // -------- FETCH ORDERS --------
  const allOrders = await prisma.order.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  const completedOrders = allOrders.filter((o) => o.status === "completed");
  const activeOrders = allOrders.filter((o) => o.status === "in_progress");
  const pendingOrders = allOrders.filter((o) => o.status === "pending");

  // -------- TOTALS --------
  const totalPaid = completedOrders.reduce((sum, o) => sum + parseAmount(o.amount), 0);

  const weekOrders = allOrders.filter(
    (o) => o.createdAt && o.createdAt >= startOfWeek && o.createdAt <= endOfWeek
  );
  const currentWeekPaid = weekOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + parseAmount(o.amount), 0);

  const monthOrders = allOrders.filter(
    (o) => o.createdAt && o.createdAt >= startOfMonth && o.createdAt <= endOfMonth
  );
  const currentMonthPaid = monthOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + parseAmount(o.amount), 0);

  // -------- BUILD WEEKLY DATA --------
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const buildWeekData = (orders: typeof allOrders, start: Date) => {
    const data: {
      label: string;
      total: number;
      completed: number;
      pending: number;
      cancelled: number;
    }[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(start);
      currentDay.setDate(start.getDate() + i);

      const dayOrders = orders.filter((o) => {
        const d = new Date(o.createdAt!);
        return (
          d.getFullYear() === currentDay.getFullYear() &&
          d.getMonth() === currentDay.getMonth() &&
          d.getDate() === currentDay.getDate()
        );
      });

      data.push({
        label: days[i],
        total: dayOrders.length,
        completed: dayOrders.filter((o) => o.status === "completed").length,
        pending: dayOrders.filter((o) => o.status === "pending").length,
        cancelled: dayOrders.filter((o) => o.status === "cancelled").length,
      });
    }

    return data;
  };

  const weeklyData = buildWeekData(weekOrders, startOfWeek);
  const lastWeekOrders = allOrders.filter(
    (o) => o.createdAt && o.createdAt >= lastWeekStart && o.createdAt <= lastWeekEnd
  );
  const lastWeekData = buildWeekData(lastWeekOrders, lastWeekStart);

  console.log("current totals:", totalPaid, currentWeekPaid, currentMonthPaid);

  return {
    allOrders,
    activeOrders,
    pendingOrders,
    completedOrders,
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
    const orders = await prisma.order.findMany({
      where: {
        userId: dbuser.id,
        orderDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        status: true,
        amount: true,
      },
    });

    const totalOrders = orders.length;
    const completed = orders.filter(o => o.status === "completed").length;
    const pending = orders.filter(o => o.status === "pending").length;
    const inProgress = orders.filter(o => o.status === "in_progress").length;
    const cancelled = orders.filter(o => o.status === "cancelled").length;

    const totalPaid = orders
      .filter(o => o.status === "completed")
      .reduce((sum, order) => {
        const clean = order.amount.replace(/[^\d.]/g, "");
        const amount = Number(clean);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    return {
      orders,
      totalOrders,
      completed,
      pending,
      inProgress,
      cancelled,
      totalPaid,
    };
  };

  // Run both queries
  const [currentMonth, lastMonth] = await Promise.all([
    getMonthStats(currentFirstDay, currentLastDay),
    getMonthStats(lastFirstDay, lastLastDay),
  ]);

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

  // Fetch user orders for current year
  const orders = await prisma.order.findMany({
    where: {
      userId: dbuser.id,
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lte: new Date(`${currentYear}-12-31`),
      },
    },
    select: {
      status: true,
      createdAt: true,
    },
  });

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

  const monthlyData: MonthlyOrdersProps[] = months.map((month) => ({
    label: month,
    pending: 0,
    completed: 0,
    cancelled: 0,
    inprogress: 0,
    total: 0,
  }));

  // Calculation logic
  orders.forEach((order) => {
    const monthIndex = new Date(order.createdAt).getMonth();
    const status = order.status as keyof Omit<
      MonthlyOrdersProps,
      "label" | "total"
    >;

    if (monthlyData[monthIndex][status] !== undefined) {
      monthlyData[monthIndex][status] += 1;
      monthlyData[monthIndex].total += 1;
    }
  });

  return monthlyData;
}
