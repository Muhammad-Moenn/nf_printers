"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import type {
  AdminDashboardActivityPayload,
  AdminRevenueAnalyticsPayload,
  AdminStatsCardsPayload,
} from "@/app/schemas/admin-dashboard-schema";
import {
  getAdminDashboardActivity,
  getAdminRevenueAnalytics,
  getAdminStatsCards,
} from "@/lib/data/admin-dashboard";
import { queryKeys } from "@/lib/query/query-keys";

// Must stay above the Redis TTL (45s/20s/45s) so a refetch never lands on a
// cache entry that is about to expire.
const STATS_STALE_TIME = 50_000;
const ACTIVITY_STALE_TIME = 25_000;
const REVENUE_ANALYTICS_STALE_TIME = 50_000;

export function adminStatsQueryOptions(adminId: string | undefined) {
  return queryOptions({
    queryKey: queryKeys.admin.stats(adminId ?? "anonymous"),
    queryFn: async (): Promise<AdminStatsCardsPayload> => {
      const payload = await getAdminStatsCards();
      if (!payload) throw new Error("Admin access required.");
      return payload;
    },
    enabled: Boolean(adminId),
    staleTime: STATS_STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminStats(adminId: string | undefined) {
  return useQuery(adminStatsQueryOptions(adminId));
}

export function adminActivityQueryOptions(adminId: string | undefined) {
  return queryOptions({
    queryKey: queryKeys.admin.activity(adminId ?? "anonymous"),
    queryFn: async (): Promise<AdminDashboardActivityPayload> => {
      const payload = await getAdminDashboardActivity();
      if (!payload) throw new Error("Admin access required.");
      return payload;
    },
    enabled: Boolean(adminId),
    staleTime: ACTIVITY_STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminActivity(adminId: string | undefined) {
  return useQuery(adminActivityQueryOptions(adminId));
}

export function adminRevenueAnalyticsQueryOptions(adminId: string | undefined) {
  return queryOptions({
    queryKey: queryKeys.admin.revenueAnalytics(adminId ?? "anonymous"),
    queryFn: async (): Promise<AdminRevenueAnalyticsPayload> => {
      const payload = await getAdminRevenueAnalytics();
      if (!payload) throw new Error("Admin access required.");
      return payload;
    },
    enabled: Boolean(adminId),
    staleTime: REVENUE_ANALYTICS_STALE_TIME,
    refetchOnMount: false,
  });
}

export function useAdminRevenueAnalytics(adminId: string | undefined) {
  return useQuery(adminRevenueAnalyticsQueryOptions(adminId));
}
