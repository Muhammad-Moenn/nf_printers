"use client";

import { BarChart3 } from "lucide-react";
import dynamic from "next/dynamic";

import { useAdminActivity } from "@/lib/query/hooks/use-admin-dashboard";

const LatestOrdersTable = dynamic(() => import("@/components/latest-order-table"), {
  ssr: false,
  loading: () => <LatestOrdersSkeleton />,
});

function LatestOrdersSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="w-full animate-pulse overflow-hidden rounded-lg border border-border/80 bg-card"
    >
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted/60" />
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-muted/60" />
            <div className="h-3 w-40 rounded bg-muted/40" />
          </div>
        </div>
        <div className="h-9 w-32 rounded-md bg-muted/40" />
      </div>
      <div className="space-y-3 p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-12 rounded bg-muted/30" />
        ))}
      </div>
    </div>
  );
}

export default function RealtimeLatestOrdersClient({
  adminId,
}: {
  adminId: string;
}) {
  const activityQuery = useAdminActivity(adminId);
  const latestOrders = activityQuery.data?.latestOrders ?? [];
  const isPending = activityQuery.isFetching;
  const error = activityQuery.isError
    ? "Unable to refresh latest orders."
    : null;

  return (
    <div className="overflow-hidden rounded-lg  pb-0 ">
      {(isPending || error) && (
        <div className="border-b border-border px-6 py-3 text-xs font-medium text-muted-foreground dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
          {isPending ? "Refreshing latest orders..." : error}
        </div>
      )}

      {latestOrders.length ? (
        <LatestOrdersTable ordersData={latestOrders} darkPalette="services" />
      ) : (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <BarChart3 className="h-10 w-10 opacity-70" />
          No orders available
        </div>
      )}
    </div>
  );
}
