"use client";

import { PieChart, Pie, Cell, Label } from "recharts";
import { useTheme } from "next-themes";

type DonutCardChartProps = {
  total: number;
  value: number;
  color?: string;
  size?: number;
};

export default function DonutCardChart({
  total,
  value,
  color = "#10B981", // progress color (green)
  size = 100,
}: DonutCardChartProps) {
  const { theme } = useTheme();
  const safeTotal = total === 0 ? 1 : total;
  const percentage = Math.round((value / safeTotal) * 100);

  const data = [
    { name: "progress", value: percentage },
    { name: "remaining", value: 100 - percentage },
  ];

  // Gray colors
  const remainingColor = theme === "dark" ? "#4B5563" : "#E5E7EB"; // dark: gray-800, light: gray-200
  const textColor = theme === "dark" ? "#F9FAFB" : "#111827"; // dark: gray-50, light: gray-900

  return (
    <div style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
          innerRadius="70%"
          outerRadius="90%"
          stroke="none"
          cx="50%"
          cy="50%"
        >
          <Cell fill={color} />
          <Cell fill={remainingColor} />
          {/* Center label */}
          <Label
            position="center"
            content={() => (
              <text
                x={size / 2}
                y={size / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={16}
                fontWeight={600}
                fill={textColor}
              >
                {percentage}%
              </text>
            )}
          />
        </Pie>
      </PieChart>
    </div>
  );
}