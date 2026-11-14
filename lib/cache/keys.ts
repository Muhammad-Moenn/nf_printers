import "server-only";

import { createHash } from "node:crypto";

const PREFIX = "nf:v2";

/**
 * Every reader and the invalidation helper must use this constant. Changing
 * the popularity limit here updates both the cache key and its invalidation.
 */
export const ADMIN_TOP_SERVICES_LIMIT = 5;

export const CACHE_TTL = {
  publicServices: 10 * 60,
  adminStats: 45,
  adminRevenue: 45,
  adminAnalytics: 60,
  adminActivity: 20,
  adminOrdersPage: 20,
  adminOrdersVersion: 7 * 24 * 60 * 60,
  adminUsersPage: 30,
  adminUsersVersion: 7 * 24 * 60 * 60,
  adminServicesList: 60,
  adminMessages: 5,
  adminMessagesVersion: 7 * 24 * 60 * 60,
  adminUnseenCount: 5,
  userDashboard: 20,
  userReorder: 60,
  userDesigns: 120,
  userOrdersPage: 20,
  userOrdersVersion: 7 * 24 * 60 * 60,
  userProfile: 55,
} as const;

export type UserOrdersPageFilters = {
  page: number;
  pageSize: number;
  status: string;
  search: string;
  sortKey: string;
  sortMode: string;
};

export type AdminOrdersPageFilters = {
  page: number;
  pageSize: number;
  status: string;
  search: string;
  sortKey: string;
  sortDirection: string;
};

export type AdminUsersPageFilters = {
  page: number;
  pageSize: number;
  search: string;
  role: string;
  status: string;
  sortBy: string;
  sortDirection: string;
};

function hashFilters(parts: Array<string | number>): string {
  return createHash("sha256")
    .update(parts.join("|"))
    .digest("hex")
    .slice(0, 24);
}

/**
 * Search text can contain customer input, so filters are hashed instead of
 * being embedded in the Redis key.
 */
export function userOrdersFilterHash(filters: UserOrdersPageFilters): string {
  return hashFilters([
    filters.page,
    filters.pageSize,
    filters.status,
    filters.search.trim().toLowerCase(),
    filters.sortKey,
    filters.sortMode,
  ]);
}

export function adminOrdersFilterHash(filters: AdminOrdersPageFilters): string {
  return hashFilters([
    filters.page,
    filters.pageSize,
    filters.status,
    filters.search.trim().toLowerCase(),
    filters.sortKey,
    filters.sortDirection,
  ]);
}

export function adminUsersFilterHash(filters: AdminUsersPageFilters): string {
  return hashFilters([
    filters.page,
    filters.pageSize,
    filters.search.trim().toLowerCase(),
    filters.role,
    filters.status,
    filters.sortBy,
    filters.sortDirection,
  ]);
}

/**
 * Prefixes for version-countered keys. The version is interpolated between the
 * prefix and the suffix; the single-round-trip read in the cache store needs
 * the literal prefix on its own.
 */
export const adminOrdersPagePrefix = `${PREFIX}:admin:orders:page:`;
export const adminOrdersActionPrefix = `${PREFIX}:admin:orders:action:`;
export const adminOrderRangeCountsPrefix = `${PREFIX}:admin:orders:range-counts:`;
export const adminUsersPagePrefix = `${PREFIX}:admin:users:page:`;
export const adminConversationsPrefix = `${PREFIX}:admin:messages:conversations:`;
export const adminUnseenCountPrefix = `${PREFIX}:admin:messages:unseen:`;
export const userOrdersPagePrefix = (userId: string) =>
  `${PREFIX}:user:${userId}:orders:page:`;

export const cacheKeys = {
  services: {
    publicCatalog: `${PREFIX}:services:public`,
  },
  admin: {
    stats: `${PREFIX}:admin:stats`,
    ordersOverview: `${PREFIX}:admin:orders:overview`,
    revenue: (period: string) => `${PREFIX}:admin:revenue:${period}`,
    revenueAnalytics: `${PREFIX}:admin:revenue:analytics`,
    dashboardMonthlyRevenue: (year: number) =>
      `${PREFIX}:admin:dashboard:monthly-revenue:${year}`,
    orderStatusByMonth: (year: number) =>
      `${PREFIX}:admin:orders:status-month:${year}`,
    orderStatusByYear: `${PREFIX}:admin:orders:status-year`,
    topServices: (limit: number) =>
      `${PREFIX}:admin:orders:top-services:${limit}`,
    averageCompletedOrderValue: `${PREFIX}:admin:orders:average-completed`,
    activity: `${PREFIX}:admin:activity`,
    latestOrders: `${PREFIX}:admin:activity:latest-orders`,
    ordersVersion: `${PREFIX}:admin:orders:version`,
    ordersPage: (version: number, filterHash: string) =>
      `${adminOrdersPagePrefix}${version}:${filterHash}`,
    usersVersion: `${PREFIX}:admin:users:version`,
    usersPage: (version: number, filterHash: string) =>
      `${adminUsersPagePrefix}${version}:${filterHash}`,
    servicesList: `${PREFIX}:admin:services:list`,
    messagesVersion: `${PREFIX}:admin:messages:version`,
  },
  user: {
    profile: (clerkUserId: string) =>
      `${PREFIX}:user:${clerkUserId}:profile`,
    dashboard: (userId: string) => `${PREFIX}:user:${userId}:dashboard`,
    reorder: (userId: string) => `${PREFIX}:user:${userId}:orders:reorder`,
    designs: (userId: string) => `${PREFIX}:user:${userId}:designs`,
    ordersVersion: (userId: string) =>
      `${PREFIX}:user:${userId}:orders:version`,
    ordersPage: (userId: string, version: number, filterHash: string) =>
      `${userOrdersPagePrefix(userId)}${version}:${filterHash}`,
  },
} as const;
