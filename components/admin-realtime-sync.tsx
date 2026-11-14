"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef } from "react";

import {
  invalidateAdminOrderQueries,
  invalidateAdminRevenueQueries,
  invalidateAdminServicesQueries,
  invalidateAdminUsersQueries,
  markAdminOrderQueriesStale,
  markAdminServicesQueriesStale,
  refreshAdminOverviewQueries,
  shouldSkipRealtimeRefresh,
} from "@/lib/query/admin-invalidation";
import { useRealtimeTables, type RealtimeTable } from "@/lib/realtime-bus";

export function AdminOverviewRealtimeSync({ adminId }: { adminId: string }) {
  const queryClient = useQueryClient();
  const refreshInFlight = useRef(false);
  const refreshQueued = useRef(false);

  const refresh = useCallback(() => {
    // One consolidated request per event. If another event lands while the
    // request is in flight, run exactly one follow-up instead of overlapping.
    if (refreshInFlight.current) {
      refreshQueued.current = true;
      return;
    }

    refreshInFlight.current = true;
    void (async () => {
      try {
        do {
          refreshQueued.current = false;
          await refreshAdminOverviewQueries(queryClient, adminId);
        } while (refreshQueued.current);
      } finally {
        refreshInFlight.current = false;
      }
    })();
  }, [queryClient, adminId]);

  useRealtimeTables(
    "admin-dashboard-realtime",
    ["Order", "User"] as const,
    refresh,
    { enabled: Boolean(adminId) }
  );

  return null;
}

export function AdminOrdersRealtimeSync({ adminId }: { adminId: string }) {
  const queryClient = useQueryClient();
  const refresh = useCallback(
    (table: RealtimeTable) => {
      if (table !== "Order") return;

      // The mutation already refetched. Mark the remaining admin caches stale
      // without issuing a second request for the echo event.
      if (shouldSkipRealtimeRefresh(adminId, "Order")) {
        markAdminOrderQueriesStale(queryClient, adminId);
        return;
      }

      invalidateAdminOrderQueries(queryClient, adminId);
    },
    [queryClient, adminId]
  );

  useRealtimeTables("admin-orders-page", ["Order"] as const, refresh, {
    enabled: Boolean(adminId),
  });

  return null;
}

export function AdminUsersRealtimeSync({ adminId }: { adminId: string }) {
  const queryClient = useQueryClient();
  const refresh = useCallback(() => {
    invalidateAdminUsersQueries(queryClient, adminId);
  }, [queryClient, adminId]);

  useRealtimeTables(
    "admin-users-page",
    ["User", "Order"] as const,
    refresh,
    { enabled: Boolean(adminId) }
  );

  return null;
}

export function AdminServicesRealtimeSync({ adminId }: { adminId: string }) {
  const queryClient = useQueryClient();
  const refresh = useCallback(
    (table: RealtimeTable) => {
      if (table === "Service" && shouldSkipRealtimeRefresh(adminId, "Service")) {
        markAdminServicesQueriesStale(queryClient, adminId);
        return;
      }

      invalidateAdminServicesQueries(queryClient, adminId);
    },
    [queryClient, adminId]
  );

  useRealtimeTables(
    "admin-services-page",
    ["Service", "Order"] as const,
    refresh,
    { enabled: Boolean(adminId) }
  );

  return null;
}

export function AdminRevenueRealtimeSync({ adminId }: { adminId: string }) {
  const queryClient = useQueryClient();
  const refresh = useCallback(() => {
    invalidateAdminRevenueQueries(queryClient, adminId);
  }, [queryClient, adminId]);

  useRealtimeTables(
    "admin-revenue-page",
    ["Order", "Payment", "Expense"] as const,
    refresh,
    { enabled: Boolean(adminId) }
  );

  return null;
}
