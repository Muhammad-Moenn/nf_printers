import { getMonthlyPaidAmount } from "@/app/actions/monthly-amount";
import { fetchCardsDataAndAllOrders, getMonthlyOrdersAction } from "@/app/actions/order-action";
import RealtimeOrdersClient from "./RealtimeOrdersClient";

export default async function OrderPage() {
  const [monthlyTotal, monthlyOrders, { allOrders }] = await Promise.all([
    getMonthlyPaidAmount(),
    getMonthlyOrdersAction(),
    fetchCardsDataAndAllOrders(),
  ]);

  return (
    <RealtimeOrdersClient
      initialMonthlyTotal={monthlyTotal}
      initialMonthlyOrders={monthlyOrders}
      initialOrders={allOrders as unknown as import("@/types/order").Order[]}
    />
  );
}
