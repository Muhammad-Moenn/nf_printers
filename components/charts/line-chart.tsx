"use client";


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
  const axisColor = "var(--muted-foreground)";

  return (
    <div className="h-full min-h-0 w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <LineChart data={data}>
          {/* Grid */}
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"  />

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
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
              borderRadius: 8,
              border: "1px solid var(--primary)",
            }}
          />

          {/* Lines */}
          <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="completed" stroke="var(--success)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="pending" stroke="var(--warning)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="cancelled" stroke="var(--destructive)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
