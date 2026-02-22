import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AddUserToDB } from "@/app/actions/user_action";
import {
  fetchCardsDataAndAllOrders,
  fetchCurrentMonthOrders,
} from "@/app/actions/order-action";
import OrdersLineChart from "@/components/charts/line-chart";
import OrderStatusPieChart from "@/components/charts/status-pie-chart";
import { ArrowUpRight, BarChart3, ChartLine, ChartPie, Pi, Table } from "lucide-react";
import { OrdersComparisonCard } from "@/components/charts/orders-comparison-chart";
import LatestOrdersTable from "@/components/latest-order-table";
import Link from "next/link";

export default async function MainPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) redirect("/sign-in");
  // ✅ Add or update user in DB
  await AddUserToDB();
  const { currentMonth, lastMonth } = await fetchCurrentMonthOrders();
  const { weeklyData, lastWeekData, allOrders } =
    await fetchCardsDataAndAllOrders();
    
  const latestThree = [...allOrders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);
  // console.log("last week orders", lastWeekData);
  const weekSeries = weeklyData.map((d) => ({
    label: d.label,
    total: d.total,
  }));

  const monthSeries = [
    { label: "W1", total: 60 },
    { label: "W2", total: 80 },
    { label: "W3", total: 72 },
    { label: "W4", total: 95 },
  ];

  const thisWeek = weeklyData.length;
  const lastWeek = lastWeekData.length;
  const thisMonth = currentMonth.totalOrders;
  const lastMonthData = lastMonth.totalOrders;

  return (
    <div className="text-center -mb-12">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2  gap-4 lg:gap-6 px-6">
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

          {weeklyData&& weeklyData.length > 0  ? (
            <OrdersLineChart data={weeklyData} />
          ) : (
            <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
               <BarChart3 className="w-10 h-10 mb-2 opacity-70" />
              No weekly data available
            </div>
          )}
        </div>
        <div
          className="w-full bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
         dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] flex-col       justify-center   items-center border-2 border-gray-200 dark:border-gray-600/70       rounded-xl   overflow-hidden  shadow p-6 h-fit pb-0 "
        >
          {/* for the current month orders status */}
          <div className="flex gap-2 items-center">
            <ChartPie className="w-5 h-5 text-blue-500" />
            <h4 className="text-[20px] lg:text-[22px] font-medium text-gray-800 dark:text-gray-200 text-left   ">
              Current month Order Status
            </h4>
          </div>

          {currentMonth ? (<OrderStatusPieChart PiChartData={currentMonth} />) :( <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
               <BarChart3 className="w-10 h-10 mb-2 opacity-70" />
              No monthly data available
            </div>)}
        </div>
        <div
          className="w-full flex-col bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
        dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] justify-center items-center border-2 border-gray-200 dark:border-gray-600/70 rounded-xl overflow-hidden  shadow   pb-0 "
        >
          <OrdersComparisonCard
            thisWeek={thisWeek}
            lastWeek={lastWeek}
            thisMonth={thisMonth}
            lastMonth={lastMonthData}
            weekSeries={weekSeries}
            monthSeries={monthSeries}
          />
        </div>
        <div
          className="w-full flex-col bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
        dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] justify-center items-center border-2 border-gray-200 dark:border-gray-600/70 rounded-xl overflow-hidden  shadow   pb-0 "
        >
        {latestThree ?(<LatestOrdersTable ordersData={latestThree} />):(<div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
               <BarChart3 className="w-10 h-10 mb-2 opacity-70" />
              No data available
            </div>)}  
        </div>
      </div>
      <Link
        href="/user-dashboard/orders"
        className="text-blue-600 w-full py-4 flex justify-center items-center group "
      >
        view all orders{" "}
        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] transform duration-200 " />
      </Link>
    </div>
  );
}
