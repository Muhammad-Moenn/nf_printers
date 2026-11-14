"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, ChartPie, Lightbulb } from "lucide-react";

import OrdersOverTimePanel from "@/components/charts/orders-over-time-panel";
import OrderStatusPieChart from "@/components/charts/status-pie-chart";
import { OrdersComparisonCard } from "@/components/charts/orders-comparison-chart";
import LatestOrdersTable from "@/components/latest-order-table";
import {
  EMPTY_ORDERS_REALTIME_DATA,
  useOrdersData,
} from "@/lib/query/hooks/use-orders";

const panelClass =
  "min-w-0 overflow-hidden rounded-lg border border-primary-border bg-card shadow-[var(--shadow-sm)] dark:border-on-color/10 dark:bg-card";

export default function RealtimeDashboardOverviewClient({
  userId,
}: {
  userId: string;
}) {
  const { data } = useOrdersData(userId);
  const payload = data ?? EMPTY_ORDERS_REALTIME_DATA;
  const {
    weeklyData,
    lastWeekData,
    recentOrders,
    orderSeries,
    monthSeries,
    monthComparison,
  } = payload;
  const { currentMonth, lastMonth } = monthComparison;
  const latestThree = recentOrders.slice(0, 3);
  const weeklyTotal = weeklyData.reduce(
    (sum, day) => sum + (day.total || 0),
    0
  );
  const lastWeekTotal = lastWeekData.reduce(
    (sum, day) => sum + (day.total || 0),
    0
  );
  const weekSeries = weeklyData.map((day) => ({
    label: day.label,
    total: day.total,
  }));
  const ordersOverTime = orderSeries;

  return (
    <main className="mx-auto w-full max-w-[1600px] space-y-3 px-4 pb-2 sm:px-6 lg:px-8">
      <section className="grid min-w-0 gap-3 xl:grid-cols-2">
        <OrdersOverTimePanel data={ordersOverTime} />

        <article className={`${panelClass} p-4 sm:p-5`}>
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
              <ChartPie className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground dark:text-neutral-100 sm:text-lg">
                Current month order status
              </h2>
            </div>
          </div>
          {currentMonth.totalOrders ? (
            <div className="min-h-[150px]">
              <OrderStatusPieChart PiChartData={currentMonth} />
            </div>
          ) : (
            <div className="flex min-h-[150px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground dark:text-neutral-400">
              <BarChart3 className="h-8 w-8 opacity-60" />
              No orders to report this month
            </div>
          )}
        </article>
      </section>

      <section className="grid min-w-0 gap-3 xl:grid-cols-2">
        <div className={panelClass}>
          <OrdersComparisonCard
            thisWeek={weeklyTotal}
            lastWeek={lastWeekTotal}
            thisMonth={currentMonth.totalOrders}
            lastMonth={lastMonth.totalOrders}
            weekSeries={weekSeries}
            monthSeries={monthSeries}
          />
        </div>
        <div className={panelClass}>
          <LatestOrdersTable
            ordersData={latestThree}
            dashboardPath="user-dashboard"
            userId={userId}
            compactDashboard
          />
        </div>
      </section>

      <aside className="flex flex-col gap-4 rounded-lg border border-primary-border bg-primary-soft/70 p-4 dark:border-primary/15 dark:bg-primary/[0.07] sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-card text-warning-text shadow-sm dark:bg-card/10">
            <Lightbulb className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground dark:text-neutral-100">
              A smoother way to print
            </h2>
            <p className="mt-1 text-sm text-muted-foreground dark:text-neutral-300">
              Place an order and follow its progress from your dashboard.
            </p>
          </div>
        </div>
        <Link
          href="/user-dashboard/new-order"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-on-color shadow-sm transition hover:bg-primary"
        >
          Start new order <ArrowRight className="h-4 w-4" />
        </Link>
      </aside>
    </main>
  );
}
