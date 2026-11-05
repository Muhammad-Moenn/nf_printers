"use client";

import { useEffect } from "react";

import { useAdminDashboardStore } from "@/app/store/admin-dashboard-store";
import type { AdminRevenueAnalyticsPayload } from "@/app/schemas/admin-dashboard-schema";
import RevenueAnalytics from "@/components/charts/admin-charts/revenue-analytics";
import { supabase } from "@/lib/supabaseClient";

function RealtimeRevenueAnalyticsClient({
  initialData,
}: {
  initialData: AdminRevenueAnalyticsPayload;
}) {
  const revenueAnalytics = useAdminDashboardStore(
    (state) => state.revenueAnalytics
  );
  const isRefreshing = useAdminDashboardStore(
    (state) => state.isRefreshingRevenue
  );
  const error = useAdminDashboardStore((state) => state.revenueError);
  const setRevenueAnalyticsPayload = useAdminDashboardStore(
    (state) => state.setRevenueAnalyticsPayload
  );
  const refreshRevenueAnalytics = useAdminDashboardStore(
    (state) => state.refreshRevenueAnalytics
  );

  const visibleData = revenueAnalytics ?? initialData;

  useEffect(() => {
    setRevenueAnalyticsPayload(initialData);
    void refreshRevenueAnalytics({ force: true });
  }, [initialData, refreshRevenueAnalytics, setRevenueAnalyticsPayload]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-revenue-analytics-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
        },
        () => refreshRevenueAnalytics({ force: true })
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [refreshRevenueAnalytics]);

  return (
    <RevenueAnalytics
      data={visibleData.monthlyRevenue}
      todayRevenue={visibleData.todayRevenue}
      weekRevenue={visibleData.weekRevenue}
      monthRevenue={visibleData.monthRevenue}
      isRefreshing={isRefreshing}
      error={error}
      onRefresh={() => refreshRevenueAnalytics({ force: true })}
    />
  );
}

export default RealtimeRevenueAnalyticsClient;
