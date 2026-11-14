"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  Download,
  ExternalLink,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  RevenueManagementPayload,
  RevenuePeriod,
} from "@/app/schemas/admin-dashboard-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_ADMIN_REVENUE_PERIOD } from "@/lib/query/admin-defaults";
import { useAdminRevenue } from "@/lib/query/hooks/use-admin-revenue";
import { queryKeys } from "@/lib/query/query-keys";

type ChartRange = "daily" | "weekly" | "monthly";
type PaymentStatusFilter = "all" | "unpaid" | "overdue";

const money = (amount: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

const shortDate = (date: string | null) => {
  if (!date) return "Not set";
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const dateRanges: { value: RevenuePeriod; label: string }[] = [
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "this-year", label: "This Year" },
  { value: "all-time", label: "All Time" },
];

function percentChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function StatCard({
  title,
  value,
  description,
  change,
  icon: Icon,
  tone,
  unavailable = false,
}: {
  title: string;
  value: string;
  description: string;
  change?: number;
  icon: typeof CircleDollarSign;
  tone: "blue" | "green" | "amber" | "orange" | "violet";
  unavailable?: boolean;
}) {
  const tones = {
    blue: "bg-primary-soft text-primary-text dark:bg-primary/15 dark:text-primary-soft-foreground",
    green:
      "bg-success-soft text-success-text dark:bg-success/15 dark:text-success-soft-foreground",
    amber:
      "bg-warning-soft text-warning-text dark:bg-warning/15 dark:text-warning-soft-foreground",
    orange:
      "bg-warning-soft text-warning-text dark:bg-warning/15 dark:text-warning-soft-foreground",
    violet:
      "bg-violet-soft text-violet-text dark:bg-violet/15 dark:text-violet-soft-foreground",
  };
  const positive = change !== undefined && change >= 0;

  return (
    <article className="min-h-[128px] rounded-lg border border-primary-border bg-card/80 p-4 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-2)] sm:p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-[13px] font-medium leading-tight text-foreground dark:text-neutral-200">
          {title}
        </p>
      </div>
      <p
        className={`mt-3 truncate text-[21px] font-bold leading-tight text-foreground dark:text-on-color ${unavailable ? "text-base" : ""}`}
      >
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-muted-foreground dark:text-neutral-400">
        {description}
      </p>
      {change !== undefined && (
        <div
          className={`mt-2 flex items-center gap-1 text-[11px] font-semibold ${positive ? "text-success-text dark:text-success-soft-foreground" : "text-destructive-text dark:text-destructive-text"}`}
        >
          {positive ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )}
          {Math.abs(change)}%{" "}
          <span className="ml-1 font-normal text-muted-foreground dark:text-neutral-400">
            vs. last period
          </span>
        </div>
      )}
    </article>
  );
}

