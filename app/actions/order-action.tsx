"use server";

import { prisma } from "@/lib/prisma";
import { Order } from "@/types/order";
import { GetDBUser } from "./user_action";

export async function SaveOrder(
  prevState: { success?: boolean; error?: string ,pending?:boolean},
  formData: FormData
) {
  try {
    const dbUser= await GetDBUser();
    if (!dbUser) {
      return { success: false, error: "User not found in database" };
    }

    const orderData = formData.get("order");
    if (!orderData || typeof orderData !== 'string') {
      return { success: false, error: "Invalid order data" };
    }

    let order;
    try {
      order = JSON.parse(orderData);
    } catch (parseError) {
      return { success: false, error: "Invalid JSON format" };
    }

    const savedOrder = await prisma.order.create({
    data: {
      userId: dbUser.id,
      product: order.product,
      service: order.service,
      quantity: order.quantity, // ensure Int
      amount: order.amount, // ensure Float
      status: order.status || "pending",
      orderDate: order.orderDate
        ? new Date(order.orderDate)
        : new Date(),
      deliveryDate: order.deliveryDate
        ? new Date(order.deliveryDate)
        : null,
      paperType: order.paperType,
      size: order.size,
      gsm: order.gsm,
      colorMode: order.colorMode,
      sides: order.sides,
      finishingOptions: order.finishingOptions || [],
      designs: order.designs || [], // saves JSON array
      requirements: order.requirements,
      isReorder: order.isReorder || false,
    },
  });
    if (!savedOrder) {
      return { success: false, error: "Failed to save order" };
    }
    return { success: true};
  } catch (error) {
    return { success: false, error: "Failed to save order. Please try again." };
  }
}

//  update the order

export async function UpdateOrder(orderId: string, orderDraft: Partial<Order>) {
  try {
    const dbUser= await GetDBUser();
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
      ? orderDraft.designs
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
  } catch (error) {
    throw new Error("Failed to update order. Please try again.");
  }
}

// fetch Crads and graph Data
export const fetchCardsDataAndAllOrders = async () => {
  const dbUser= await GetDBUser();
  if (!dbUser) {
    throw new Error("User not found in database");
  }

  // Fetch all orders for this user
  const allOrders = await prisma.order.findMany({
    where: { userId: dbUser.id },
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
