import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function orderDateRangeWhere(
  from?: Date,
  to?: Date
): Prisma.OrderWhereInput {
  if (!from && !to) {
    return {};
  }

  const range = {
    ...(from ? { gte: from } : {}),
    ...(to ? { lte: to } : {}),
  };

  return {
    OR: [{ orderDate: range }, { orderDate: null, createdAt: range }],
  };
}

export type RevenueSummary = {
  total: number;
  today: number;
  week: number;
  month: number;
};

export async function getCompletedRevenueSummary({
  today,
  weekStart,
  monthStart,
}: {
  today: Date;
  weekStart: Date;
  monthStart: Date;
}): Promise<RevenueSummary> {
  const [row] = await prisma.$queryRaw<RevenueSummary[]>`
    SELECT
      COALESCE(SUM("finalAmount"), 0)::float8 AS total,
      COALESCE(SUM("finalAmount") FILTER (WHERE COALESCE("orderDate", "createdAt") >= ${today}), 0)::float8 AS today,
      COALESCE(SUM("finalAmount") FILTER (WHERE COALESCE("orderDate", "createdAt") >= ${weekStart}), 0)::float8 AS week,
      COALESCE(SUM("finalAmount") FILTER (WHERE COALESCE("orderDate", "createdAt") >= ${monthStart}), 0)::float8 AS month
    FROM "Order"
    WHERE status = 'completed'
  `;

  return row ?? { total: 0, today: 0, week: 0, month: 0 };
}

export async function getCompletedRevenueTotal({
  from,
  to,
  userId,
}: {
  from?: Date;
  to?: Date;
  userId?: string;
} = {}): Promise<number> {
  const result = await prisma.order.aggregate({
    where: {
      status: "completed",
      ...(userId ? { userId } : {}),
      ...orderDateRangeWhere(from, to),
    },
    _sum: { finalAmount: true },
  });

  return Number(result._sum.finalAmount ?? 0);
}

export async function getCompletedRevenueByMonth(
  year: number,
  userId?: string
): Promise<Map<number, number>> {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  const userFilter = userId
    ? Prisma.sql`AND "userId" = ${userId}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<{ month: number; total: number }[]>`
    SELECT
      EXTRACT(MONTH FROM COALESCE("orderDate", "createdAt"))::int AS month,
      COALESCE(SUM("finalAmount"), 0)::float8 AS total
    FROM "Order"
    WHERE status = 'completed'
      AND COALESCE("orderDate", "createdAt") >= ${start}
      AND COALESCE("orderDate", "createdAt") <= ${end}
      ${userFilter}
    GROUP BY 1
    ORDER BY 1
  `;

  return new Map(rows.map((row) => [row.month, row.total]));
}

export async function getCompletedRevenueByDayOfMonth(
  from: Date,
  to: Date,
  userId?: string
): Promise<Map<number, number>> {
  const userFilter = userId
    ? Prisma.sql`AND "userId" = ${userId}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<{ day: number; total: number }[]>`
    SELECT
      EXTRACT(DAY FROM COALESCE("orderDate", "createdAt"))::int AS day,
      COALESCE(SUM("finalAmount"), 0)::float8 AS total
    FROM "Order"
    WHERE status = 'completed'
      AND COALESCE("orderDate", "createdAt") >= ${from}
      AND COALESCE("orderDate", "createdAt") <= ${to}
      ${userFilter}
    GROUP BY 1
    ORDER BY 1
  `;

  return new Map(rows.map((row) => [row.day, row.total]));
}

export async function getCompletedRevenueByWeekIndex(
  yearStart: Date,
  yearEnd: Date
): Promise<Map<number, number>> {
  const rows = await prisma.$queryRaw<{ bucket: number; total: number }[]>`
    SELECT
      LEAST(
        51,
        FLOOR(EXTRACT(EPOCH FROM (COALESCE("orderDate", "createdAt") - ${yearStart})) / 604800)
      )::int AS bucket,
      COALESCE(SUM("finalAmount"), 0)::float8 AS total
    FROM "Order"
    WHERE status = 'completed'
      AND COALESCE("orderDate", "createdAt") >= ${yearStart}
      AND COALESCE("orderDate", "createdAt") <= ${yearEnd}
    GROUP BY 1
    ORDER BY 1
  `;

  return new Map(rows.map((row) => [row.bucket, row.total]));
}

