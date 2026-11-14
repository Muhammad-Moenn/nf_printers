import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { DashboardOrder } from "@/types/order";

export type UserOrdersPageFilters = {
  page: number;
  pageSize: number;
  status: string;
  search: string;
  sortKey?: string;
  sortMode?: "az" | "za" | "latest" | "oldest";
};

export type UserOrdersPageResult = {
  orders: DashboardOrder[];
  total: number;
  page: number;
  pageSize: number;
};

export function fetchUserOrdersPage(
  filters: UserOrdersPageFilters,
  signal?: AbortSignal
) {
  return apiClient<UserOrdersPageResult>(apiEndpoints.userOrders.list, {
    query: { ...filters },
    signal,
  });
}
