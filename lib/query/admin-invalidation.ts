"use client";

import type { QueryClient } from "@tanstack/react-query";

import type {
  AdminDashboardActivityPayload,
  AdminRevenueAnalyticsPayload,
  AdminStatsCardsPayload,
} from "@/app/schemas/admin-dashboard-schema";
import { getAdminDashboardData } from "@/lib/data/admin-dashboard";
import { queryKeys } from "@/lib/query/query-keys";

function adminKeys(adminId: string | undefined) {
  const id = adminId ?? "anonymous";
  // Build every key from the factory so a key-shape change cannot silently
  // leave invalidation pointing at a stale prefix.
  return {
    orders: queryKeys.admin.ordersRoot(id),
    stats: queryKeys.admin.stats(id),
    activity: queryKeys.admin.activity(id),
    revenue: queryKeys.admin.revenueRoot(id),
    users: queryKeys.admin.usersRoot(id),
    services: queryKeys.admin.servicesRoot(id),
  };
}

function invalidate(
  queryClient: QueryClient,
  keys: ReadonlyArray<readonly unknown[]>
) {
  for (const key of keys) {
    // Do not keep an in-flight request alive across an invalidation: its
    // response may predate the write and would then overwrite the refetch.
    void queryClient.invalidateQueries({ queryKey: key });
  }
}

function invalidateStale(
  queryClient: QueryClient,
  keys: ReadonlyArray<readonly unknown[]>
) {
  for (const key of keys) {
    void queryClient.invalidateQueries({
      queryKey: key,
      refetchType: "none",
    });
  }
}

/**
 * A local mutation and the Supabase row event it triggers both arrive within a
 * few hundred milliseconds. The mutation refetch is authoritative (it runs
 * after the server-side Redis invalidation), so the matching realtime echo is
 * suppressed to avoid fetching the same change twice.
 */
const ECHO_WINDOW_MS = 2_000;
const lastMutationSyncAt = new Map<string, number>();

export type AdminMutationTable = "Order" | "Service";

const scope = (adminId: string | undefined, table: AdminMutationTable) =>
  `${adminId ?? "anonymous"}:${table}`;

/** Call when a local mutation invalidates the cache. */
export function markAdminMutationSync(
  adminId: string | undefined,
  table: AdminMutationTable
) {
  lastMutationSyncAt.set(scope(adminId, table), Date.now());
}

/** True when a realtime event is the echo of our own recent mutation. */
export function shouldSkipRealtimeRefresh(
  adminId: string | undefined,
  table: AdminMutationTable,
  windowMs = ECHO_WINDOW_MS
) {
  const at = lastMutationSyncAt.get(scope(adminId, table));
  return typeof at === "number" && Date.now() - at < windowMs;
}

/**
 * Refresh the admin overview with one consolidated request instead of
 * invalidating stats, activity, and revenue separately. The payload is written
 * into the same three cache entries the page hydrates, so every widget keeps
 * its existing hook and query key.
 */
export async function refreshAdminOverviewQueries(
  queryClient: QueryClient,
  adminId: string | undefined
): Promise<boolean> {
  if (!adminId) return false;

  try {
    const data = await getAdminDashboardData();
    if (!data) return false;

    queryClient.setQueryData<AdminStatsCardsPayload>(
      queryKeys.admin.stats(adminId),
      { stats: data.stats, cards: data.statsCards }
    );
    queryClient.setQueryData<AdminDashboardActivityPayload>(
      queryKeys.admin.activity(adminId),
      {
        popularServices: data.popularServices,
        latestOrders: data.latestOrders,
      }
    );
    queryClient.setQueryData<AdminRevenueAnalyticsPayload>(
      queryKeys.admin.revenueAnalytics(adminId),
      {
        monthlyRevenue: data.monthlyRevenue,
        totalRevenue: data.stats.totalRevenue,
        todayRevenue: data.stats.todayRevenue,
        weekRevenue: data.stats.weekRevenue,
        monthRevenue: data.stats.monthRevenue,
      }
    );

    return true;
  } catch (error) {
    console.error("Admin overview refresh failed:", error);
    return false;
  }
}

/** An order write changes totals, analytics, lists, and per-user/service counts. */
export function invalidateAdminOrderQueries(
  queryClient: QueryClient,
  adminId: string | undefined
) {
  const keys = adminKeys(adminId);
  invalidate(queryClient, [
    keys.orders,
    keys.stats,
    keys.activity,
    keys.revenue,
    keys.users,
    keys.services,
  ]);
}

/** Mark the same keys stale without another network request. */
export function markAdminOrderQueriesStale(
  queryClient: QueryClient,
  adminId: string | undefined
) {
  const keys = adminKeys(adminId);
  invalidateStale(queryClient, [
    keys.orders,
    keys.stats,
    keys.activity,
    keys.revenue,
    keys.users,
    keys.services,
  ]);
}

export function markAdminServicesQueriesStale(
  queryClient: QueryClient,
  adminId: string | undefined
) {
  invalidateStale(queryClient, [adminKeys(adminId).services]);
}

export function invalidateAdminUsersQueries(
  queryClient: QueryClient,
  adminId: string | undefined
) {
  invalidate(queryClient, [adminKeys(adminId).users]);
}

export function invalidateAdminServicesQueries(
  queryClient: QueryClient,
  adminId: string | undefined
) {
  invalidate(queryClient, [adminKeys(adminId).services]);
}

export function invalidateAdminRevenueQueries(
  queryClient: QueryClient,
  adminId: string | undefined
) {
  invalidate(queryClient, [adminKeys(adminId).revenue]);
}
