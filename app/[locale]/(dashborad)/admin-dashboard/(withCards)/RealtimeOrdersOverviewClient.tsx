"use client";

import { useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";

import type { OrderOverviewItem } from "@/app/schemas/admin-dashboard-schema";
import { useAdminStats } from "@/lib/query/hooks/use-admin-dashboard";
import { queryKeys } from "@/lib/query/query-keys";

const OrdersOverview = dynamic(
  () => import("@/components/charts/admin-charts/orders-overview"),
  {
    ssr: false,
    loading: () => <OrdersOverviewSkeleton />,
  }
);

function OrdersOverviewSkeleton() {
  return (
    <div className="w-full animate-pulse" aria-hidden="true">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-muted/60" />
          <div className="space-y-2">
            <div className="h-5 w-40 rounded bg-muted/60" />
            <div className="h-3 w-28 rounded bg-muted/40" />
          </div>
        </div>
        <div className="h-9 w-9 rounded-md bg-muted/40" />
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="h-44 w-44 rounded-full bg-muted/30" />
        <div className="w-full space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-4 rounded bg-muted/40" />
          ))}
        </div>
      </div>
    </div>
  );
}

function RealtimeOrdersOverviewClient({ adminId }: { adminId: string }) {
  const queryClient = useQueryClient();
  const statsQuery = useAdminStats(adminId);
  const stats = statsQuery.data?.stats;

  const data: OrderOverviewItem[] = stats
    ? [
        {
          name: "Completed",
          value: stats.completedOrders,
          color: "var(--success)",
        },
        {
          name: "In Progress",
          value: stats.inProgressOrders,
          color: "var(--info)",
        },
        {
          name: "Processing",
          value: stats.processingOrders,
          color: "var(--violet)",
        },
        {
          name: "Pending",
          value: stats.pendingOrders,
          color: "var(--warning)",
        },
        {
          name: "Cancelled",
          value: stats.cancelledOrders,
          color: "var(--destructive)",
        },
      ]
    : [];

  return (
    <OrdersOverview
      data={data}
      isRefreshing={statsQuery.isFetching}
      error={statsQuery.isError ? "Unable to refresh order overview." : null}
      onRefresh={() => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.admin.stats(adminId),
        });
      }}
    />
  );
}

export default RealtimeOrdersOverviewClient;
