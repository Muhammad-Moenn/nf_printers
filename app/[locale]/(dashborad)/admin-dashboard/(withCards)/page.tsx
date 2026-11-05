import { redirect } from "next/navigation";
import { getAdminDashboardData } from "@/app/actions/admin-dashboard-action";
import RealtimeAdminCardSectionClient from "./RealtimeAdminSectionCardClient";
import RealtimeAdminCustomerActivityClient from "./RealtimeAdminCustomerActivityClient";
import RealtimeLatestOrdersClient from "./RealtimeLatestOrdersClient";
import RealtimeOrdersOverviewClient from "./RealtimeOrdersOverviewClient";
import RealtimePopularProductsClient from "./RealtimePopularProductsClient";
import RealtimeRevenueAnalyticsClient from "./RealtimeRevenueAnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AdminMainPage() {
  const dashboardData = await getAdminDashboardData();

  if (!dashboardData) {
    redirect("/sign-in");
  }

  return (
    <div className="w-full px-6">
      <div className="mb-6 flex flex-col gap-1 text-left">
        <h1 className="text-2xl font-semibold text-foreground dark:text-neutral-100">
          Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Orders, revenue, customers, and operational activity across NF
          Printers.
        </p>
      </div>

      <RealtimeAdminCardSectionClient
        payload={{
          stats: dashboardData.stats,
          cards: dashboardData.statsCards,
        }}
      />

      <div className="grid w-full grid-cols-12 gap-4 lg:gap-6">
        <div className="col-span-12 overflow-hidden rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-4 pb-0 shadow dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)] xl:col-span-8">
          <RealtimeRevenueAnalyticsClient
            initialData={{
              monthlyRevenue: dashboardData.monthlyRevenue,
              totalRevenue: dashboardData.stats.totalRevenue,
              todayRevenue: dashboardData.stats.todayRevenue,
              weekRevenue: dashboardData.stats.weekRevenue,
              monthRevenue: dashboardData.stats.monthRevenue,
            }}
          />
        </div>

        <div className="col-span-12 overflow-hidden rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-4 shadow dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)] xl:col-span-4">
          <RealtimeOrdersOverviewClient
            initialData={{
              data: dashboardData.orderOverview,
              totalOrders: dashboardData.stats.totalOrders,
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RealtimeAdminCustomerActivityClient initialStats={dashboardData.stats} />
        <RealtimePopularProductsClient
          initialData={dashboardData.popularServices}
        />
      </div>

      <div className="mt-6">
        <RealtimeLatestOrdersClient
          initialOrders={dashboardData.latestOrders}
        />
      </div>
    </div>
  );
}
