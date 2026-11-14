export type OrderMetricLike = {
  status?: string | null;
  finalAmount?: unknown;
  orderDate?: Date | string | null;
  createdAt?: Date | string | null;
};

export type WeekDayMetrics = {
  label: string;
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
};

export type MonthOrderMetrics = {
  orders: never[];
  totalOrders: number;
  completed: number;
  pending: number;
  processing: number;
  inProgress: number;
  cancelled: number;
  totalPaid: number;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEK_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toAmount(value: unknown): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function effectiveOrderDate(order: OrderMetricLike): Date | null {
  return toDate(order.orderDate) ?? toDate(order.createdAt);
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfWeek(date: Date): Date {
  const start = new Date(date);
  start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  return start;
}

export function endOfWeek(date: Date): Date {
  const end = new Date(startOfWeek(date));
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function buildUserPaymentMetrics(
  orders: OrderMetricLike[],
  now = new Date()
) {
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(weekStart.getDate() - 7);
  lastWeekStart.setHours(0, 0, 0, 0);

  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const dayCounts = new Map<
    string,
    { total: number; completed: number; pending: number; cancelled: number }
  >();

  let totalPaid = 0;
  let currentWeekPaid = 0;
  let currentMonthPaid = 0;

  for (const order of orders) {
    const amount = toAmount(order.finalAmount);
    const effectiveDate = effectiveOrderDate(order);

    if (order.status === "completed") {
      totalPaid += amount;
      if (effectiveDate && effectiveDate >= weekStart && effectiveDate <= weekEnd) {
        currentWeekPaid += amount;
      }
      if (
        effectiveDate &&
        effectiveDate >= monthStart &&
        effectiveDate <= monthEnd
      ) {
        currentMonthPaid += amount;
      }
    }

    if (
      effectiveDate &&
      effectiveDate >= lastWeekStart &&
      effectiveDate <= weekEnd
    ) {
      const key = localDateKey(effectiveDate);
      const row =
        dayCounts.get(key) ?? {
          total: 0,
          completed: 0,
          pending: 0,
          cancelled: 0,
        };

      row.total += 1;
      if (order.status === "completed") row.completed += 1;
      else if (order.status === "pending") row.pending += 1;
      else if (order.status === "cancelled") row.cancelled += 1;

      dayCounts.set(key, row);
    }
  }

  const buildWeekData = (start: Date): WeekDayMetrics[] =>
    Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      const row = dayCounts.get(localDateKey(day));

      return {
        label: WEEK_DAY_LABELS[index],
        total: row?.total ?? 0,
        completed: row?.completed ?? 0,
        pending: row?.pending ?? 0,
        cancelled: row?.cancelled ?? 0,
      };
    });

  return {
    totalPaid,
    currentWeekPaid,
    currentMonthPaid,
    weeklyData: buildWeekData(weekStart),
    lastWeekData: buildWeekData(lastWeekStart),
  };
}

export function buildMonthlyPaid(
  orders: OrderMetricLike[],
  year: number
): { month: string; total: number }[] {
  const totals = new Array<number>(12).fill(0);

  for (const order of orders) {
    if (order.status !== "completed") continue;

    const date = effectiveOrderDate(order);
    if (!date || date.getFullYear() !== year) continue;

    totals[date.getMonth()] += toAmount(order.finalAmount);
  }

  return totals.map((total, index) => ({
    month: MONTH_LABELS[index],
    total,
  }));
}

export function buildMonthlyOrderCounts(
  orders: OrderMetricLike[],
  year: number
) {
  const rows = new Map<
    number,
    {
      pending: number;
      completed: number;
      cancelled: number;
      inprogress: number;
      total: number;
    }
  >();

  for (const order of orders) {
    const date = effectiveOrderDate(order);
    if (!date || date.getFullYear() !== year) continue;

    const month = date.getMonth() + 1;
    const row =
      rows.get(month) ?? {
        pending: 0,
        completed: 0,
        cancelled: 0,
        inprogress: 0,
        total: 0,
      };

    row.total += 1;
    if (order.status === "pending") row.pending += 1;
    else if (order.status === "completed") row.completed += 1;
    else if (order.status === "cancelled") row.cancelled += 1;
    else if (order.status === "in_progress") row.inprogress += 1;

    rows.set(month, row);
  }

  return MONTH_LABELS.map((label, index) => {
    const row = rows.get(index + 1);
    return {
      label,
      pending: row?.pending ?? 0,
      completed: row?.completed ?? 0,
      cancelled: row?.cancelled ?? 0,
      inprogress: row?.inprogress ?? 0,
      total: row?.total ?? 0,
    };
  });
}

function buildMonthMetrics(
  orders: OrderMetricLike[],
  start: Date,
  end: Date
): MonthOrderMetrics {
  let totalOrders = 0;
  let completed = 0;
  let pending = 0;
  let processing = 0;
  let inProgress = 0;
  let cancelled = 0;
  let totalPaid = 0;

  for (const order of orders) {
    const date = toDate(order.orderDate);
    if (!date || date < start || date > end) continue;

    totalOrders += 1;
    if (order.status === "completed") {
      completed += 1;
      totalPaid += toAmount(order.finalAmount);
    } else if (order.status === "pending") {
      pending += 1;
    } else if (order.status === "processing") {
      processing += 1;
    } else if (order.status === "in_progress") {
      inProgress += 1;
    } else if (order.status === "cancelled") {
      cancelled += 1;
    }
  }

  return {
    orders: [],
    totalOrders,
    completed,
    pending,
    processing,
    inProgress,
    cancelled,
    totalPaid,
  };
}

export function buildMonthComparison(
  orders: OrderMetricLike[],
  now = new Date()
) {
  const currentStart = startOfMonth(now);
  const currentEnd = endOfMonth(now);
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  return {
    currentMonth: buildMonthMetrics(orders, currentStart, currentEnd),
    lastMonth: buildMonthMetrics(orders, lastStart, lastEnd),
  };
}

export type OrderSeriesPoint = { label: string; total: number };

export function buildOrderSeries(
  orders: { createdAt: Date | string }[],
  days: number
): OrderSeriesPoint[] {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  if (days === 7) {
    start.setDate(end.getDate() - ((end.getDay() + 6) % 7));
  } else {
    start.setDate(end.getDate() - days + 1);
  }

  const counts = new Map<string, number>();
  for (const order of orders) {
    const createdAt = toDate(order.createdAt);
    if (!createdAt) continue;
    const key = localDateKey(createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      label:
        days === 7
          ? date.toLocaleDateString("en-US", { weekday: "short" })
          : date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
      total: counts.get(localDateKey(date)) ?? 0,
    };
  });
}

export function buildMonthWeekSeries(
  orders: { createdAt: Date | string }[],
  now = new Date()
): OrderSeriesPoint[] {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return Array.from({ length: 4 }, (_, index) => {
    const weekStart = new Date(monthStart);
    weekStart.setDate(index * 7 + 1);
    const weekEnd = new Date(weekStart);
    if (index === 3) {
      weekEnd.setMonth(weekStart.getMonth() + 1, 1);
    } else {
      weekEnd.setDate(weekStart.getDate() + 7);
    }

    return {
      label: `W${index + 1}`,
      total: orders.filter((order) => {
        const date = toDate(order.createdAt);
        return Boolean(date && date >= weekStart && date < weekEnd);
      }).length,
    };
  });
}
