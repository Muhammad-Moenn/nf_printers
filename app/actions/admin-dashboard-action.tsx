"use server";

import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendOrderEmail } from "@/lib/email-notifications";
import { GetDBUser } from "./user_action";
import { buildAdminStatsCards } from "@/lib/admin-stats-cards";
import { predictPrice } from "@/lib/pricing/pricing-client";
import {
  getCompletedRevenueSummary,
  getCompletedRevenueTotal,
  getCompletedRevenueByMonth,
  getCompletedRevenueByDayOfMonth,
  getCompletedRevenueByWeekIndex,
  getPaidPaymentTotalsByMonth,
  getPaidPaymentTotalsByDayOfMonth,
  getPaidPaymentTotalsByWeekIndex,
  getOrderStatusCountsByMonth,
  getOrderStatusCountsByYear,
  getOrderCountInRange,
  getCompletedOrderAverageValue,
  getTopServiceCounts,
  getExpenseTotal,
} from "@/lib/db-aggregations";
import {
  adminOrdersOverviewPayloadSchema,
  adminDashboardActivityPayloadSchema,
  adminLatestOrdersPayloadSchema,
  adminOrderStatusSchema,
  adminOrdersPagePayloadSchema,
  adminOrdersPageQuerySchema,
  adminPopularServicesPayloadSchema,
  revenueManagementPayloadSchema,
  revenuePeriodSchema,
  adminRevenueAnalyticsPayloadSchema,
  adminStatsCardsPayloadSchema,
  adminStatsSchema,
  type AdminDashboardActivityPayload,
  type AdminLatestOrdersPayload,
  type AdminOrderStatus,
  type AdminOrdersOverviewPayload,
  type AdminOrdersPagePayload,
  type AdminPopularServicesPayload,
  type AdminRevenueAnalyticsPayload,
  type RevenuePeriod,
  type AdminStats,
} from "@/app/schemas/admin-dashboard-schema";

function parseAmount(amount: string | null | undefined) {
  const value = Number(String(amount ?? "").replace(/[^\d.]/g, ""));
  return Number.isNaN(value) ? 0 : value;
}

function toPricingSource(source: "rule_based" | "ml_model") {
  return source === "ml_model" ? ("ML_MODEL" as const) : ("RULE_BASED" as const);
}

function toPricingConfidence(confidence: "low" | "medium" | "high") {
  return confidence.toUpperCase() as "LOW" | "MEDIUM" | "HIGH";
}

const statusesRequiringFinalPrice: AdminOrderStatus[] = [
  "processing",
  "in_progress",
  "completed",
];

async function validatePriceForStatus(
  orderId: string,
  status: AdminOrderStatus
) {
  if (!statusesRequiringFinalPrice.includes(status)) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { finalAmount: true, pricingStatus: true },
  });

  if (!order) {
    return "Order not found.";
  }

  if (order.finalAmount === null || order.pricingStatus === "PENDING_REVIEW") {
    return "Approve or adjust the final price before moving this order into production.";
  }

  return null;
}

function emptyMonthlyRevenue() {
  return Array.from({ length: 12 }, (_, index) => ({
    month: new Date(0, index).toLocaleString("en", { month: "short" }),
    revenue: 0,
  }));
}

function emptyMonthlyOrderAnalytics() {
  return Array.from({ length: 12 }, (_, index) => ({
    label: new Date(0, index).toLocaleString("en", { month: "short" }),
    total: 0,
    pending: 0,
    processing: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  }));
}

function normalizeDesigns(designs: unknown) {
  if (!Array.isArray(designs)) {
    return [];
  }

  return designs
    .filter(
      (design): design is { url: string; key: string } =>
        typeof design === "object" &&
        design !== null &&
        typeof (design as { url?: unknown }).url === "string" &&
        typeof (design as { key?: unknown }).key === "string"
    )
    .map((design) => ({
      url: design.url,
      key: design.key,
    }));
}

async function requireAdminUser() {
  const dbUser = await GetDBUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    return null;
  }

  return dbUser;
}

