"use client";

import { connectReactDebugChannel } from "next/dist/server/dev/debug-channel";
import {
  Pie,
  PieChart,
  Sector,
  PieSectorDataItem,
  Tooltip,
  Cell,
} from "recharts";

/* ================= DATA ================= */

/* ================= ACTIVE SHAPE ================= */

const RADIAN = Math.PI / 180;

const renderActiveShape = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  percent,
  value,
}: PieSectorDataItem) => {
  const sin = Math.sin(-RADIAN * (midAngle ?? 0));
  const cos = Math.cos(-RADIAN * (midAngle ?? 0));

  return (
    <g>
      {/* Center text */}
      <text
        x={cx}
        y={cy}
        dy={-4}
        textAnchor="middle"
        className="fill-foreground text-sm font-medium"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy}
        dy={16}
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
      >
        {value} Orders
      </text>

      {/* Main slice */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />

      {/* Glow ring */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={(outerRadius ?? 0) + 4}
        outerRadius={(outerRadius ?? 0) + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.35}
      />

      {/* Percentage */}
      <text
        x={cx}
        y={(cy ?? 0) + (outerRadius ?? 0) + 28}
        textAnchor="middle"
        className="fill-muted-foreground text-xs"
      >
        {`${((percent ?? 0) * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

/* ================= COMPONENT ================= */
interface PieChartData {
  totalOrders?: number;
  completed?: number;
  pending?: number;
  inProgress?: number;
  cancelled?: number;
  totalPaid?: number;
}
interface Props {
  PiChartData: PieChartData;
}
export default function OrderStatusPieChart({PiChartData }: Props) {
  const { 
  totalOrders = 0, 
  completed = 0, 
  pending = 0, 
  inProgress = 0, 
  cancelled = 0, 
  totalPaid = 0 
} = PiChartData;
  const orderStatusData = [
    { name: "In Progress", value: inProgress, color: "#3B82F6" },
  { name: "Pending", value: pending, color: "#F59E0B" },
  { name: "Completed", value: completed, color: "#22C55E" },
  { name: "Cancelled", value: cancelled, color: "#EF4444" },

  // Optional slices for totalOrders & totalPaid
  { name: "Total Orders", value: totalOrders, color: "#8B5CF6" }, // purple
  // { name: "Total Paid", value: Number(totalPaid), color: "#10B981" }, 
  ];
  return (
    <div className="flex flex-col justify-center items-center -mt-14 relative">
      <div
        className="absolute font-medium  bottom-5 text-center left-1/2 -translate-x-1/2 flex"
      >Total Paid:
      <p className="text-md font-normal "> Pk{totalPaid.toFixed(2)}</p>
      </div>
      <PieChart width={420} height={420}>
        <Pie
          data={orderStatusData}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          // activeIndex={0}
          activeShape={renderActiveShape}
          dataKey="value"
        >
          {/* ✅ THIS IS THE KEY FIX */}
          {orderStatusData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>

        <Tooltip />
      </PieChart>
    </div>
  );
}
