"use client";
import { TrendingUp, DollarSign } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 18500 },
  { month: "Feb", revenue: 22300 },
  { month: "Mar", revenue: 19800 },
  { month: "Apr", revenue: 27600 },
  { month: "May", revenue: 31200 },
  { month: "Jun", revenue: 28900 },
  { month: "Jul", revenue: 34500 },
  { month: "Aug", revenue: 36700 },
  { month: "Sep", revenue: 35200 },
  { month: "Oct", revenue: 38900 },
  { month: "Nov", revenue: 42100 },
  { month: "Dec", revenue: 46800 },
];

const revenueByProduct = [
  { name: "Flyers", revenue: 12400 },
  { name: "Brochures", revenue: 9800 },
  { name: "Banners", revenue: 7200 },
  { name: "Business Cards", revenue: 5100 },
];

const RevenueAnalytics = () => {
  return (
    <div className=" ">
      <div className="mb-5 flex items-center  gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div className="text-left">
          <h2 className="text-xl font-semibold text-foreground">
            Revenue Analytics
          </h2>
          <p className="stat-label ">Performance overview</p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-200/70 dark:gray-200/70 p-3 dark:bg-gray-800/90 border-1 border-slate-300/70 shadow-sm invert-0 dark:border-gray-600/70">
          <p className="stat-label">Today</p>
          <p className="stat-value text-lg">$1,240</p>
        </div>
        <div className="rounded-lg bg-slate-200/70 p-3 dark:bg-gray-200/70 dark:bg-gray-800/90 border-1 border-slate-300/70 shadow-sm invert-0 dark:border-gray-600/70">
          <p className="stat-label">This Week</p>
          <p className="stat-value text-lg">$8,420</p>
        </div>
        <div className="rounded-lg bg-slate-200/70 p-3 dark:bg-gray-200/70 dark:bg-gray-800/90 border-1 border-slate-300/70 shadow-sm invert-0 dark:border-gray-600/70">
          <p className="stat-label">This Month</p>
          <p className="stat-value text-lg">$34,500</p>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-success">+12.5%</span>
        <span className="text-xs text-muted-foreground">vs last month</span>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 18% 22%)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 22% 14%)",
                border: "1px solid hsl(220 18% 22%)",
                borderRadius: "8px",
                color: "hsl(210 20% 92%)",
              }}
              // formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Bar
              dataKey="revenue"
              fill="hsl(36 90% 55%)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
