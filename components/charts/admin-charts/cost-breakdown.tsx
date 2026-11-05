"use client";
import { Wallet } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const costData = [
  { name: "Paper", value: 4200, color: "var(--accent)" },
  { name: "Ink", value: 2800, color: "var(--info)" },
  { name: "Machine Maintenance", value: 1500, color: "var(--success)" },
  { name: "Labor", value: 6200, color: "var(--violet)" },
  { name: "Packaging / Delivery", value: 1800, color: "var(--destructive)" },
];

const totalCost = costData.reduce((sum, d) => sum + d.value, 0);

const CostBreakdown = () => {
  return (
    <div className="">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Cost Breakdown</h2>
          <p className="stat-label mt-1">Operational expenses</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
          <Wallet className="h-5 w-5 text-destructive" />
        </div>
      </div>

      <div className="relative mx-auto mb-4 h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={costData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={2} stroke="var(--popover)">
              {costData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--popover-foreground)",
              }}
              // formatter={(value: number) => [`$${value.toLocaleString()}`, "Cost"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-foreground">${(totalCost / 1000).toFixed(1)}k</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {costData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-secondary-foreground">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-foreground">${item.value.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{((item.value / totalCost) * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostBreakdown;
