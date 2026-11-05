"use client";

import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  BarChart3,
} from "lucide-react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Point = {
  label: string;
  total: number;
};

type Props = {
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  weekSeries: Point[];
  monthSeries: Point[];
};

function MiniChart({ data }: { data: Point[] }) {
  return (
    <div className="mt-2 h-[56px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="miniOrdersFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--primary-border)" />
          <XAxis dataKey="label" hide />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--primary)"
            strokeWidth={1.8}
            fill="url(#miniOrdersFill)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersComparisonCard({
  thisWeek,
  lastWeek,
  thisMonth,
  lastMonth,
  weekSeries,
  monthSeries,
}: Props) {
  const weekDelta = thisWeek - lastWeek;
  const weekChange = lastWeek === 0 ? 0 : (weekDelta / lastWeek) * 100;

  const monthDelta = thisMonth - lastMonth;
  const monthChange = lastMonth === 0 ? 0 : (monthDelta / lastMonth) * 100;

  const TrendIconWeek = weekChange >= 0 ? TrendingUp : TrendingDown;
  const TrendIconMonth = monthChange >= 0 ? TrendingUp : TrendingDown;

  return (
    
    <div className="flex w-full flex-col gap-3 p-4">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
          <CalendarDays className="h-5 w-5" />
        </span>
        <h4 className="text-lg font-semibold text-foreground dark:text-neutral-100 sm:text-xl">
          Weekly vs Monthly Orders
        </h4>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">

        {/* Week */}
        <div className="min-h-[160px] rounded-lg border border-primary-border bg-card/80 p-4 text-left dark:border-on-color/10 dark:bg-on-color/[0.02]">
          <p className="text-sm text-muted-foreground">This Week</p>
          <p className="text-2xl font-semibold">{thisWeek}</p>

          <div className="flex items-center gap-2 mt-1">
            <TrendIconWeek
              className={`w-4 h-4 ${
                weekChange >= 0 ? "text-success-text" : "text-destructive-text"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                weekChange >= 0 ? "text-success-text" : "text-destructive-text"
              }`}
            >
              {weekDelta.toFixed(1)} (
              {weekChange >= 0 ? "+" : ""}
              {weekChange.toFixed(1)}%
              )
            </span>
            <span className="text-xs text-muted-foreground">
              vs last week
            </span>
          </div>

         {thisWeek ?(<MiniChart data={weekSeries} />):(<div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
               <BarChart3 className="lg:w-10 w-6 h-6 lg:h-10 mb-2 opacity-70" />
              No weekly data available
            </div>)} 
        </div>

        {/* Month */}
        <div className="min-h-[160px] rounded-lg border border-primary-border bg-card/80 p-4 text-left dark:border-on-color/10 dark:bg-on-color/[0.02]">
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-2xl font-semibold">{thisMonth}</p>

          <div className="flex items-center gap-2 mt-1">
            <TrendIconMonth
              className={`w-4 h-4 ${
                monthChange >= 0 ? "text-success-text" : "text-destructive-text"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                monthChange >= 0 ? "text-success-text" : "text-destructive-text"
              }`}
            >{monthDelta.toFixed(1)} (
              {monthChange >= 0 ? "+" : ""}
              {monthChange.toFixed(1)}%
            )
            </span>
            <span className="text-xs text-muted-foreground">
              vs last month
            </span>
          </div>

          {thisMonth ?(<MiniChart data={monthSeries} />):(<div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
               <BarChart3 className="w-6 lg:w-10  h-6 lg:h-10 mb-2 opacity-70" />
              No monthly data available
            </div>)}
        </div>

      </div>
    </div>
  );
}
