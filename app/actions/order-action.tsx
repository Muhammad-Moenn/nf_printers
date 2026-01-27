"use server";

import { prisma } from "@/lib/prisma";
import { Order } from "@/types/order";
import { currentUser } from "@clerk/nextjs/server";
import { GetDBUser } from "./user_action";
import { Prisma } from "@prisma/client";

export async function SaveOrder(orderDraft: Order) {
  const user = await currentUser();
  if (!user) throw new Error("User not logged in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
  });
  if (!dbUser) {
    throw new Error("User not found in database");
  }
  const savedOrder = await prisma.order.create({
    data: {
      userId: dbUser.id,
      product: orderDraft.product,
      service: orderDraft.service,
      quantity: orderDraft.quantity, // ensure Int
      amount: orderDraft.amount, // ensure Float
      status: orderDraft.status || "pending",
      orderDate: orderDraft.orderDate
        ? new Date(orderDraft.orderDate)
        : new Date(),
      deliveryDate: orderDraft.deliveryDate
        ? new Date(orderDraft.deliveryDate)
        : null,
      paperType: orderDraft.paperType,
      size: orderDraft.size,
      gsm: orderDraft.gsm,
      colorMode: orderDraft.colorMode,
      sides: orderDraft.sides,
      finishingOptions: orderDraft.finishingOptions || [],
      designs: orderDraft.designs || [], // saves JSON array
      requirements: orderDraft.requirements,
      isReorder: orderDraft.isReorder || false,
    },
  });

  return savedOrder;
}

//  update the order

export async function UpdateOrder(orderId: string, orderDraft: Partial<Order>) {
  const user = await currentUser();
  if (!user) throw new Error("User not logged in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: user.id },
  });
  if (!dbUser) {
    throw new Error("User not found in database");
  }

  // 🔒 Ensure user owns the order
  const existingOrder = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: dbUser.id,
    },
  });

  if (!existingOrder) {
    throw new Error("Order not found or unauthorized");
  }
  const designsData =
    orderDraft.designs !== undefined
      ? (orderDraft.designs as Prisma.InputJsonValue)
      : undefined;
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      product: orderDraft.product ?? existingOrder.product,
      service: orderDraft.service ?? existingOrder.service,
      quantity: orderDraft.quantity ?? existingOrder.quantity,
      amount: orderDraft.amount ?? existingOrder.amount,
      status: orderDraft.status ?? "pending",

      orderDate: new Date(),
      deliveryDate: orderDraft.deliveryDate
        ? new Date(orderDraft.deliveryDate)
        : existingOrder.deliveryDate,

      paperType: orderDraft.paperType ?? existingOrder.paperType,
      size: orderDraft.size ?? existingOrder.size,
      gsm: orderDraft.gsm ?? existingOrder.gsm,
      colorMode: orderDraft.colorMode ?? existingOrder.colorMode,
      sides: orderDraft.sides ?? existingOrder.sides,

      finishingOptions:
        orderDraft.finishingOptions ?? existingOrder.finishingOptions,

      ...(designsData !== undefined && { designs: designsData }),
      requirements: orderDraft.requirements ?? existingOrder.requirements,

      isReorder: true, // 🔥 important flag
    },
  });

  return updatedOrder;
}

// fetch Crads and graph Data
export const fetchCardsDataAndAllOrders = async () => {
  const dbuser = await GetDBUser();
  if (!dbuser) {
    throw new Error("User not found in database");
  }

  // Fetch all orders for this user
  const allOrders = await prisma.order.findMany({
    where: { userId: dbuser.id },
  });

  // Calculate active, pending, completed
  const activeOrders = allOrders.filter((o) => o.status === "in_progress");
  const pendingOrders = allOrders.filter((o) => o.status === "pending");
  const completedOrders = allOrders.filter((o) => o.status === "completed");

  // Total paid from completed orders
  const totalPaid = completedOrders.reduce((sum, order) => {
    const clean = order.amount.replace(/[^\d.]/g, "");
    const amount = Number(clean);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  // Generate weekly data dynamically
  const weeklyData: {
    label: string;
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  }[] = [];

  // Days of week in order
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < 7; i++) {
    const dayOrders = allOrders.filter((o) => o.orderDate?.getDay() === i);

    weeklyData.push({
      label: days[i],
      total: dayOrders.length,
      completed: dayOrders.filter((o) => o.status === "completed").length,
      pending: dayOrders.filter((o) => o.status === "pending").length,
      cancelled: dayOrders.filter((o) => o.status === "cancelled").length,
    });
  }

  return {
    allOrders,
    activeOrders,
    pendingOrders,
    completedOrders,
    totalPaid,
    weeklyData,
  };
};

// get the orders for current month

export const fetchCurrentMonthOrders = async () => {
  const dbuser = await GetDBUser();
  if (!dbuser) {
    throw new Error("User not found in database");
  }

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  // Fetch all orders of current month
  const monthOrders = await prisma.order.findMany({
    where: {
      userId: dbuser.id,
      orderDate: {
        gte: firstDay,
        lte: lastDay,
      },
    },
    select: {
      status: true,
      amount: true,
    },
  });

  // Count orders by status
  const totalOrders = monthOrders.length;
  const completed = monthOrders.filter((o) => o.status === "completed").length;
  const pending = monthOrders.filter((o) => o.status === "pending").length;
  const inProgress = monthOrders.filter(
    (o) => o.status === "in_progress"
  ).length;
  const cancelled = monthOrders.filter((o) => o.status === "cancelled").length;

  // Total paid in this month
  const totalPaid = monthOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, order) => {
      const clean = order.amount.replace(/[^\d.]/g, "");
      const amount = Number(clean);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  return {
    totalOrders,
    completed,
    pending,
    inProgress,
    cancelled,
    totalPaid,
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
    throw new Error("User not found in database");
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
