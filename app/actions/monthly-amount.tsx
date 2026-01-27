import { prisma } from "@/lib/prisma";
import { GetDBUser } from "./user_action";

export async function getMonthlyPaidAmount() {
  const dbUser = await GetDBUser();
  if (!dbUser) throw new Error("User not found");

  const year = new Date().getFullYear();

  const orders = await prisma.order.findMany({
    where: {
      userId: dbUser.id,
      status: "completed",
      orderDate: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    },
    select: {
      amount: true,
      orderDate: true,
    },
  });

  // Initialize all months with 0
  const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString("en", { month: "short" }),
    total: 0,
  }));

  orders.forEach((order) => {
    if (!order.orderDate) return;

    const monthIndex = order.orderDate.getMonth();
    const cleanAmount = Number(order.amount.replace(/[^\d.]/g, ""));
    if (!isNaN(cleanAmount)) {
      monthlyTotals[monthIndex].total += cleanAmount;
    }
  });

  return monthlyTotals;
}