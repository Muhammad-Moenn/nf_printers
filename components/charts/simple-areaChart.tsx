"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


interface Props {
  data: {
    month: string;
    total: number;
  }[];
}

export default function MonthlyPaidChart({ data }: Props) {
  const tickColor = "var(--muted-foreground)";

  return (
    <div className="h-[320px] min-h-[320px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
    <XAxis dataKey="month" tick={{ fill: tickColor }} />
    <YAxis tick={{ fill: tickColor }} />

    <Tooltip
      formatter={(value) =>
        typeof value === "number"
          ? `Rs ${value.toLocaleString()}`
          : value
      }
    />

    <Area
      type="monotone"
      dataKey="total"
      stroke="var(--primary)"
      fill="url(#paidGradient)"
      strokeWidth={2.5}
    />
  </AreaChart>
</ResponsiveContainer>

    </div>
  );
}

{/* <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="month" tick={{ fill: tickColor }} />
          <YAxis tick={{ fill: tickColor }} />
          <Tooltip
            formatter={(value) => {
              if (typeof value !== "number") return value;
              return `Rs ${value.toLocaleString()}`;
            }}
          />

          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--success)"
            fill="url(#paidGradient)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer> */}
