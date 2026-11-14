"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChartNoAxesColumn,
  Lightbulb,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import OrderTable from "@/components/order-table";
import { Link } from "@/i18n/navigation";
import {
  EMPTY_ORDERS_REALTIME_DATA,
  useOrdersData,
} from "@/lib/query/hooks/use-orders";

type Props = {
  userId: string;
};

const money = (amount: number) =>
  `Rs ${Math.round(amount).toLocaleString("en-PK")}`;

export default function RealtimeOrdersClient({ userId }: Props) {
  const { data, isRefetchError } = useOrdersData(userId);
  const payload = data ?? EMPTY_ORDERS_REALTIME_DATA;
  const monthlyTotal = payload.monthlyTotal;
  const monthlyOrders = payload.monthlyOrders;

  const orderChart = useMemo(() => monthlyOrders.map((item) => ({
    month: item.label,
    total: Number(item.total) || 0,
  })), [monthlyOrders]);
  const spendChart = useMemo(() => monthlyTotal.map((item, index) => ({
    month: item.month,
    current: Number(item.total) || 0,
    previous: index > 0 ? Number(monthlyTotal[index - 1]?.total) || 0 : 0,
  })), [monthlyTotal]);

  const latestOrderMonth = orderChart[new Date().getMonth()]?.total ?? 0;
  const previousOrderMonth = orderChart[(new Date().getMonth() + 11) % 12]?.total ?? 0;
  const latestSpendMonth = spendChart[new Date().getMonth()]?.current ?? 0;
  const previousSpendMonth = spendChart[(new Date().getMonth() + 11) % 12]?.current ?? 0;
  const percent = (current: number, previous: number) =>
    previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
  const totalOrders = orderChart.reduce((sum, item) => sum + item.total, 0);

  return (
    <main className="min-w-0 space-y-5 px-4 pb-8 pt-4 md:px-6 lg:space-y-5">
      {isRefetchError ? (
        <p
          role="alert"
          className="rounded-lg border border-primary-border bg-card px-4 py-3 text-sm text-destructive-text"
        >
          Unable to refresh orders. Showing the last loaded data.
        </p>
      ) : null}
      <section className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="min-w-0 rounded-lg border border-primary-border bg-card p-4 shadow-[var(--shadow-md)] sm:p-5">
          <header className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-text"><BarChart3 className="h-5 w-5" /></span>
              <h2 className="truncate text-lg font-semibold text-[var(--heading)]">Monthly Orders <span className="font-normal text-muted-foreground text-xs">(Current Year)</span></h2>
            </div>
           
          </header>
          <div className="mb-5 grid grid-cols-1 gap-4 rounded-lg bg-primary-soft/80 p-4 sm:grid-cols-[1fr_1px_1fr] sm:items-center sm:px-6 sm:py-5">
            <div className="flex items-center gap-4 sm:justify-center">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-text"><ShoppingBag className="h-8 w-8" /></span>
              <div><p className="text-3xl font-bold leading-none text-[var(--heading)]">{totalOrders}</p><p className="mt-1 text-sm text-muted-foreground">Total Orders</p></div>
            </div>
            <span className="hidden h-full min-h-16 w-px bg-primary-soft sm:block" />
            <div className="flex items-center gap-3 border-t border-primary-border pt-3 sm:justify-center sm:border-0 sm:pt-0">
              <div className={`flex items-center gap-2 text-2xl font-bold ${percent(latestOrderMonth, previousOrderMonth) >= 0 ? "text-success-text" : "text-destructive-text"}`}>
                {percent(latestOrderMonth, previousOrderMonth) >= 0 ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
                {percent(latestOrderMonth, previousOrderMonth) > 0 ? "+" : ""}{percent(latestOrderMonth, previousOrderMonth).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">vs last month</p>
            </div>
          </div>
          <div className="h-[245px] min-w-0 sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderChart} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs><linearGradient id="ordersAreaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.24} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} /></linearGradient></defs>
                  <CartesianGrid stroke="var(--primary-border)" vertical />
                  <XAxis dataKey="month" tick={{ fill: "var(--border-strong)", fontSize: 12 }} axisLine={{ stroke: "var(--muted-foreground)" }} tickLine={false} interval={0} />
                  <YAxis tick={{ fill: "var(--border-strong)", fontSize: 12 }} axisLine={{ stroke: "var(--muted-foreground)" }} tickLine={false} width={34} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, borderColor: "var(--primary-border)", fontSize: 12 }} />
                  <Area type="monotone" dataKey="total" name="Orders" stroke="var(--primary)" strokeWidth={2.5} fill="url(#ordersAreaFill)" activeDot={{ r: 5 }} dot={{ r: 3, fill: "white", stroke: "var(--primary)", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
          </div>
        </article>

        <article className="min-w-0 rounded-lg border border-primary-border bg-card p-4 shadow-[var(--shadow-md)] sm:p-5">
          <header className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary-text"><Wallet className="h-5 w-5" /></span>
            <h2 className="truncate text-lg font-semibold text-[var(--heading)]">Monthly Spending <span className="font-normal text-muted-foreground text-xs">(Current Year)</span></h2>
          </header>
          <div className="mb-5 grid grid-cols-1 gap-4 rounded-lg bg-primary-soft/80 p-4 sm:grid-cols-[1fr_1px_1fr] sm:items-center sm:px-6 sm:py-5">
            <div className="flex items-center gap-4 sm:justify-center">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-text"><Wallet className="h-8 w-8" /></span>
              <div><p className="text-3xl font-bold leading-none text-[var(--heading)] ">{money(latestSpendMonth)}</p><p className="mt-1 text-sm text-muted-foreground">Total Spending</p></div>
            </div>
            <span className="hidden h-full min-h-16 w-px bg-primary-soft sm:block" />
            <div className="flex items-center gap-3 border-t border-primary-border pt-3 sm:justify-center sm:border-0 sm:pt-0">
              <div className={`flex items-center gap-2 text-2xl font-bold ${percent(latestSpendMonth, previousSpendMonth) >= 0 ? "text-success-text" : "text-destructive-text"}`}>
                {percent(latestSpendMonth, previousSpendMonth) >= 0 ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
                {percent(latestSpendMonth, previousSpendMonth) > 0 ? "+" : ""}{percent(latestSpendMonth, previousSpendMonth).toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">vs last month</p>
            </div>
          </div>
          <div className="h-[245px] min-w-0 sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendChart.slice(0, 6)} margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
                <defs><linearGradient id="monthlySpendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0.03} /></linearGradient></defs>
                <CartesianGrid stroke="var(--primary-border)" vertical />
                <XAxis dataKey="month" tick={{ fill: "var(--border-strong)", fontSize: 12 }} axisLine={{ stroke: "var(--muted-foreground)" }} tickLine={false} />
                <YAxis tick={{ fill: "var(--border-strong)", fontSize: 11 }} axisLine={{ stroke: "var(--muted-foreground)" }} tickLine={false} width={42} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                <Tooltip formatter={(value) => typeof value === "number" ? money(value) : value} contentStyle={{ borderRadius: 12, borderColor: "var(--primary-border)", fontSize: 12 }} />
                <Area type="monotone" dataKey="current" name="Spending" stroke="var(--primary-hover)" strokeWidth={3} fill="url(#monthlySpendFill)" activeDot={{ r: 6 }} dot={{ r: 5, fill: "white", stroke: "var(--primary-hover)", strokeWidth: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-lg border border-primary-border bg-card shadow-[var(--shadow-md)]">
        <div className="border-b border-primary-border px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary-text"><ChartNoAxesColumn className="h-5 w-5" /></span><h2 className="text-lg font-semibold text-[var(--heading)]">My Orders</h2></div>
        </div>
        <div className="min-w-0 pt-4"><OrderTable userId={userId} /></div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-primary-border bg-gradient-to-r from-primary-soft to-violet-soft/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-card text-warning-text shadow-sm"><Lightbulb className="h-6 w-6" /></span><div><h2 className="font-semibold text-[var(--heading)]">A smoother way to print</h2><p className="mt-1 text-sm text-muted-foreground">Place an order and follow its progress from your dashboard.</p></div></div>
        <Link href="/user-dashboard/new-order" className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-on-color shadow-md shadow-primary transition hover:bg-primary">Start new order <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </main>
  );
}
