"use client";

import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import { useAdminRevenueAnalytics } from "@/lib/query/hooks/use-admin-dashboard";
import { queryKeys } from "@/lib/query/query-keys";

const RevenueAnalytics = dynamic(
  () => import("@/components/charts/admin-charts/revenue-analytics"),
  {
    ssr: false,
    loading: () => <RevenueAnalyticsSkeleton />,
  }
);

function RevenueAnalyticsSkeleton() {
  return (
    <div className="w-full animate-pulse" aria-hidden="true">
      <div className="mb-5 flex items-center gap-2">
        <div className="h-10 w-10 rounded-lg bg-muted/60" />
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-muted/60" />
          <div className="h-3 w-28 rounded bg-muted/40" />
        </div>
      </div>
      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="h-[70px] rounded-lg bg-muted/40" />
        <div className="h-[70px] rounded-lg bg-muted/40" />
        <div className="h-[70px] rounded-lg bg-muted/40" />
      </div>
      <div className="mb-2 h-4 w-40 rounded bg-muted/40" />
      <div className="h-52 rounded-lg bg-muted/30" />
    </div>
  );
}

function RealtimeRevenueAnalyticsClient({ adminId }: { adminId: string }) {
  const queryClient = useQueryClient();
  const revenueQuery = useAdminRevenueAnalytics(adminId);
  const data = revenueQuery.data;

  if (!data) {
    return null;
  }

  return (
    <RevenueAnalytics
      data={data.monthlyRevenue}
      todayRevenue={data.todayRevenue}
      weekRevenue={data.weekRevenue}
      monthRevenue={data.monthRevenue}
      isRefreshing={revenueQuery.isFetching}
      error={
        revenueQuery.isError ? "Unable to refresh revenue analytics." : null
      }
      onRefresh={() => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.admin.revenueAnalytics(adminId),
        });
      }}
    />
  );
}

export default RealtimeRevenueAnalyticsClient;
