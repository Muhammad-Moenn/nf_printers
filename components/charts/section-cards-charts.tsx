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
  color = "var(--success)", // progress color (green)
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
  const remainingColor = theme === "dark" ? "var(--muted-foreground)" : "var(--border)"; // dark: gray-800, light: gray-200
  const textColor = theme === "dark" ? "var(--foreground)" : "var(--foreground)"; // dark: gray-50, light: gray-900

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
                fontSize={13}
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