import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AddUserToDB } from "@/app/actions/user_action";
import {
  fetchCardsDataAndAllOrders,
  fetchCurrentMonthOrders,
} from "@/app/actions/order-action";
import OrdersLineChart from "@/components/charts/line-chart";
import OrderStatusPieChart from "@/components/charts/status-pie-chart";
import RecentActivities from "@/components/recently-avtivies";

export default async function MainPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) redirect("/sign-in");
  // ✅ Add or update user in DB
  await AddUserToDB();
  const { weeklyData } = await fetchCardsDataAndAllOrders();
  const PiChartData = await fetchCurrentMonthOrders();

  return (
    <div>
      {/* <SectionCards cards={cards}/> */}
      <div className="w-full flex flex-col lg:flex-row gap-6 lg:gap-10">
        <div className="flex flex-col   -ml-6 lg:-ml-0 p-4   w-full ">
          <h4 className="text-[20px] lg:text-[22px] font-medium text-gray-800 dark:text-gray-200 text-left  p-7 py-5 -mt-4">
            Orders Over Time
          </h4>
          <OrdersLineChart data={weeklyData} />
        </div>
        <div className="w-full flex-col">
          {/* for the current month orders status */}
          <h4 className="text-[20px] lg:text-[22px] font-medium text-gray-800 dark:text-gray-200 text-left  p-5 py-5 ">
            Current month Order Status
          </h4>
          <OrderStatusPieChart PiChartData={PiChartData} />
        </div>
      </div>
      <RecentActivities />
    </div>
  );
}
