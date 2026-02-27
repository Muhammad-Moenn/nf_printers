"use client";
import { getMonthlyPaidAmount } from "@/app/actions/monthly-amount";
import {
  fetchCardsDataAndAllOrders,
  getMonthlyOrdersAction,
} from "@/app/actions/order-action";
import OrdersLineChart from "@/components/charts/line-chart";
import MonthlyPaidChart from "@/components/charts/simple-areaChart";
import OrderTable from "@/components/order-table";
import { supabase } from "@/lib/supabaseClient";
import { BarChart3, ChartLine } from "lucide-react";
import { useEffect, useState } from "react";
type Props = {
  initialMonthlyTotal: any[];
  initialMonthlyOrders: any[];
  initialOrders: any[];
};
function RealtimeAdminOrdersClient({
  initialMonthlyTotal,
  initialMonthlyOrders,
  initialOrders,
}: Props) {
  const [monthlyTotal, setMonthlyTotal] = useState(initialMonthlyTotal);
  const [monthlyOrders, setMonthlyOrders] = useState(initialMonthlyOrders);
  const [orders, setOrders] = useState(initialOrders);

  const refetch = async () => {
    const res = await fetch("/api/orders/realtime");
    const data = await res.json();

    setMonthlyTotal(data.monthlyTotal);
    setMonthlyOrders(data.monthlyOrders);
    setOrders(data.allOrders);
  };
  const Is_monthlyTotal=Array.isArray(monthlyTotal)
  ? monthlyTotal.reduce((sum, day) => sum + (day.total || 0), 0)
  : 0;
  const Is_monthlyTotalOrders=Array.isArray(monthlyOrders)
  ? monthlyOrders.reduce((sum, day) => sum + (day.total || 0), 0)
  : 0;
  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order", // <-- IMPORTANT
        },
        (payload) => {
          // console.log("🔥 Realtime Event:", payload);
          refetch();
        }
      )
      .subscribe((status) => {
        // console.log("Subscription status:", status);
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="">
      {/* <SectionCards cards={cards}/> */}
      <div className="px-4  md:px-6 grid grid-cols-1 lg:grid-cols-2  overflow-hidden  gap-4">
        <div
          className="flex flex-col gap-6   p-6 bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
        dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e]  w-full     border-1 border-gray-300/60 dark:border-gray-600/70 rounded-xl  overflow-hidden  shadow-sm h-fit "
        >
          <div className="flex gap-2 items-center">
            <ChartLine className="w-5 h-5 text-blue-500" />
            <h4 className="text-[20px] lg:text-[22px] font-medium text-gray-800 dark:text-gray-200 text-left   ">
              Orders Over Time
            </h4>
          </div>
          {Is_monthlyTotalOrders ? (
            <OrdersLineChart data={monthlyOrders} />
          ) : (
            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
              <BarChart3 className="w-10 h-10 mb-2 opacity-70" />
              No data available
            </div>
          )}
        </div>
        <div
          className="flex flex-col gap-6   p-6 bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
        dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e]  w-full     border-1 border-gray-300/60 dark:border-gray-600/70 rounded-xl  overflow-hidden  shadow-sm h-fit "
        >
          <div className="flex gap-2 items-center">
            <ChartLine className="w-5 h-5 text-blue-500" />
            <h4 className="text-[20px] lg:text-[22px] font-medium text-gray-800 dark:text-gray-200 text-left   ">
              Orders Over Time
            </h4>
          </div>
          {Is_monthlyTotal ? (
            <MonthlyPaidChart data={monthlyTotal} />
          ) : (
            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
              <BarChart3 className="w-10 h-10 mb-2 opacity-70" />
              No data available
            </div>
          )}
        </div>
      </div>
      <h2 className="px-6 text-2xl font-semibold mb-4 mt-10 text-gray-800 dark:text-gray-200">
        My Orders
      </h2>
      {orders ? (
        <OrderTable ordersData={orders} />
      ) : (
        <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
          <BarChart3 className="w-10 h-10 mb-2 opacity-70" />
          No data available
        </div>
      )}
    </div>
  );
}

export default RealtimeAdminOrdersClient;
