"use client";

import dynamic from "next/dynamic";

import { useAdminActivity } from "@/lib/query/hooks/use-admin-dashboard";

const PopularProducts = dynamic(
  () => import("@/components/charts/admin-charts/popular-products"),
  {
    ssr: false,
    loading: () => <PopularProductsSkeleton />,
  }
);

function PopularProductsSkeleton() {
  return (
    <div className="w-full animate-pulse" aria-hidden="true">
      <div className="mb-5 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-40 rounded bg-muted/60" />
          <div className="h-3 w-24 rounded bg-muted/40" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-muted/40" />
      </div>
      <div className="h-64 rounded-lg bg-muted/30" />
    </div>
  );
}

export default function RealtimePopularProductsClient({
  adminId,
}: {
  adminId: string;
}) {
  const activityQuery = useAdminActivity(adminId);
  const popularServices = activityQuery.data?.popularServices ?? [];
  const isPending = activityQuery.isFetching;
  const error = activityQuery.isError
    ? "Unable to refresh popular products."
    : null;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-4 shadow dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]">
      <PopularProducts data={popularServices} />
      {(isPending || error) && (
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          {isPending ? "Refreshing popular products..." : error}
        </p>
      )}
    </div>
  );
}
