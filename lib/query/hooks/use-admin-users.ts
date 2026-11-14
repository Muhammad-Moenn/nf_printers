"use client";

import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";

import type { MockUser } from "@/data/mockUsers";
import { getAdminUsersDashboardData } from "@/lib/data/admin-users";
import type { AdminUsersQuery } from "@/lib/query/admin-defaults";
import { queryKeys } from "@/lib/query/query-keys";

// Must stay above the Redis TTL (30s) so a refetch never returns a warm entry.
const USERS_STALE_TIME = 35_000;

export type AdminUsersDashboardPayload = {
  stats: {
    totalUsers: number;
    activeUsers: number;
    newThisMonth: number;
    staffUsers: number;
  };
  users: MockUser[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  charts: {
    monthlySignups: { month: string; users: number }[];
    topSpenders: { name: string; spent: number }[];
  };
};

export function adminUsersQueryOptions(
  adminId: string | undefined,
  filters: AdminUsersQuery
) {
  return queryOptions({
    queryKey: queryKeys.admin.users(adminId ?? "anonymous", filters),
    queryFn: async (): Promise<AdminUsersDashboardPayload> => {
      const payload = await getAdminUsersDashboardData(filters);
      if (!payload) throw new Error("Admin access required.");
      return payload;
    },
    enabled: Boolean(adminId),
    staleTime: USERS_STALE_TIME,
  });
}

export function useAdminUsers(
  adminId: string | undefined,
  filters: AdminUsersQuery
) {
  return useQuery({
    ...adminUsersQueryOptions(adminId, filters),
    placeholderData: keepPreviousData,
  });
}