function RevenueManagementChart({
  data,
  range,
  setRange,
}: {
  data: RevenueManagementPayload;
  range: ChartRange;
  setRange: (range: ChartRange) => void;
}) {
  const chartData =
    range === "daily"
      ? data.dailyAnalytics
      : range === "weekly"
        ? data.weeklyAnalytics
        : data.monthlyAnalytics;
  const hasData = chartData.some(
    (point) => point.revenue > 0 || point.paymentsReceived > 0,
  );

  return (
    <section className="rounded-lg border border-primary-border bg-card/80 p-4 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-2)] sm:p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/15 dark:text-primary-soft-foreground">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-foreground dark:text-neutral-100">
              Revenue Analytics
            </h2>
            <p className="text-[11px] text-muted-foreground dark:text-neutral-400">
              Revenue vs. Payments Received
            </p>
          </div>
        </div>
        <div className="flex rounded-lg border border-primary-border bg-card p-0.5 dark:border-[var(--input)] dark:bg-[var(--surface-1)]">
          {(["daily", "weekly", "monthly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRange(option)}
              className={`rounded-md px-3 py-1.5 text-[11px] capitalize transition-colors ${range === option ? "bg-primary-soft font-semibold text-primary-text dark:bg-primary/15 dark:text-primary-soft-foreground" : "text-muted-foreground hover:text-primary-text dark:text-neutral-400"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-1 flex justify-end gap-5 text-[10px] text-muted-foreground dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-primary" />
          Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <i className="h-2 w-2 rounded-full bg-success" />
          Payments Received
        </span>
      </div>
      <div className="h-[220px] sm:h-[250px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 2, left: 0 }}
            >
              <defs>
                <linearGradient id="receivedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--success)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--success)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--primary-border)"
                vertical={true}
                strokeDasharray="2 3"
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={42}
                tickFormatter={(value) =>
                  Number(value) >= 1000
                    ? `${Math.round(Number(value) / 1000)}k`
                    : String(value)
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  money(Number(value ?? 0)),
                  name === "revenue" ? "Revenue" : "Payments Received",
                ]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--primary-border)",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="paymentsReceived"
                stroke="var(--success)"
                fill="url(#receivedFill)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: "var(--primary)" }}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <BarChart3 className="h-8 w-8 text-neutral-400" />
            <p className="mt-2 text-sm font-medium text-muted-foreground dark:text-neutral-300">
              No revenue data for this period
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function PaymentStatusOverview({ data }: { data: RevenueManagementPayload }) {
  const total = data.paymentStatuses.reduce((sum, item) => sum + item.count, 0);
  return (
    <section className="rounded-lg border border-primary-border bg-card/80 p-4 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-2)]">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/15 dark:text-primary-soft-foreground">
          <Wallet className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-[15px] font-semibold text-foreground dark:text-neutral-100">
            Payment Status Overview
          </h2>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground dark:text-neutral-400">
            Payment status breakdown
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[140px_1fr] items-center gap-3 sm:grid-cols-[150px_1fr]">
        <div className="relative h-[150px] w-[150px] max-w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.paymentStatuses}
                dataKey="count"
                nameKey="name"
                innerRadius={47}
                outerRadius={68}
                paddingAngle={1}
                stroke="var(--on-color)"
                strokeWidth={1}
              >
                {data.paymentStatuses.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} payments`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground dark:text-neutral-100">
              {total}
            </span>
            <span className="text-[10px] text-muted-foreground">Total Payments</span>
          </div>
        </div>
        <div className="space-y-2">
          {data.paymentStatuses.map((status) => (
            <div
              key={status.name}
              className="grid grid-cols-[1fr_auto] gap-x-2 border-b border-border-subtle pb-1.5 text-[11px] last:border-0 dark:border-[var(--input)]"
            >
              <span className="flex items-center gap-2 text-muted-foreground dark:text-neutral-300">
                <i
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                {status.name}
              </span>
              <span className="font-semibold text-foreground dark:text-neutral-100">
                {status.count}
                <span className="ml-2 hidden text-muted-foreground 2xl:inline">
                  {money(status.amount)}
                </span>
              </span>
              <span className="col-start-2 text-[10px] text-muted-foreground 2xl:hidden">
                {money(status.amount)}
              </span>
            </div>
          ))}
          {!data.paymentStatuses.length && (
            <p className="text-xs text-muted-foreground">
              No payment records for this period.
            </p>
          )}
        </div>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground dark:text-neutral-400">
        The database tracks paid, unpaid, and refunded statuses.
      </p>
    </section>
  );
}

function OutstandingPayments({
  data,
}: {
  data: RevenueManagementPayload["outstandingPayments"];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatusFilter>("all");
  const today = new Date();
  const rows = data.filter((row) => {
    const overdue =
      row.dueDate !== null &&
      new Date(row.dueDate) < today &&
      row.outstanding > 0;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "overdue" ? overdue : row.status === "unpaid");
    const q = search.trim().toLowerCase();
    return (
      matchesStatus &&
      (!q ||
        row.customer.toLowerCase().includes(q) ||
        row.id.toLowerCase().includes(q))
    );
  });
  const exportRows = () =>
    downloadCsv("outstanding-payments.csv", [
      [
        "Customer",
        "Order ID",
        "Order Amount",
        "Amount Paid",
        "Outstanding",
        "Due Date",
        "Status",
      ],
      ...rows.map((row) => [
        row.customer,
        row.id,
        row.orderAmount,
        row.amountPaid,
        row.outstanding,
        shortDate(row.dueDate),
        row.dueDate && new Date(row.dueDate) < today ? "Overdue" : "Unpaid",
      ]),
    ]);

  return (
    <section className="overflow-hidden rounded-lg border border-primary-border bg-card/80 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-2)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle p-4 dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/15 dark:text-primary-soft-foreground">
            <CreditCard className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground dark:text-neutral-100">
              Outstanding Payments
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Customers with pending balances
            </p>
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 lg:w-auto">
          <div className="relative min-w-[160px] flex-1 lg:w-44 lg:flex-none">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer or order..."
              className="h-8 bg-card pl-8 text-[11px] dark:border-[var(--input)] dark:bg-[var(--surface-1)]"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as PaymentStatusFilter)
            }
          >
            <SelectTrigger className="h-9 w-[120px] bg-card text-[11px] dark:border-[var(--input)] dark:bg-[var(--surface-4)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-[11px]"
            onClick={exportRows}
            disabled={!rows.length}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>
      <div className="max-h-[300px] overflow-auto">
        <table className="w-full min-w-[680px] text-left text-[10px]">
          <thead className="sticky top-0 z-10 bg-surface-2 text-muted-foreground dark:bg-[var(--surface-1)] dark:text-neutral-300">
            <tr>
              {[
                "Customer",
                "Order ID",
                "Order Amount",
                "Amount Paid",
                "Outstanding",
                "Due Date",
                "Status",
                "Actions",
              ].map((label) => (
                <th key={label} className="px-3 py-2.5 font-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => {
                const overdue =
                  row.dueDate !== null &&
                  new Date(row.dueDate) < today &&
                  row.outstanding > 0;
                return (
                  <tr
                    key={row.id}
                    className="border-t border-border-subtle text-foreground dark:border-[var(--border)] dark:text-neutral-300"
                  >
                    <td className="px-3 py-3 font-medium">{row.customer}</td>
                    <td className="px-3 py-3 font-semibold text-primary-text dark:text-primary-soft-foreground">
                      #{row.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-3 py-3">{money(row.orderAmount)}</td>
                    <td className="px-3 py-3">{money(row.amountPaid)}</td>
                    <td className="px-3 py-3 font-semibold">
                      {money(row.outstanding)}
                    </td>
                    <td className="px-3 py-3">{shortDate(row.dueDate)}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-badge px-2 py-1 font-medium ${overdue ? "bg-destructive-soft text-destructive-text dark:bg-destructive/10 dark:text-destructive-soft-foreground" : "bg-warning-soft text-warning-text dark:bg-warning/10 dark:text-warning-soft-foreground"}`}
                      >
                        {overdue ? "Overdue" : "Unpaid"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href="/admin-dashboard/orders"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300"
                        aria-label={`Open order ${row.id}`}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-xs text-muted-foreground"
                >
                  {search || statusFilter !== "all"
                    ? "No outstanding payments match these filters."
                    : "No outstanding payment records."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RecentTransactions({
  data,
}: {
  data: RevenueManagementPayload["recentTransactions"];
}) {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const rows = useMemo(
    () =>
      data.filter((item) => {
        const q = search.trim().toLowerCase();
        return (
          (!q ||
            item.id.toLowerCase().includes(q) ||
            item.customer.toLowerCase().includes(q)) &&
          (method === "all" || item.method === method) &&
          (status === "all" || item.status === status)
        );
      }),
    [data, method, search, status],
  );
  const methods = Array.from(new Set(data.map((item) => item.method)));

  return (
    <section className="overflow-hidden rounded-lg border border-primary-border bg-card/80 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface-2)]">
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle p-4 dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/15 dark:text-primary-soft-foreground">
            <Database className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground dark:text-neutral-100">
              Recent Transactions
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Latest payment activity
            </p>
          </div>
        </div>
        <Link
          href="/admin-dashboard/orders"
          className="rounded-md border border-border px-2.5 py-1.5 text-[10px] font-medium text-foreground hover:border-primary-border hover:text-primary-text dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300"
        >
          View All
        </Link>
      </div>
      <div className="space-y-2 border-b border-border-subtle p-3 dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer, transaction ID..."
            className="h-8 bg-card pl-8 text-[11px] dark:border-[var(--input)] dark:bg-[var(--surface-1)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="h-9 bg-card text-[10px] dark:border-[var(--input)] dark:bg-[var(--surface-4)]">
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              {methods.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 bg-card text-[10px] capitalize dark:border-[var(--input)] dark:bg-[var(--surface-4)]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Array.from(new Set(data.map((item) => item.status))).map(
                (item) => (
                  <SelectItem key={item} value={item} className="capitalize">
                    {item}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="max-h-[244px] overflow-auto">
        <table className="w-full min-w-[440px] text-left text-[10px]">
          <thead className="sticky top-0 bg-surface-2 text-muted-foreground dark:bg-[var(--surface-1)] dark:text-neutral-300">
            <tr>
              {["ID", "Customer", "Amount", "Method", "Status", "Date"].map(
                (label) => (
                  <th key={label} className="px-2.5 py-2 font-semibold">
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-border-subtle text-foreground dark:border-[var(--border)] dark:text-neutral-300"
                >
                  <td className="px-2.5 py-2.5 font-medium">
                    {row.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="max-w-24 truncate px-2.5 py-2.5">
                    {row.customer}
                  </td>
                  <td className="px-2.5 py-2.5">{money(row.amount)}</td>
                  <td className="px-2.5 py-2.5">{row.method}</td>
                  <td className="px-2.5 py-2.5">
                    <span
                      className={`rounded-badge px-2 py-1 capitalize ${row.status === "paid" ? "bg-success-soft text-success-text dark:bg-success/10 dark:text-success-soft-foreground" : row.status === "refunded" ? "bg-destructive-soft text-destructive-text dark:bg-destructive/10 dark:text-destructive-soft-foreground" : "bg-primary-soft text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2.5 py-2.5">
                    {shortDate(row.date)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-8 text-center text-muted-foreground"
                >
                  No payment transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminRevenueManagementClient({
  adminId,
}: {
  adminId: string;
}) {
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<RevenuePeriod>(
    DEFAULT_ADMIN_REVENUE_PERIOD
  );
  const [chartRange, setChartRange] = useState<ChartRange>("monthly");

  const revenueQuery = useAdminRevenue(adminId, period);
  const data = revenueQuery.data;
  const isPending = revenueQuery.isFetching;
  const error = revenueQuery.isError
    ? "Could not refresh revenue data. Please try again."
    : null;

  const refresh = useCallback(
    (nextPeriod: RevenuePeriod = period) => {
      // Switching period mounts a different query key; if it is cached and
      // fresh it should render from cache instead of forcing a request.
      if (nextPeriod !== period) {
        setPeriod(nextPeriod);
        return;
      }

      // Manual refresh retires every period/analytics variant the server
      // invalidated, while only the active query refetches immediately.
      void queryClient.invalidateQueries({
        queryKey: queryKeys.admin.revenueRoot(adminId),
      });
    },
    [queryClient, adminId, period]
  );

  if (!data) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        {error ?? "Loading revenue…"}
      </div>
    );
  }

  const exportReport = () =>
    downloadCsv(`revenue-report-${period}.csv`, [
      [
        "Revenue Management Report",
        dateRanges.find((item) => item.value === period)?.label ?? period,
      ],
      ["Total revenue", data.totals.revenue],
      ["Payments received", data.totals.paymentsReceived],
      ["Outstanding balance", data.totals.outstandingBalance],
      ["Pending payments", data.totals.pendingPaymentAmount],
      ["Refunded amount", data.totals.refundedAmount],
      ["Total expenses", data.totals.expenses],
      ["Net profit", data.totals.netProfit],
      [],
      ["Recent transactions"],
      ["ID", "Customer", "Amount", "Method", "Status", "Date"],
      ...data.recentTransactions.map((item) => [
        item.id,
        item.customer,
        item.amount,
        item.method,
        item.status,
        shortDate(item.date),
      ]),
    ]);

  const totals = data.totals;
  const revenueChange = percentChange(totals.revenue, totals.previousRevenue);
  const receivedChange = percentChange(
    totals.paymentsReceived,
    totals.previousPaymentsReceived,
  );
  const outstandingChange = percentChange(
    totals.outstandingBalance,
    totals.previousOutstandingBalance,
  );
  const pendingChange = percentChange(
    totals.pendingPaymentAmount,
    totals.previousPendingPaymentAmount,
  );
  const expensesChange = percentChange(
    totals.expenses,
    totals.previousExpenses,
  );
  const netProfitChange = percentChange(
    totals.netProfit,
    totals.previousNetProfit,
  );

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 px-4 pb-6 pt-1 sm:px-5">
      <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div className="text-left">
          <h1 className="text-[22px] font-bold tracking-tight text-foreground dark:text-neutral-100">
            Revenue Management
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground dark:text-neutral-400">
            Track revenue, payments, outstanding balances and financial
            performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={period}
            onValueChange={(value) => refresh(value as RevenuePeriod)}
          >
            <SelectTrigger className="h-9 w-[150px] bg-card text-[11px] dark:border-[var(--input)] dark:bg-[var(--surface-4)]">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={exportReport}
            className="h-9 bg-card text-[11px] dark:border-[var(--input)] dark:bg-[var(--surface-4)]"
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
            <ChevronDown className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => refresh()}
            disabled={isPending}
            className="h-9 w-9 bg-card dark:border-[var(--input)] dark:bg-[var(--surface-4)]"
            aria-label="Refresh revenue data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-destructive-border bg-destructive-soft px-3 py-2 text-xs text-destructive-text dark:border-destructive dark:bg-destructive/30 dark:text-destructive-soft-foreground"
        >
          {error}
        </p>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-3">
          <StatCard
            title="Total Revenue"
            value={money(totals.revenue)}
            description="From completed orders"
            change={period === "all-time" ? undefined : revenueChange}
            icon={CircleDollarSign}
            tone="blue"
          />
        </div>
        <div className="xl:col-span-3">
          <StatCard
            title="Payments Received"
            value={money(totals.paymentsReceived)}
            description="Collected payment amount"
            change={period === "all-time" ? undefined : receivedChange}
            icon={Wallet}
            tone="green"
          />
        </div>
        <div className="xl:col-span-3">
          <StatCard
            title="Outstanding Balance"
            value={money(totals.outstandingBalance)}
            description="Amount still due"
            change={period === "all-time" ? undefined : outstandingChange}
            icon={CreditCard}
            tone="amber"
          />
        </div>
        <div className="xl:col-span-3">
          <StatCard
            title="Pending Payments"
            value={money(totals.pendingPaymentAmount)}
            description={`${totals.pendingPaymentCount} unpaid payment records`}
            change={period === "all-time" ? undefined : pendingChange}
            icon={Clock3}
            tone="orange"
          />
        </div>
        <div className="xl:col-span-4">
          <StatCard
            title="Total Expenses"
            value={money(totals.expenses)}
            description="Tracked operating expenses"
            change={period === "all-time" ? undefined : expensesChange}
            icon={Database}
            tone="violet"
          />
        </div>
        <div className="xl:col-span-4">
          <StatCard
            title="Net Profit"
            value={money(totals.netProfit)}
            description="Revenue minus refunds and expenses"
            change={period === "all-time" ? undefined : netProfitChange}
            icon={TrendingUp}
            tone="green"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <RevenueManagementChart
            data={data}
            range={chartRange}
            setRange={setChartRange}
          />
        </div>
        <div className="xl:col-span-4">
          <PaymentStatusOverview data={data} />
        </div>
      </section>

      <section className="grid grid-cols-1 items-start gap-3 2xl:grid-cols-12">
        <div className="2xl:col-span-7">
          <OutstandingPayments data={data.outstandingPayments} />
        </div>
        <div className="2xl:col-span-5">
          <RecentTransactions data={data.recentTransactions} />
        </div>
      </section>

      <p className="flex items-center gap-1 text-[10px] text-muted-foreground dark:text-neutral-400">
        <Check className="h-3 w-3 text-success-text" />
        {isPending
          ? "Updating data…"
          : "Revenue, payments, expenses, and transaction lists use stored order, payment, and expense records."}
      </p>
    </div>
  );
}
