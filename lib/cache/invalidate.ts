import "server-only";

import {
  ADMIN_TOP_SERVICES_LIMIT,
  CACHE_TTL,
  cacheKeys,
} from "@/lib/cache/keys";
import { cacheDelete, cacheIncr } from "@/lib/cache/store";

const REVENUE_PERIODS = [
  "this-month",
  "last-month",
  "this-year",
  "all-time",
] as const;

export async function invalidateUserOrderCaches(userId: string) {
  if (!userId) return;

  await Promise.all([
    cacheDelete([
      cacheKeys.user.dashboard(userId),
      cacheKeys.user.reorder(userId),
    ]),
    cacheIncr(cacheKeys.user.ordersVersion(userId), CACHE_TTL.userOrdersVersion),
  ]);
}

export async function invalidateUserDesignCaches(userId: string) {
  if (!userId) return;

  await cacheDelete(cacheKeys.user.designs(userId));
}

export type AdminOrderInvalidationOptions = {
  /** Revenue totals change (new/changed/removed completed money). */
  revenue?: boolean;
  /** Per-service order counts change (new order or service reassignment). */
  services?: boolean;
};

/**
 * Any order write affects admin totals, status analytics, the latest-orders
 * feed, and the paginated lists. Revenue and service counts only change for a
 * subset of writes, so callers can opt out to preserve those cache entries.
 * Paginated caches and the orders-page auxiliary entries (action list and
 * date-range counts) are retired with a version counter instead of key scans.
 */
export async function invalidateAdminOrderCaches(
  options: AdminOrderInvalidationOptions = {}
) {
  const { revenue = true, services = true } = options;
  const currentYear = new Date().getFullYear();
  // Cover a year rollover: an entry cached just before midnight belongs to the
  // previous year and would otherwise never be invalidated.
  const years = [currentYear, currentYear - 1];

  const keys = [
    cacheKeys.admin.stats,
    cacheKeys.admin.ordersOverview,
    ...years.map((year) => cacheKeys.admin.orderStatusByMonth(year)),
    cacheKeys.admin.orderStatusByYear,
    cacheKeys.admin.topServices(ADMIN_TOP_SERVICES_LIMIT),
    cacheKeys.admin.averageCompletedOrderValue,
    cacheKeys.admin.activity,
    cacheKeys.admin.latestOrders,
  ];

  if (revenue) {
    keys.push(
      cacheKeys.admin.revenueAnalytics,
      ...years.map((year) => cacheKeys.admin.dashboardMonthlyRevenue(year)),
      ...REVENUE_PERIODS.map((period) => cacheKeys.admin.revenue(period))
    );
  }

  if (services) {
    keys.push(cacheKeys.admin.servicesList);
  }

  await Promise.all([
    cacheDelete(keys),
    // Also retires the orders-page action list and date-range count entries.
    cacheIncr(cacheKeys.admin.ordersVersion, CACHE_TTL.adminOrdersVersion),
    // Per-user order counts and total spent change on every order write.
    cacheIncr(cacheKeys.admin.usersVersion, CACHE_TTL.adminUsersVersion),
  ]);
}

export async function invalidateOrderCaches(
  userId?: string,
  options?: AdminOrderInvalidationOptions
) {
  await invalidateAdminOrderCaches(options);

  if (userId) {
    await Promise.all([
      invalidateUserOrderCaches(userId),
      invalidateUserDesignCaches(userId),
    ]);
  }
}

/**
 * Payment/Expense writes change revenue totals without touching an Order row.
 * Any writer of those tables must call this; the revenue Realtime bus only
 * refreshes the client query, it never clears the server cache.
 */
export async function invalidateAdminRevenueCaches() {
  const currentYear = new Date().getFullYear();

  await cacheDelete([
    // Stats also carry today/week/month/all-time revenue totals.
    cacheKeys.admin.stats,
    cacheKeys.admin.revenueAnalytics,
    cacheKeys.admin.dashboardMonthlyRevenue(currentYear),
    cacheKeys.admin.dashboardMonthlyRevenue(currentYear - 1),
    ...REVENUE_PERIODS.map((period) => cacheKeys.admin.revenue(period)),
  ]);
}

/** Called when users are created, updated, or removed (e.g. Clerk webhook). */
export async function invalidateAdminUserCaches() {
  await Promise.all([
    cacheIncr(cacheKeys.admin.usersVersion, CACHE_TTL.adminUsersVersion),
    // Dashboard stats embed total/role user counts, so they cannot outlive a
    // user create/delete by the full TTL.
    cacheDelete(cacheKeys.admin.stats),
  ]);
}

/**
 * Customer name/email changes appear in admin order rows and the latest-orders
 * feed even though no Order row changed.
 */
export async function invalidateAdminCustomerCaches() {
  await Promise.all([
    invalidateAdminUserCaches(),
    cacheDelete([
      cacheKeys.admin.activity,
      cacheKeys.admin.latestOrders,
    ]),
    cacheIncr(cacheKeys.admin.ordersVersion, CACHE_TTL.adminOrdersVersion),
  ]);
}

/**
 * Inbox conversation lists and unseen badges are cached per admin under one
 * version counter, so any message write retires every admin's entry at once.
 */
export async function invalidateAdminMessageCaches() {
  await cacheIncr(
    cacheKeys.admin.messagesVersion,
    CACHE_TTL.adminMessagesVersion
  );
}

export async function invalidateServiceCaches() {
  await cacheDelete(cacheKeys.admin.servicesList);
}
