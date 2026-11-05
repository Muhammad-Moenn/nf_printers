"use client";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserChartsProps {
  monthlySignups: { month: string; users: number }[];
  spendingByUser: { name: string; spent: number }[];
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-3)",
  "var(--chart-6)",
  "var(--chart-5)",
  "var(--chart-7)",
];

const UserCharts = ({ monthlySignups, spendingByUser }: UserChartsProps) => {
  const spending = useMemo(
    () =>
      spendingByUser.map((user) => ({
        name: user.name.split(" ")[0],
        spent: user.spent,
      })),
    [spendingByUser]
  );

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      {/* Monthly Signups */}
      <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 shadow transition-shadow hover:shadow-md dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]">
        <Card className="bg-transparent shadow-none border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              User Signups
            </CardTitle>
          </CardHeader>
          <CardContent className="">
            <div className="h-[250px] ">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySignups}>
                  <defs>
                    <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fill="url(#signupGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Status Distribution */}
      {/* <div
        className="rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]"
      >
        <Card className="bg-transparent shadow-none border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              User Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={
                          i === 0 ? "var(--chart-6)" : "var(--chart-5)"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) => (
                      <span className="text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div> */}
      {/* Top Spenders */}
      <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 shadow transition-shadow hover:shadow-md dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]">
        <Card className="bg-transparent shadow-none border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top Spenders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spending} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={55}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: 12,
                    }}
                    // formatter={(value: number) => [`$${value.toLocaleString()}`, "Spent"]}
                  />
                  <Bar
                    dataKey="spent"
                    fill="var(--chart-3)"
                    radius={[0, 4, 4, 0]}
                  >
                    {spending.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserCharts;
