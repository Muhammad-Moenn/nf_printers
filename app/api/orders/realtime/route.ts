import { NextRequest, NextResponse } from "next/server";
import { getMonthlyPaidAmount } from "@/app/actions/monthly-amount";
import {
  fetchCardsDataAndAllOrders,
  getMonthlyOrdersAction,
} from "@/app/actions/order-action";

export async function GET() {
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
