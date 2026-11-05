"use client";
import {
  BarChart3,
  DollarSign,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type RevenuePoint = {
  month: string;
  revenue: number;
};

type RevenueAnalyticsProps = {
  data: RevenuePoint[];
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  totalRevenue?: number;
  showTotalRevenue?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);

const RevenueAnalytics = ({
  data,
  todayRevenue,
  weekRevenue,
  monthRevenue,
  totalRevenue,
  showTotalRevenue = false,
  isRefreshing = false,
  error = null,
  onRefresh,
}: RevenueAnalyticsProps) => {
  const hasRevenue = data.some((point) => point.revenue > 0);

  return (
    <div className=" ">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-semibold text-foreground">
              Revenue Analytics
            </h2>
            <p className="stat-label">Completed order revenue</p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            aria-label="Refresh revenue analytics"
            title="Refresh revenue analytics"
            disabled={isRefreshing}
            onClick={onRefresh}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-card text-muted-foreground transition-colors hover:border-primary-border hover:text-primary-text disabled:cursor-wait disabled:opacity-60 dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300 dark:hover:border-primary dark:hover:text-primary-soft-foreground"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm font-medium text-destructive-text dark:text-destructive-soft-foreground">
          {error}
        </p>
      )}

      <div
        className={`mb-5 grid gap-3 ${
          showTotalRevenue ? "grid-cols-2 xl:grid-cols-4" : "grid-cols-3"
        }`}
      >
        {showTotalRevenue && totalRevenue !== undefined && (
          <div className="rounded-lg border border-border-strong/70 bg-surface-4/70 p-3 shadow-sm dark:border-[var(--input)] dark:bg-[var(--surface-3)]">
            <p className="stat-label">All Time</p>
            <p className="stat-value text-lg">{formatCurrency(totalRevenue)}</p>
          </div>
        )}
        <div className="rounded-lg bg-surface-4/70 p-3 dark:bg-[var(--surface-3)] border border-border-strong/70 shadow-sm invert-0 dark:border-[var(--input)]">
          <p className="stat-label">Today</p>
          <p className="stat-value text-lg">{formatCurrency(todayRevenue)}</p>
        </div>
        <div className="rounded-lg bg-surface-4/70 p-3 dark:bg-[var(--surface-3)] border border-border-strong/70 shadow-sm invert-0 dark:border-[var(--input)]">
          <p className="stat-label">This Week</p>
          <p className="stat-value text-lg">{formatCurrency(weekRevenue)}</p>
        </div>
        <div className="rounded-lg bg-surface-4/70 p-3 dark:bg-[var(--surface-3)] border border-border-strong/70 shadow-sm invert-0 dark:border-[var(--input)]">
          <p className="stat-label">This Month</p>
          <p className="stat-value text-lg">{formatCurrency(monthRevenue)}</p>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success">
          {formatCurrency(monthRevenue)}
        </span>
        <span className="text-xs text-muted-foreground">this month</span>
      </div>

      <div className="h-52">
        {hasRevenue ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--popover-foreground)",
                }}
                formatter={(value) => [
                  formatCurrency(Number(value ?? 0)),
                  "Revenue",
                ]}
              />
              <Bar
                dataKey="revenue"
                fill="var(--accent)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center border-t border-border-strong/70 text-center dark:border-[var(--input)]">
            <BarChart3 className="h-8 w-8 text-neutral-400 dark:text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground dark:text-neutral-200">
              No completed revenue yet
            </p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              Revenue appears here when a completed order has a value greater
              than zero.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueAnalytics;
