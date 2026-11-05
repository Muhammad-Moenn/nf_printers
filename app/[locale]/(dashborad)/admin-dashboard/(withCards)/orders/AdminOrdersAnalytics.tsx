"use client";

import {
  Activity,
  BarChart3,
  CalendarDays,
  Layers3,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AdminOrdersAnalytics } from "@/app/schemas/admin-dashboard-schema";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center text-muted-foreground">
      <BarChart3 className="h-9 w-9 opacity-70" />
      <p className="mt-3 text-sm font-medium">{label}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary-soft text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-xl font-semibold text-foreground dark:text-neutral-100">
        {value}
      </p>
    </div>
  );
}

export function AdminOrdersAnalyticsMetrics({
  analytics,
}: {
  analytics: AdminOrdersAnalytics;
}) {
  return (
    <section
      aria-label="Order performance summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <Metric
        label="Orders Today"
        value={analytics.ordersToday}
        icon={CalendarDays}
      />
      <Metric
        label="This Week"
        value={analytics.ordersThisWeek}
        icon={Activity}
      />
      <Metric
        label="This Month"
        value={analytics.ordersThisMonth}
        icon={TrendingUp}
      />
      <Metric
        label="Average Completed Value"
        value={formatCurrency(analytics.averageCompletedOrderValue)}
        icon={Layers3}
      />
    </section>
  );
}

export default function AdminOrdersAnalyticsPanel({
  analytics,
  showMetrics = true,
}: {
  analytics: AdminOrdersAnalytics;
  showMetrics?: boolean;
}) {
  const hasMonthlyOrders = analytics.monthlyOrders.some(
    (point) => point.total > 0
  );
  const hasYearlyOrders = analytics.yearlyOrders.some(
    (point) => point.total > 0
  );

  return (
    <div className="grid gap-6">
      {showMetrics && <AdminOrdersAnalyticsMetrics analytics={analytics} />}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-5 shadow dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-foreground dark:text-neutral-100">
              Monthly Orders
            </h2>
            <p className="text-sm text-muted-foreground">
              Current year orders by status
            </p>
          </div>

          <div className="h-[320px]">
            {hasMonthlyOrders ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
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
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="completed" stroke="var(--success)" strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" stroke="var(--warning)" strokeWidth={2} />
                  <Line type="monotone" dataKey="processing" stroke="var(--violet)" strokeWidth={2} />
                  <Line type="monotone" dataKey="inProgress" name="in progress" stroke="var(--info)" strokeWidth={2} />
                  <Line type="monotone" dataKey="cancelled" stroke="var(--destructive)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="No monthly order data yet" />
            )}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-5 shadow dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-foreground dark:text-neutral-100">
              Yearly Orders
            </h2>
            <p className="text-sm text-muted-foreground">
              Order volume and completed revenue by year
            </p>
          </div>

          <div className="h-[320px]">
            {hasYearlyOrders ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.yearlyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="orders"
                    allowDecimals={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="revenue"
                    orientation="right"
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
                    formatter={(value, name) =>
                      name === "revenue"
                        ? [formatCurrency(Number(value ?? 0)), "Revenue"]
                        : [value, name]
                    }
                  />
                  <Legend />
                  <Bar yAxisId="orders" dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="orders" dataKey="completed" fill="var(--success)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="revenue" dataKey="revenue" fill="var(--accent-text)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="No yearly order data yet" />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-5 shadow dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-foreground dark:text-neutral-100">
            Popular Services
          </h2>
          <p className="text-sm text-muted-foreground">
            Highest demand services from all orders
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {analytics.topServices.length ? (
            analytics.topServices.map((service, index) => (
              <div
                key={service.name}
                className="rounded-lg border border-border bg-card p-4 dark:border-[var(--input)] dark:bg-[var(--surface-3)]"
              >
                <p className="text-xs font-semibold text-muted-foreground">
                  #{index + 1}
                </p>
                <p className="mt-2 min-h-10 text-sm font-semibold text-foreground dark:text-neutral-100">
                  {service.name}
                </p>
                <p className="mt-2 text-2xl font-semibold text-primary-text dark:text-primary-soft-foreground">
                  {service.value}
                </p>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-5">
              <EmptyChart label="No service data yet" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