async function getAdminStatsSnapshot(): Promise<AdminStats> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [userGroups, orderGroups, revenueSummary] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    getCompletedRevenueSummary({
      today: startOfToday,
      weekStart: startOfWeek,
      monthStart: startOfMonth,
    }),
  ]);

  const userCounts = new Map(
    userGroups.map((group) => [group.role, group._count._all])
  );
  const orderCounts = new Map(
    orderGroups.map((group) => [group.status, group._count._all])
  );
  const totalUsers = Array.from(userCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const totalOrders = Array.from(orderCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const totalCustomers = userCounts.get("CUSTOMER") ?? 0;
  const totalEmployees = userCounts.get("EMPLOYEE") ?? 0;
  const pendingOrders = orderCounts.get("pending") ?? 0;
  const processingOrders = orderCounts.get("processing") ?? 0;
  const inProgressOrders = orderCounts.get("in_progress") ?? 0;
  const completedOrders = orderCounts.get("completed") ?? 0;
  const cancelledOrders = orderCounts.get("cancelled") ?? 0;

  const {
    total: totalRevenue,
    today: todayRevenue,
    week: weekRevenue,
    month: monthRevenue,
  } = revenueSummary;

  return adminStatsSchema.parse({
    totalUsers,
    totalCustomers,
    totalEmployees,
    totalOrders,
    pendingOrders,
    processingOrders,
    inProgressOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    todayRevenue,
    weekRevenue,
    monthRevenue,
  });
}

async function getAdminRevenueAnalyticsSnapshot(): Promise<AdminRevenueAnalyticsPayload> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [revenueSummary, monthlyRevenueMap] = await Promise.all([
    getCompletedRevenueSummary({
      today: startOfToday,
      weekStart: startOfWeek,
      monthStart: startOfMonth,
    }),
    getCompletedRevenueByMonth(now.getFullYear()),
  ]);

  const monthlyRevenue = emptyMonthlyRevenue().map((month, index) => ({
    ...month,
    revenue: monthlyRevenueMap.get(index + 1) ?? 0,
  }));

  return adminRevenueAnalyticsPayloadSchema.parse({
    monthlyRevenue,
    totalRevenue: revenueSummary.total,
    todayRevenue: revenueSummary.today,
    weekRevenue: revenueSummary.week,
    monthRevenue: revenueSummary.month,
  });
}

export async function getAdminStatsCardsAction() {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return null;
  }

  const stats = await getAdminStatsSnapshot();
  return adminStatsCardsPayloadSchema.parse({
    stats,
    cards: buildAdminStatsCards(stats),
  });
}

export async function getAdminRevenueAnalyticsAction() {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return null;
  }

  return getAdminRevenueAnalyticsSnapshot();
}

function revenuePeriodRange(period: RevenuePeriod, now = new Date()) {
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = new Date(now);

  if (period === "last-month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const previousStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const previousEnd = new Date(start.getTime() - 1);
    return { start, end, previousStart, previousEnd };
  }

  if (period === "this-year") {
    return {
      start: new Date(now.getFullYear(), 0, 1),
      end: currentEnd,
      previousStart: new Date(now.getFullYear() - 1, 0, 1),
      previousEnd: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999),
    };
  }

  if (period === "all-time") {
    return { start: new Date(1970, 0, 1), end: currentEnd, previousStart: null, previousEnd: null };
  }

  return {
    start: currentStart,
    end: currentEnd,
    previousStart: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    previousEnd: new Date(currentStart.getTime() - 1),
  };
}

