import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { AdminOverviewRealtimeSync } from "@/components/admin-realtime-sync";
import { requireAdminPage } from "@/lib/auth-guards";
import { getAdminDashboardData } from "@/lib/data/admin-dashboard";
import { makeQueryClient } from "@/lib/query/query-client";
import { queryKeys } from "@/lib/query/query-keys";

import RealtimeAdminCardSectionClient from "./RealtimeAdminSectionCardClient";
import RealtimeAdminCustomerActivityClient from "./RealtimeAdminCustomerActivityClient";
import RealtimeLatestOrdersClient from "./RealtimeLatestOrdersClient";
import RealtimeOrdersOverviewClient from "./RealtimeOrdersOverviewClient";
import RealtimePopularProductsClient from "./RealtimePopularProductsClient";
import RealtimeRevenueAnalyticsClient from "./RealtimeRevenueAnalyticsClient";

export const dynamic = "force-dynamic";

export default async function AdminMainPage() {
  const user = await requireAdminPage();

  const dashboardData = await getAdminDashboardData();
  if (!dashboardData) redirect("/sign-in");

  const { stats } = dashboardData;

  // One server render seeds every overview query, so the client renders from
  // cache and refetches only when realtime or staleTime says so.
  const queryClient = makeQueryClient();
  queryClient.setQueryData(queryKeys.admin.stats(user.id), {
    stats,
    cards: dashboardData.statsCards,
  });
  queryClient.setQueryData(queryKeys.admin.activity(user.id), {
    popularServices: dashboardData.popularServices,
    latestOrders: dashboardData.latestOrders,
  });
  queryClient.setQueryData(queryKeys.admin.revenueAnalytics(user.id), {
    monthlyRevenue: dashboardData.monthlyRevenue,
    totalRevenue: stats.totalRevenue,
    todayRevenue: stats.todayRevenue,
    weekRevenue: stats.weekRevenue,
    monthRevenue: stats.monthRevenue,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminOverviewRealtimeSync adminId={user.id} />
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

        <RealtimeAdminCardSectionClient adminId={user.id} />

        <div className="grid w-full grid-cols-12 gap-4 lg:gap-6">
          <div className="col-span-12 overflow-hidden rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-4 pb-0 shadow dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)] xl:col-span-8">
            <RealtimeRevenueAnalyticsClient adminId={user.id} />
          </div>

          <div className="col-span-12 overflow-hidden rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-4 shadow dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)] xl:col-span-4">
            <RealtimeOrdersOverviewClient adminId={user.id} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <RealtimeAdminCustomerActivityClient adminId={user.id} />
          <RealtimePopularProductsClient adminId={user.id} />
        </div>

        <div className="mt-6">
          <RealtimeLatestOrdersClient adminId={user.id} />
        </div>
      </div>
    </HydrationBoundary>
  );
}
