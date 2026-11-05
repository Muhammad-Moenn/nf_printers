"use client";

import { useState } from "react";
import { ChartLine } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type OrderChartPoint = {
  label: string;
  total: number;
};

export default function OrdersOverTimePanel({
  data,
}: {
  data: Record<"7D" | "30D" | "90D", OrderChartPoint[]>;
}) {
  const [range, setRange] = useState<"7D" | "30D" | "90D">("7D");
  const activeData = data[range];

  return (
    <section className="min-w-0 rounded-lg border border-primary-border bg-card p-4 shadow-[var(--shadow-sm)] dark:border-on-color/10 dark:bg-card sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-text dark:bg-primary/10 dark:text-primary-soft-foreground">
            <ChartLine className="h-5 w-5" />
          </span>
          <h2 className="text-base font-semibold text-foreground dark:text-neutral-100 sm:text-lg">
            Orders over time
          </h2>
        </div>
        <div className="inline-flex shrink-0 rounded-full border border-primary-border bg-surface-2 p-0.5 dark:border-on-color/10 dark:bg-on-color/[0.04]">
          {(["7D", "30D", "90D"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={range === option}
              onClick={() => setRange(option)}
              className={`h-8 min-w-12 rounded-control px-3 text-xs font-semibold transition-colors ${
                range === option
                  ? "bg-primary text-on-color shadow-sm"
                  : "text-muted-foreground hover:bg-primary-soft dark:text-neutral-300 dark:hover:bg-on-color/[0.06]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[180px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
          <AreaChart data={activeData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="ordersAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--primary-border)" vertical horizontal />
            <XAxis
              dataKey="label"
              axisLine={{ stroke: "var(--primary-border)" }}
              tickLine={false}
              tick={{ fill: "var(--neutral-700)", fontSize: 11, fontWeight: 500 }}
              interval={range === "7D" ? 0 : "preserveStartEnd"}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              width={28}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--neutral-700)", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid var(--primary-border)",
                borderRadius: 10,
                boxShadow: "var(--shadow-lg)",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              name="Orders"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#ordersAreaFill)"
              activeDot={{ r: 4, fill: "var(--accent)", stroke: "white", strokeWidth: 2 }}
              dot={range === "7D" ? { r: 2.5, fill: "var(--accent)", stroke: "white", strokeWidth: 1 } : false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
