import "server-only";

import { CACHE_TTL, cacheKeys } from "@/lib/cache/keys";
import { cacheSet, getOrSet } from "@/lib/cache/store";
import { getUserOrderSummary } from "@/lib/db-aggregations";
import { dashboardOrderSelect, toDashboardOrder } from "@/lib/order-mappers";
import {
  buildMonthComparison,
  buildMonthWeekSeries,
  buildMonthlyOrderCounts,
  buildMonthlyPaid,
  buildOrderSeries,
  buildUserPaymentMetrics,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "@/lib/order-metrics";
import { prisma } from "@/lib/prisma";
import type { OrdersRealtimeData } from "@/types/order";

function emptyMonth() {
  return {
    orders: [] as never[],
    totalOrders: 0,
    completed: 0,
    pending: 0,
    processing: 0,
    inProgress: 0,
    cancelled: 0,
    totalPaid: 0,
  };
}

export function emptyDashboardSummary(): OrdersRealtimeData {
  return {
    userId: "",
    recentOrders: [],
    totalPaid: 0,
    currentWeekPaid: 0,
    currentMonthPaid: 0,
    weeklyData: [],
    lastWeekData: [],
    statusCounts: {
      total: 0,
      pending: 0,
      processing: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
    },
    orderSeries: { "7D": [], "30D": [], "90D": [] },
    monthSeries: [],
    monthComparison: { currentMonth: emptyMonth(), lastMonth: emptyMonth() },
    monthlyTotal: [],
    monthlyOrders: [],
  };
}

/**
 * Builds the customer dashboard payload from bounded, indexed queries.
 * Lifetime totals and status counts come from one aggregate query; the chart
 * series are computed from a bounded recent window instead of every order.
 */
async function loadUserDashboardSummary(
  userId: string
): Promise<OrdersRealtimeData> {
  const now = new Date();
  const year = now.getFullYear();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const ninetyDaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 89
  );

  // Covers the 90-day series, the current-year monthly series, the fortnight
  // chart and the previous-month comparison without reading every order.
  const windowStart = new Date(
    Math.min(
      new Date(year, 0, 1).getTime(),
      lastMonthStart.getTime(),
      ninetyDaysAgo.getTime()
    )
  );

  const [summary, windowOrders, recentOrders] = await Promise.all([
    getUserOrderSummary(userId, {
      weekStart,
      weekEnd,
      monthStart,
      monthEnd,
    }),
    prisma.order.findMany({
      where: {
        userId,
        OR: [
          { createdAt: { gte: windowStart, lte: now } },
          { orderDate: { gte: windowStart, lte: now } },
        ],
      },
      select: {
        status: true,
        finalAmount: true,
        orderDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: dashboardOrderSelect,
    }),
  ]);

  const metrics = buildUserPaymentMetrics(windowOrders, now);

  return {
    userId,
    recentOrders: recentOrders.map(toDashboardOrder),
    totalPaid: summary.totalPaid,
    currentWeekPaid: summary.currentWeekPaid,
    currentMonthPaid: summary.currentMonthPaid,
    weeklyData: metrics.weeklyData,
    lastWeekData: metrics.lastWeekData,
    statusCounts: {
      total: summary.total,
      pending: summary.pending,
      processing: summary.processing,
      inProgress: summary.inProgress,
      completed: summary.completed,
      cancelled: summary.cancelled,
    },
    orderSeries: {
      "7D": buildOrderSeries(windowOrders, 7),
      "30D": buildOrderSeries(windowOrders, 30),
      "90D": buildOrderSeries(windowOrders, 90),
    },
    monthSeries: buildMonthWeekSeries(windowOrders, now),
    monthComparison: buildMonthComparison(windowOrders, now),
    monthlyTotal: buildMonthlyPaid(windowOrders, year),
    monthlyOrders: buildMonthlyOrderCounts(windowOrders, year),
  };
}

export async function getUserDashboardSummary(
  userId: string,
  options?: { fresh?: boolean }
): Promise<OrdersRealtimeData> {
  if (!userId) return emptyDashboardSummary();

  const key = cacheKeys.user.dashboard(userId);

  // Realtime refreshes must observe the change that triggered them, so they
  // bypass the cache and write the fresh value back for later RSC reads.
  if (options?.fresh) {
    const value = await loadUserDashboardSummary(userId);
    await cacheSet(key, value, CACHE_TTL.userDashboard);
    return value;
  }

  return getOrSet(key, CACHE_TTL.userDashboard, () =>
    loadUserDashboardSummary(userId)
  );
}
