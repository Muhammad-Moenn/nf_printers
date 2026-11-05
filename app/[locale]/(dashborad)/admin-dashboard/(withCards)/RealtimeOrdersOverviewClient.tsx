"use client";

import { useEffect } from "react";

import type { AdminOrdersOverviewPayload } from "@/app/schemas/admin-dashboard-schema";
import { useAdminDashboardStore } from "@/app/store/admin-dashboard-store";
import OrdersOverview from "@/components/charts/admin-charts/orders-overview";
import { supabase } from "@/lib/supabaseClient";

function RealtimeOrdersOverviewClient({
  initialData,
}: {
  initialData: AdminOrdersOverviewPayload;
}) {
  const ordersOverview = useAdminDashboardStore(
    (state) => state.ordersOverview
  );
  const isRefreshing = useAdminDashboardStore(
    (state) => state.isRefreshingOrdersOverview
  );
  const error = useAdminDashboardStore(
    (state) => state.ordersOverviewError
  );
  const setOrdersOverviewPayload = useAdminDashboardStore(
    (state) => state.setOrdersOverviewPayload
  );
  const refreshOrdersOverview = useAdminDashboardStore(
    (state) => state.refreshOrdersOverview
  );

  const visibleData = ordersOverview ?? initialData;

  useEffect(() => {
    setOrdersOverviewPayload(initialData);
    void refreshOrdersOverview({ force: true });
  }, [initialData, refreshOrdersOverview, setOrdersOverviewPayload]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-overview-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
        },
        () => refreshOrdersOverview({ force: true })
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [refreshOrdersOverview]);

  return (
    <OrdersOverview
      data={visibleData.data}
      isRefreshing={isRefreshing}
      error={error}
      onRefresh={() => refreshOrdersOverview({ force: true })}
    />
  );
}

export default RealtimeOrdersOverviewClient;
