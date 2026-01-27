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
import { useTheme } from "next-themes";

interface Props {
  data: {
    month: string;
    total: number;
  }[];
}

export default function MonthlyPaidChart({ data }: Props) {
  const { theme } = useTheme();

  const tickColor = theme ==="dark" ? "rgb(226,225,225)": "hsl(var(--muted-foreground))";

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
  <AreaChart data={data}>
    <defs>
      <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
      stroke="#3B82F6"
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
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
            stroke="#22C55E"
            fill="url(#paidGradient)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer> */}