export async function getPaidPaymentTotalsByMonth(
  year: number
): Promise<Map<number, number>> {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);

  const rows = await prisma.$queryRaw<{ month: number; total: number }[]>`
    SELECT
      EXTRACT(MONTH FROM "createdAt")::int AS month,
      COALESCE(SUM("amount"), 0)::float8 AS total
    FROM "Payment"
    WHERE status = 'paid'
      AND "createdAt" >= ${start}
      AND "createdAt" <= ${end}
    GROUP BY 1
    ORDER BY 1
  `;

  return new Map(rows.map((row) => [row.month, row.total]));
}

export async function getPaidPaymentTotalsByDayOfMonth(
  from: Date,
  to: Date
): Promise<Map<number, number>> {
  const rows = await prisma.$queryRaw<{ day: number; total: number }[]>`
    SELECT
      EXTRACT(DAY FROM "createdAt")::int AS day,
      COALESCE(SUM("amount"), 0)::float8 AS total
    FROM "Payment"
    WHERE status = 'paid'
      AND "createdAt" >= ${from}
      AND "createdAt" <= ${to}
    GROUP BY 1
    ORDER BY 1
  `;

  return new Map(rows.map((row) => [row.day, row.total]));
}

export async function getPaidPaymentTotalsByWeekIndex(
  yearStart: Date,
  yearEnd: Date
): Promise<Map<number, number>> {
  const rows = await prisma.$queryRaw<{ bucket: number; total: number }[]>`
    SELECT
      LEAST(
        51,
        FLOOR(EXTRACT(EPOCH FROM ("createdAt" - ${yearStart})) / 604800)
      )::int AS bucket,
      COALESCE(SUM("amount"), 0)::float8 AS total
    FROM "Payment"
    WHERE status = 'paid'
      AND "createdAt" >= ${yearStart}
      AND "createdAt" <= ${yearEnd}
    GROUP BY 1
    ORDER BY 1
  `;

  return new Map(rows.map((row) => [row.bucket, row.total]));
}

export type MonthStatusCounts = {
  month: number;
  total: number;
  pending: number;
  processing: number;
  inProgress: number;
  completed: number;
  cancelled: number;
};

export async function getOrderStatusCountsByMonth(
  year: number,
  userId?: string
): Promise<MonthStatusCounts[]> {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  const userFilter = userId
    ? Prisma.sql`AND "userId" = ${userId}`
    : Prisma.empty;

  return prisma.$queryRaw<MonthStatusCounts[]>`
    SELECT
      EXTRACT(MONTH FROM COALESCE("orderDate", "createdAt"))::int AS month,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'processing')::int AS processing,
      COUNT(*) FILTER (WHERE status = 'in_progress')::int AS "inProgress",
      COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
      COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
    FROM "Order"
    WHERE COALESCE("orderDate", "createdAt") >= ${start}
      AND COALESCE("orderDate", "createdAt") <= ${end}
      ${userFilter}
    GROUP BY 1
    ORDER BY 1
  `;
}

export type YearStatusCounts = {
  year: number;
  total: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
  revenue: number;
};

export async function getOrderStatusCountsByYear(
  userId?: string
): Promise<YearStatusCounts[]> {
  const userFilter = userId
    ? Prisma.sql`WHERE "userId" = ${userId}`
    : Prisma.empty;

  return prisma.$queryRaw<YearStatusCounts[]>`
    SELECT
      EXTRACT(YEAR FROM COALESCE("orderDate", "createdAt"))::int AS year,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status IN ('processing', 'in_progress'))::int AS active,
      COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
      COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled,
      COALESCE(SUM("finalAmount") FILTER (WHERE status = 'completed'), 0)::float8 AS revenue
    FROM "Order"
    ${userFilter}
    GROUP BY 1
    ORDER BY 1
  `;
}