export async function getAdminRevenueManagementData(periodInput: unknown) {
  const dbUser = await requireAdminUser();
  if (!dbUser) return null;

  const parsedPeriod = revenuePeriodSchema.safeParse(periodInput);
  if (!parsedPeriod.success) return null;

  const now = new Date();
  const period = parsedPeriod.data;
  const { start, end, previousStart, previousEnd } = revenuePeriodRange(period, now);
  const currentYearStart = new Date(now.getFullYear(), 0, 1);
  const currentYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const dailyStart =
    period === "last-month"
      ? start
      : new Date(now.getFullYear(), now.getMonth(), 1);
  const dailyEnd =
    period === "last-month"
      ? end
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const daysInRange = Math.max(
    1,
    Math.floor((dailyEnd.getTime() - dailyStart.getTime()) / 86_400_000) + 1
  );

  const [
    revenue,
    previousRevenue,
    currentPaymentGroups,
    previousPaymentGroups,
    expenses,
    previousExpensesTotal,
    monthlyRevenueMap,
    monthlyPaymentsMap,
    dailyRevenueMap,
    dailyPaymentsMap,
    weeklyRevenueMap,
    weeklyPaymentsMap,
    recentPayments,
    unpaidOrders,
  ] = await Promise.all([
    getCompletedRevenueTotal({ from: start, to: end }),
    previousStart && previousEnd
      ? getCompletedRevenueTotal({ from: previousStart, to: previousEnd })
      : Promise.resolve(0),
    prisma.payment.groupBy({
      by: ["status"],
      where: { createdAt: { gte: start, lte: end } },
      _count: { _all: true },
      _sum: { amount: true },
    }),
    previousStart && previousEnd
      ? prisma.payment.groupBy({
          by: ["status"],
          where: { createdAt: { gte: previousStart, lte: previousEnd } },
          _sum: { amount: true },
        })
      : Promise.resolve([]),
    getExpenseTotal(start, end),
    previousStart && previousEnd
      ? getExpenseTotal(previousStart, previousEnd)
      : Promise.resolve(0),
    getCompletedRevenueByMonth(now.getFullYear()),
    getPaidPaymentTotalsByMonth(now.getFullYear()),
    getCompletedRevenueByDayOfMonth(dailyStart, dailyEnd),
    getPaidPaymentTotalsByDayOfMonth(dailyStart, dailyEnd),
    getCompletedRevenueByWeekIndex(currentYearStart, currentYearEnd),
    getPaidPaymentTotalsByWeekIndex(currentYearStart, currentYearEnd),
    prisma.payment.findMany({
      where: { createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { order: { include: { user: true } } },
    }),
    prisma.order.findMany({
      where: { payment: { is: { status: "unpaid" } } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        payment: true,
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  const groupFor = (groups: { status: string; _count?: { _all: number }; _sum: { amount: number | null } }[], status: string) =>
    groups.find((group) => group.status === status);
  const currentPaid = groupFor(currentPaymentGroups, "paid");
  const currentUnpaid = groupFor(currentPaymentGroups, "unpaid");
  const previousPaid = groupFor(previousPaymentGroups, "paid");
  const previousUnpaid = groupFor(previousPaymentGroups, "unpaid");

  const refundedAmount = groupFor(currentPaymentGroups, "refunded")?._sum.amount ?? 0;
  const previousRefundedAmount =
    groupFor(previousPaymentGroups, "refunded")?._sum.amount ?? 0;
  const netProfit = revenue - refundedAmount - expenses;
  const previousNetProfit =
    previousRevenue - previousRefundedAmount - previousExpensesTotal;

  const monthlyAnalytics = emptyMonthlyRevenue().map((month, index) => ({
    month: month.month,
    revenue: monthlyRevenueMap.get(index + 1) ?? 0,
    paymentsReceived: monthlyPaymentsMap.get(index + 1) ?? 0,
  }));
  const dailyAnalytics = Array.from({ length: daysInRange }, (_, index) => {
    const date = new Date(dailyStart);
    date.setDate(dailyStart.getDate() + index);
    const day = date.getDate();
    return {
      label: String(day).padStart(2, "0"),
      revenue: dailyRevenueMap.get(day) ?? 0,
      paymentsReceived: dailyPaymentsMap.get(day) ?? 0,
    };
  });
  const weeklyAnalytics = Array.from({ length: 52 }, (_, index) => ({
    label: `W${index + 1}`,
    revenue: weeklyRevenueMap.get(index) ?? 0,
    paymentsReceived: weeklyPaymentsMap.get(index) ?? 0,
  }));

  const paymentStatusNames: Record<string, { name: string; color: string }> = {
    paid: { name: "Paid", color: "var(--success)" },
    unpaid: { name: "Unpaid", color: "var(--primary)" },
    refunded: { name: "Refunded", color: "var(--destructive)" },
  };

  return revenueManagementPayloadSchema.parse({
    period,
    totals: {
      revenue,
      paymentsReceived: currentPaid?._sum.amount ?? 0,
      outstandingBalance: currentUnpaid?._sum.amount ?? 0,
      pendingPaymentCount: currentUnpaid?._count?._all ?? 0,
      pendingPaymentAmount: currentUnpaid?._sum.amount ?? 0,
      refundedAmount,
      expenses,
      netProfit,
      previousRevenue,
      previousPaymentsReceived: previousPaid?._sum.amount ?? 0,
      previousOutstandingBalance: previousUnpaid?._sum.amount ?? 0,
      previousPendingPaymentAmount: previousUnpaid?._sum.amount ?? 0,
      previousExpenses: previousExpensesTotal,
      previousNetProfit,
    },
    dailyAnalytics,
    weeklyAnalytics,
    monthlyAnalytics,
    paymentStatuses: currentPaymentGroups.map((group) => ({
      name: paymentStatusNames[group.status]?.name ?? group.status,
      count: group._count._all,
      amount: group._sum.amount ?? 0,
      color: paymentStatusNames[group.status]?.color ?? "var(--neutral-500)",
    })),
    outstandingPayments: unpaidOrders.map((order) => {
      const customer = [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") || order.user.email;
      const orderAmount = order.finalAmount?.toNumber() ?? parseAmount(order.amount);
      const amountPaid = 0;
      return {
        id: order.id,
        customer,
        orderAmount,
        amountPaid,
        outstanding: order.payment?.amount ?? Math.max(orderAmount - amountPaid, 0),
        dueDate: order.deliveryDate?.toISOString() ?? null,
        status: order.payment?.status ?? "unpaid",
      };
    }),
    recentTransactions: recentPayments.map((payment) => ({
      id: payment.id,
      customer:
        [payment.order.user.firstName, payment.order.user.lastName].filter(Boolean).join(" ") ||
        payment.order.user.email,
      amount: payment.amount,
      method: payment.method || "Not specified",
      status: payment.status,
      date: payment.createdAt.toISOString(),
    })),
  });
}

async function getAdminOrdersOverviewSnapshot(): Promise<AdminOrdersOverviewPayload> {
  const statusGroups = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const counts = new Map(
    statusGroups.map((group) => [group.status, group._count._all])
  );

  const data = [
    {
      name: "Completed",
      value: counts.get("completed") ?? 0,
      color: "var(--success)",
    },
    {
      name: "In Progress",
      value: counts.get("in_progress") ?? 0,
      color: "var(--info)",
    },
    {
      name: "Processing",
      value: counts.get("processing") ?? 0,
      color: "var(--violet)",
    },
    {
      name: "Pending",
      value: counts.get("pending") ?? 0,
      color: "var(--warning)",
    },
    {
      name: "Cancelled",
      value: counts.get("cancelled") ?? 0,
      color: "var(--destructive)",
    },
  ];

  return adminOrdersOverviewPayloadSchema.parse({
    data,
    totalOrders: data.reduce((sum, item) => sum + item.value, 0),
  });
}

export async function getAdminOrdersOverviewAction() {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return null;
  }

  return getAdminOrdersOverviewSnapshot();
}

async function getAdminDashboardActivitySnapshot(): Promise<AdminDashboardActivityPayload> {
  const [popularServicesPayload, latestOrdersPayload] = await Promise.all([
    getAdminPopularServicesSnapshot(),
    getAdminLatestOrdersSnapshot(),
  ]);

  return adminDashboardActivityPayloadSchema.parse({
    popularServices: popularServicesPayload.popularServices,
    latestOrders: latestOrdersPayload.latestOrders,
  });
}

async function getAdminPopularServicesSnapshot(): Promise<AdminPopularServicesPayload> {
  const popularServices = await getTopServiceCounts(5);

  return adminPopularServicesPayloadSchema.parse({
    popularServices,
  });
}

async function getAdminLatestOrdersSnapshot(): Promise<AdminLatestOrdersPayload> {
  const latestOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return adminLatestOrdersPayloadSchema.parse({
    latestOrders: latestOrders.map((order) => ({
      ...order,
      designs: normalizeDesigns(order.designs),
      estimatedAmount:
        order.estimatedAmount === null ? null : Number(order.estimatedAmount),
      finalAmount:
        order.finalAmount === null ? null : Number(order.finalAmount),
      customerName:
        [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") ||
        order.user.email,
      customerEmail: order.user.email,
    })),
  });
}

export async function getAdminDashboardActivityAction() {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return null;
  }

  return getAdminDashboardActivitySnapshot();
}

export async function getAdminPopularServicesAction() {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return null;
  }

  return getAdminPopularServicesSnapshot();
}

export async function getAdminLatestOrdersAction() {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return null;
  }

  return getAdminLatestOrdersSnapshot();
}

const adminOrderUserInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
} satisfies Prisma.OrderInclude;

type AdminOrderWithUser = Prisma.OrderGetPayload<{
  include: typeof adminOrderUserInclude;
}>;

function adminOrderActionPriority(order: {
  status: AdminOrderStatus;
  deliveryDate: Date | null;
}) {
  if (order.status === "pending") {
    return 0;
  }

  if (
    order.deliveryDate &&
    order.status !== "completed" &&
    order.status !== "cancelled" &&
    order.deliveryDate.getTime() < Date.now()
  ) {
    return 1;
  }

  if (order.status === "processing") {
    return 2;
  }

  return 3;
}

function formatAdminOrder(order: AdminOrderWithUser) {
  const customerName =
    [order.user.firstName, order.user.lastName].filter(Boolean).join(" ") ||
    order.user.email;

  return {
    id: order.id,
    userId: order.userId,
    customer: {
      id: order.user.id,
      name: customerName,
      email: order.user.email,
    },
    customerName,
    customerEmail: order.user.email,
    product: order.product,
    service: order.service,
    quantity: order.quantity,
    amount: order.amount,
    quantityValue: order.quantityValue,
    estimatedAmount:
      order.estimatedAmount === null ? null : Number(order.estimatedAmount),
    finalAmount:
      order.finalAmount === null ? null : Number(order.finalAmount),
    pricingSource: order.pricingSource,
    pricingConfidence: order.pricingConfidence,
    pricingStatus: order.pricingStatus,
    pricingBreakdown: Array.isArray(order.pricingBreakdown)
      ? order.pricingBreakdown
          .filter(
            (item): item is { label: string; amount: number } =>
              typeof item === "object" &&
              item !== null &&
              typeof (item as { label?: unknown }).label === "string" &&
              typeof (item as { amount?: unknown }).amount === "number"
          )
          .map((item) => ({ label: item.label, amount: item.amount }))
      : null,
    adminAdjusted: order.adminAdjusted,
    adjustmentReason: order.adjustmentReason,
    priceEstimatedAt: order.priceEstimatedAt,
    priceReviewedAt: order.priceReviewedAt,
    status: order.status,
    orderDate: order.orderDate,
    deliveryDate: order.deliveryDate,
    paperType: order.paperType,
    size: order.size,
    gsm: order.gsm,
    colorMode: order.colorMode,
    sides: order.sides,
    finishingOptions: order.finishingOptions,
    requirements: order.requirements,
    isReorder: order.isReorder ?? false,
    designs: normalizeDesigns(order.designs),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function adminOrderSort(
  sortKey: string,
  direction: "asc" | "desc"
): Prisma.OrderOrderByWithRelationInput {
  switch (sortKey) {
    case "id":
      return { id: direction };
    case "orderDate":
      return { orderDate: { sort: direction, nulls: "last" } };
    case "product":
      return { product: direction };
    case "status":
      return { status: direction };
    case "customerName":
      return { user: { firstName: direction } };
    case "amount":
      return { amount: direction };
    default:
      return { createdAt: direction };
  }
}

export async function getAdminOrdersPageData(
  input?: unknown
): Promise<AdminOrdersPagePayload | null> {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return null;
  }

  const parsedQuery = adminOrdersPageQuerySchema.safeParse(input ?? {});
  const query = parsedQuery.success
    ? parsedQuery.data
    : adminOrdersPageQuerySchema.parse({});
  const { pageSize, status, search, sortKey, sortDirection } = query;

  const where: Prisma.OrderWhereInput = {
    ...(status === "all" ? {} : { status }),
    ...(search
      ? {
          OR: [
            { id: { contains: search, mode: "insensitive" } },
            { product: { contains: search, mode: "insensitive" } },
            { service: { contains: search, mode: "insensitive" } },
            {
              user: {
                is: {
                  OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentYear = now.getFullYear();

  const total = await prisma.order.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(query.page, totalPages);
  const skip = (page - 1) * pageSize;

  const [
    stats,
    orderOverview,
    orders,
    actionOrders,
    monthlyCountRows,
    yearlyCountRows,
    topServices,
    averageCompletedOrderValue,
    ordersToday,
    ordersThisWeek,
    ordersThisMonth,
  ] = await Promise.all([
    getAdminStatsSnapshot(),
    getAdminOrdersOverviewSnapshot(),
    prisma.order.findMany({
      where,
      orderBy: adminOrderSort(sortKey, sortDirection),
      skip,
      take: pageSize,
      include: adminOrderUserInclude,
    }),
    prisma.order.findMany({
      where: { status: { in: ["pending", "processing", "in_progress"] } },
      orderBy: [{ status: "asc" }, { deliveryDate: "asc" }],
      take: 12,
      include: adminOrderUserInclude,
    }),
    getOrderStatusCountsByMonth(currentYear),
    getOrderStatusCountsByYear(),
    getTopServiceCounts(5),
    getCompletedOrderAverageValue(),
    getOrderCountInRange(startOfToday, now),
    getOrderCountInRange(startOfWeek, now),
    getOrderCountInRange(startOfMonth, now),
  ]);

  const formattedOrders = orders.map(formatAdminOrder);
  const ordersNeedingAction = actionOrders
    .map(formatAdminOrder)
    .sort(
      (a, b) => adminOrderActionPriority(a) - adminOrderActionPriority(b)
    )
    .slice(0, 6);

  const monthlyCountMap = new Map(
    monthlyCountRows.map((row) => [row.month, row])
  );
  const monthlyOrders = emptyMonthlyOrderAnalytics().map((month, index) => {
    const row = monthlyCountMap.get(index + 1);
    if (!row) {
      return month;
    }

    return {
      ...month,
      total: row.total,
      pending: row.pending,
      processing: row.processing,
      inProgress: row.inProgress,
      completed: row.completed,
      cancelled: row.cancelled,
    };
  });

  const yearlyOrders = yearlyCountRows.map((row) => ({
    year: String(row.year),
    total: row.total,
    pending: row.pending,
    active: row.active,
    completed: row.completed,
    cancelled: row.cancelled,
    revenue: row.revenue,
  }));

  return adminOrdersPagePayloadSchema.parse({
    orders: formattedOrders,
    ordersNeedingAction,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
    stats,
    orderOverview,
    analytics: {
      monthlyOrders,
      yearlyOrders,
      topServices,
      averageCompletedOrderValue,
      ordersToday,
      ordersThisWeek,
      ordersThisMonth,
    },
  });
}

export async function updateAdminOrderStatusAction({
  orderId,
  status,
}: {
  orderId: string;
  status: AdminOrderStatus;
}) {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return {
      success: false,
      error: "Unauthorized admin request.",
    };
  }

  const parsedStatus = adminOrderStatusSchema.safeParse(status);
  if (!parsedStatus.success) {
    return {
      success: false,
      error: "Invalid order status.",
    };
  }

  const pricingError = await validatePriceForStatus(orderId, parsedStatus.data);
  if (pricingError) {
    return { success: false, error: pricingError };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        user: { select: { email: true, emailNotifications: true } },
      },
    });
    if (!order) return { success: false, error: "Order not found." };

    await prisma.order.update({
      where: { id: orderId },
      data: { status: parsedStatus.data },
    });

    if (order.status !== parsedStatus.data) {
      await sendOrderEmail({
        enabled: order.user.emailNotifications,
        to: order.user.email,
        subject: "Your NF Printers order was updated",
        message: `The status of your order has changed to ${parsedStatus.data.replaceAll("_", " ")}. Sign in to your account to view your order details.`,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("updateAdminOrderStatusAction error:", error);
    return {
      success: false,
      error: "Failed to update order status.",
    };
  }
}

const pricingOverrideSchema = z.object({
  orderId: z.string().min(1),
  finalAmount: z.preprocess(
    (value) =>
      typeof value === "string"
        ? Number(value.replace(/[\s,]/g, ""))
        : value,
    z.number().positive().finite()
  ),
  reason: z.string().trim().min(5).max(500),
});

export async function approveEstimatedPriceAction(orderId: string) {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return { success: false, error: "Unauthorized admin request." };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { estimatedAmount: true },
  });

  if (!order?.estimatedAmount) {
    return { success: false, error: "This order has no estimate to approve." };
  }

  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        amount: order.estimatedAmount.toString(),
        finalAmount: order.estimatedAmount,
        pricingStatus: "APPROVED",
        adminAdjusted: false,
        adjustmentReason: null,
        priceReviewedById: dbUser.id,
        priceReviewedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("approveEstimatedPriceAction error:", error);
    return { success: false, error: "Failed to approve the estimate." };
  }
}

export async function overrideEstimatedPriceAction(input: {
  orderId: string;
  finalAmount: string | number;
  reason: string;
}) {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return { success: false, error: "Unauthorized admin request." };
  }

  const parsed = pricingOverrideSchema.safeParse(input);
  if (!parsed.success) {
    const hasInvalidAmount = parsed.error.issues.some(
      (issue) => issue.path[0] === "finalAmount"
    );
    const hasInvalidReason = parsed.error.issues.some(
      (issue) => issue.path[0] === "reason"
    );

    return {
      success: false,
      error:
        hasInvalidAmount && hasInvalidReason
          ? "Enter a price greater than zero and an adjustment reason of at least 5 characters."
          : hasInvalidAmount
            ? "Enter a valid price greater than zero."
            : "Enter an adjustment reason of at least 5 characters.",
    };
  }

  try {
    await prisma.order.update({
      where: { id: parsed.data.orderId },
      data: {
        amount: String(parsed.data.finalAmount),
        finalAmount: parsed.data.finalAmount,
        pricingStatus: "OVERRIDDEN",
        adminAdjusted: true,
        adjustmentReason: parsed.data.reason,
        priceReviewedById: dbUser.id,
        priceReviewedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("overrideEstimatedPriceAction error:", error);
    return { success: false, error: "Failed to save the adjusted price." };
  }
}

export async function updateAdminOrderAction({
  orderId,
  product,
  service,
  quantity,
  deliveryDate,
  requirements,
}: {
  orderId: string;
  product: string;
  service: string;
  quantity: string;
  deliveryDate?: string | null;
  requirements?: string | null;
}) {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return {
      success: false,
      error: "Unauthorized admin request.",
    };
  }

  const cleanProduct = product.trim();
  const cleanService = service.trim();
  const cleanQuantity = quantity.trim();

  const numericQuantity = Number(cleanQuantity);

  if (
    !cleanProduct ||
    !cleanService ||
    !cleanQuantity ||
    !Number.isInteger(numericQuantity) ||
    numericQuantity <= 0
  ) {
    return {
      success: false,
      error: "Product, service, and a positive whole-number quantity are required.",
    };
  }

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        product: true,
        service: true,
        quantity: true,
        paperType: true,
        size: true,
        gsm: true,
        colorMode: true,
        sides: true,
        finishingOptions: true,
        requirements: true,
        isReorder: true,
      },
    });

    if (!existingOrder) {
      return { success: false, error: "Order not found." };
    }

    const cleanRequirements = requirements?.trim() || null;
    const pricingInputsChanged =
      cleanProduct !== existingOrder.product ||
      cleanService !== existingOrder.service ||
      cleanQuantity !== existingOrder.quantity ||
      cleanRequirements !== existingOrder.requirements;

    const pricing = pricingInputsChanged
      ? await predictPrice({
          product: cleanProduct,
          service: cleanService,
          quantity: numericQuantity,
          paperType: existingOrder.paperType ?? "",
          size: existingOrder.size ?? "",
          gsm: existingOrder.gsm ?? "",
          colorMode: existingOrder.colorMode ?? "",
          sides: existingOrder.sides ?? "",
          finishingOptions: existingOrder.finishingOptions,
          requirements: cleanRequirements ?? "",
          isReorder: existingOrder.isReorder ?? false,
        })
      : null;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        quantityValue: numericQuantity,
        product: cleanProduct,
        service: cleanService,
        quantity: cleanQuantity,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        requirements: cleanRequirements,
        ...(pricing
          ? {
              status: "pending" as const,
              amount: String(pricing.predictedAmount),
              estimatedAmount: pricing.predictedAmount,
              finalAmount: null,
              pricingSource: toPricingSource(pricing.pricingSource),
              pricingConfidence: toPricingConfidence(pricing.confidence),
              pricingStatus: "PENDING_REVIEW" as const,
              pricingBreakdown: pricing.breakdown,
              pricingFeatures: pricing.features,
              pricingModelVersion:
                pricing.pricingSource === "ml_model"
                  ? "external-model"
                  : "rule-based-v1",
              adminAdjusted: false,
              adjustmentReason: null,
              priceReviewedById: null,
              priceEstimatedAt: new Date(),
              priceReviewedAt: null,
            }
          : {}),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("updateAdminOrderAction error:", error);
    return {
      success: false,
      error: "Failed to update order.",
    };
  }
}

export async function getAdminDashboardData() {
  const dbUser = await requireAdminUser();
  if (!dbUser) {
    return null;
  }

  const now = new Date();
  const stats = await getAdminStatsSnapshot();

  const [monthlyRevenueMap, activity] = await Promise.all([
    getCompletedRevenueByMonth(now.getFullYear()),
    getAdminDashboardActivitySnapshot(),
  ]);

  const monthlyRevenue = emptyMonthlyRevenue().map((month, index) => ({
    ...month,
    revenue: monthlyRevenueMap.get(index + 1) ?? 0,
  }));

  const orderOverviewPayload = adminOrdersOverviewPayloadSchema.parse({
    data: [
      { name: "Completed", value: stats.completedOrders, color: "var(--success)" },
      { name: "In Progress", value: stats.inProgressOrders, color: "var(--info)" },
      { name: "Processing", value: stats.processingOrders, color: "var(--violet)" },
      { name: "Pending", value: stats.pendingOrders, color: "var(--warning)" },
      { name: "Cancelled", value: stats.cancelledOrders, color: "var(--destructive)" },
    ],
    totalOrders: stats.totalOrders,
  });

  const dashboardData = {
    stats,
    statsCards: buildAdminStatsCards(stats),
    orderOverview: orderOverviewPayload.data,
    monthlyRevenue,
    popularServices: activity.popularServices,
    latestOrders: activity.latestOrders,
  };

  return dashboardData;
}
