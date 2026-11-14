"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import type { RevenueManagementPayload, RevenuePeriod } from "@/app/schemas/admin-dashboard-schema";
import { getAdminRevenueManagementData } from "@/lib/data/admin-dashboard";
import { queryKeys } from "@/lib/query/query-keys";

// Must stay above the Redis TTL (45s) so a refetch never returns a warm entry.
const REVENUE_STALE_TIME = 50_000;

export function adminRevenueQueryOptions(
  adminId: string | undefined,
  period: RevenuePeriod
) {
  return queryOptions({
    queryKey: queryKeys.admin.revenueManagement(adminId ?? "anonymous", period),
    queryFn: async (): Promise<RevenueManagementPayload> => {
      const payload = await getAdminRevenueManagementData(period);
      if (!payload) throw new Error("Admin access required.");
      return payload;
    },
    enabled: Boolean(adminId),
    staleTime: REVENUE_STALE_TIME,
  });
}

export function useAdminRevenue(
  adminId: string | undefined,
  period: RevenuePeriod
) {
  return useQuery(adminRevenueQueryOptions(adminId, period));
}
