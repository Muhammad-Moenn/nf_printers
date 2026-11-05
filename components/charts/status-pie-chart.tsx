"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface PieChartData {
  totalOrders?: number;
  completed?: number;
  pending?: number;
  processing?: number;
  inProgress?: number;
  cancelled?: number;
  totalPaid?: number;
}

export default function OrderStatusPieChart({
  PiChartData,
}: {
  PiChartData: PieChartData;
}) {
  const {
    totalOrders = 0,
    completed = 0,
    pending = 0,
    processing = 0,
    inProgress = 0,
    cancelled = 0,
    totalPaid = 0,
  } = PiChartData;
  const statuses = [
    { name: "Pending", value: pending, color: "var(--warning)" },
    { name: "Processing", value: processing, color: "var(--primary)" },
    { name: "In Progress", value: inProgress, color: "var(--success)" },
    { name: "Completed", value: completed, color: "var(--violet)" },
    { name: "Cancelled", value: cancelled, color: "var(--destructive)" },
  ];

  return (
    <div className="flex min-w-0 flex-col items-center gap-3 sm:flex-row sm:justify-between sm:gap-2">
      <div className="relative h-[160px] w-full max-w-[200px] shrink-0 sm:w-[48%]">
        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
          <PieChart>
            <Pie data={statuses} cx="50%" cy="50%" innerRadius={52} outerRadius={76} dataKey="value" stroke="none">
              {statuses.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-foreground dark:text-neutral-100">
          <span className="text-3xl font-bold tabular-nums">{totalOrders}</span>
          <span className="text-[11px]">Total orders</span>
        </div>
      </div>
      <div className="w-full space-y-2 px-1 sm:flex-1">
        {statuses.map((status) => {
          const percent = totalOrders ? (status.value / totalOrders) * 100 : 0;
          return (
            <div key={status.name} className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: status.color }} />
              <span className="min-w-0 flex-1 truncate">{status.name}</span>
              <span className="w-5 text-right font-semibold tabular-nums">{status.value}</span>
              <span className="w-12 text-right text-muted-foreground tabular-nums dark:text-neutral-400">{percent.toFixed(1)}%</span>
            </div>
          );
        })}
        <p className="pt-1 text-[11px] text-muted-foreground dark:text-neutral-400">
          Paid this month: PKR {Number(totalPaid).toLocaleString("en-PK", { maximumFractionDigits: 0 })}
        </p>
      </div>
    </div>
  );
}
