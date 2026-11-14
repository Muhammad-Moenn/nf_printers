"use client";

import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";

import type { AdminOrdersPagePayload } from "@/app/schemas/admin-dashboard-schema";
import { getAdminOrdersPageData } from "@/lib/data/admin-dashboard";
import type { AdminOrdersQuery } from "@/lib/query/admin-defaults";
import { queryKeys } from "@/lib/query/query-keys";

// Must stay above the Redis TTL (20s) so a refetch never returns a warm entry.
const ORDERS_STALE_TIME = 25_000;

export function adminOrdersQueryOptions(
  adminId: string | undefined,
  filters: AdminOrdersQuery
) {
  return queryOptions({
    queryKey: queryKeys.admin.orders(adminId ?? "anonymous", filters),
    queryFn: async (): Promise<AdminOrdersPagePayload> => {
      const payload = await getAdminOrdersPageData(filters);
      if (!payload) throw new Error("Admin access required.");
      return payload;
    },
    enabled: Boolean(adminId),
    staleTime: ORDERS_STALE_TIME,
  });
}

export function useAdminOrders(
  adminId: string | undefined,
  filters: AdminOrdersQuery
) {
  return useQuery({
    ...adminOrdersQueryOptions(adminId, filters),
    placeholderData: keepPreviousData,
  });
}