export type OrderStatusCounts = {
  total: number;
  pending: number;
  processing: number;
  inProgress: number;
  completed: number;
  cancelled: number;
};

export async function getOrderStatusCountsInRange(
  from: Date,
  to: Date,
  userId?: string
): Promise<OrderStatusCounts> {
  const groups = await prisma.order.groupBy({
    by: ["status"],
    where: {
      ...(userId ? { userId } : {}),
      orderDate: { gte: from, lte: to },
    },
    _count: { _all: true },
  });

  const counts = new Map(
    groups.map((group) => [group.status, group._count._all])
  );

  return {
    total: groups.reduce((sum, group) => sum + group._count._all, 0),
    pending: counts.get("pending") ?? 0,
    processing: counts.get("processing") ?? 0,
    inProgress: counts.get("in_progress") ?? 0,
    completed: counts.get("completed") ?? 0,
    cancelled: counts.get("cancelled") ?? 0,
  };
}

export async function getUserOrderAggregates(): Promise<
  Map<string, { orders: number; totalSpent: number }>
> {
  const groups = await prisma.order.groupBy({
    by: ["userId"],
    _count: { _all: true },
    _sum: { finalAmount: true },
  });

  return new Map(
    groups.map((group) => [
      group.userId,
      {
        orders: group._count._all,
        totalSpent: Number(group._sum.finalAmount ?? 0),
      },
    ])
  );
}

export async function getOrderCountInRange(
  from: Date,
  to: Date,
  userId?: string
): Promise<number> {
  return prisma.order.count({
    where: {
      ...(userId ? { userId } : {}),
      ...orderDateRangeWhere(from, to),
    },
  });
}

export async function getCompletedOrderAverageValue(
  userId?: string
): Promise<number> {
  const result = await prisma.order.aggregate({
    where: { status: "completed", ...(userId ? { userId } : {}) },
    _avg: { finalAmount: true },
  });

  return Number(result._avg.finalAmount ?? 0);
}

export async function getTopServiceCounts(
  limit = 5
): Promise<{ name: string; value: number }[]> {
  const groups = await prisma.order.groupBy({
    by: ["service"],
    _count: { _all: true },
  });

  const counts = new Map<string, number>();
  for (const group of groups) {
    const key = group.service || "Other";
    counts.set(key, (counts.get(key) ?? 0) + group._count._all);
  }

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export async function getExpenseTotal(
  from: Date,
  to: Date
): Promise<number> {
  const result = await prisma.expense.aggregate({
    where: { expenseDate: { gte: from, lte: to } },
    _sum: { amount: true },
  });

  return Number(result._sum.amount ?? 0);
}

export async function getUserOrderStatusCounts(
  userId: string
): Promise<Map<string, number>> {
  const groups = await prisma.order.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });

  return new Map(groups.map((group) => [group.status, group._count._all]));
}

export type DailyOrderStatusCounts = {
  day: string;
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
};

export async function getUserOrderDayCounts(
  userId: string,
  from: Date,
  to: Date
): Promise<Map<string, DailyOrderStatusCounts>> {
  const rows = await prisma.$queryRaw<DailyOrderStatusCounts[]>`
    SELECT
      to_char(COALESCE("orderDate", "createdAt"), 'YYYY-MM-DD') AS day,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'completed')::int AS completed,
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'cancelled')::int AS cancelled
    FROM "Order"
    WHERE "userId" = ${userId}
      AND COALESCE("orderDate", "createdAt") >= ${from}
      AND COALESCE("orderDate", "createdAt") <= ${to}
    GROUP BY 1
  `;

  return new Map(rows.map((row) => [row.day, row]));
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
