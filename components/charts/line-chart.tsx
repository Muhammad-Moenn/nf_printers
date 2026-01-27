"use client";

import { useTheme } from "next-themes";
import { useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OrdersLineChartProps {
  data: {
    label: string;
    total: number;
    completed: number;
    pending: number;
    cancelled?: number;
    inprogress?: number;
  }[];
  xDataKey?: string; // default is "label"
}

export default function OrdersLineChart({
  data,
  xDataKey = "label",
}: OrdersLineChartProps) {
  const { theme } = useTheme();

  // Dynamic color based on theme
    const axisColor =
    theme === "dark"
      ? "rgb(226,225,225)"
      : "hsl(var(--muted-foreground))";

  return (
    <div className="h-[320px] w-full ">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {/* Grid */}
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"  />

          {/* X Axis */}
          <XAxis
            dataKey={xDataKey}
            tick={{ fill: axisColor }}
            // label={{
            //   value: "Time Period", // X-axis label
            //   position: "bottom",
            //   offset: 0,
            //   fill: axisColor,
            //   style: { fontWeight: 500 },
            // }}
          />

          {/* Y Axis */}
          <YAxis
            allowDecimals={false}
            tick={{ fill: axisColor }}
            // label={{
            //   value: "Orders",
            //   angle: -90,
            //   position: "insideLeft",
            //   fill: axisColor,
            //   style: { fontWeight: 500 },
            // }}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
              color: theme === "dark" ? "#f9fafb" : "#000000",
              borderRadius: 8,
              border: `1px solid ${theme === "dark" ? "#3B82F6" : "#3B82F6"}`,
            }}
          />

          {/* Lines */}
          <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="completed" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="cancelled" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
