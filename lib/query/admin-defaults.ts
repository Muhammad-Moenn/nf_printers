import type { RevenuePeriod } from "@/app/schemas/admin-dashboard-schema";

export type AdminOrdersQuery = {
  page: number;
  pageSize: number;
  status: string;
  search: string;
  sortKey: string;
  sortDirection: "asc" | "desc";
};

export type AdminUsersQuery = {
  page: number;
  pageSize: number;
  search: string;
  role: string;
  status: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
};

/** Matches the admin action defaults so the server can hydrate these keys. */
export const DEFAULT_ADMIN_ORDERS_QUERY: AdminOrdersQuery = {
  page: 1,
  pageSize: 20,
  status: "all",
  search: "",
  sortKey: "createdAt",
  sortDirection: "desc",
};

export const DEFAULT_ADMIN_USERS_QUERY: AdminUsersQuery = {
  page: 1,
  pageSize: 20,
  search: "",
  role: "all",
  status: "all",
  sortBy: "joinedDate",
  sortDirection: "desc",
};

export const DEFAULT_ADMIN_REVENUE_PERIOD: RevenuePeriod = "this-month";
