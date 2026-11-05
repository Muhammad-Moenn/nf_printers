import { NextResponse } from "next/server";
import { GetDBUser } from "@/app/actions/user_action";
import { getMonthlyPaidAmount } from "@/app/actions/monthly-amount";
import {
  fetchCardsDataAndAllOrders,
  getMonthlyOrdersAction,
} from "@/app/actions/order-action";

export async function GET() {
  const user = await GetDBUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const monthlyTotal = await getMonthlyPaidAmount();
  const monthlyOrders = await getMonthlyOrdersAction();
  const { allOrders,activeOrders,
    pendingOrders,
    completedOrders,
    totalPaid,
    weeklyData, } = await fetchCardsDataAndAllOrders();

  return NextResponse.json({
    monthlyTotal,
    monthlyOrders,
    allOrders,
    activeOrders,
    pendingOrders,
    completedOrders,
    totalPaid,
    weeklyData,
  });
}
