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
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockUser } from "@/data/mockUsers";

interface UserChartsProps {
  users: MockUser[];
}

const COLORS = [
  "hsl(36, 90%, 55%)",
  "hsl(220, 60%, 20%)",
  "hsl(152, 60%, 40%)",
  "hsl(0, 72%, 51%)",
  "hsl(220, 15%, 60%)",
];

const UserCharts = ({ users }: UserChartsProps) => {
  const monthlySignups = useMemo(() => {
    const months: Record<string, number> = {};
    users.forEach((u) => {
      const d = new Date(u.joinedDate);
      const key = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([month, count]) => ({ month, users: count }));
  }, [users]);

  const statusData = useMemo(() => {
    const active = users.filter((u) => u.status === "active").length;
    const suspended = users.filter((u) => u.status === "suspended").length;
    return [
      { name: "Active", value: active },
      { name: "Suspended", value: suspended },
    ];
  }, [users]);

  const planData = useMemo(() => {
    const plans: Record<string, number> = {};
    users.forEach((u) => {
      const plan = u.subscription.plan;
      plans[plan] = (plans[plan] || 0) + 1;
    });
    return Object.entries(plans).map(([name, value]) => ({ name, value }));
  }, [users]);

  const spendingByUser = useMemo(() => {
    return users
      .slice()
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6)
      .map((u) => ({ name: u.name.split(" ")[0], spent: u.totalSpent }));
  }, [users]);

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
      {/* Monthly Signups */}
      <div
        className=" rounded-lg overflow-hidden  shadow    transition-shadow hover:shadow-md bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
              dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] justify-center items-center border border-gray-200 dark:border-gray-600/70"
      >
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
                        stopColor="hsl(36, 90%, 55%)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(36, 90%, 55%)"
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
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(36, 90%, 55%)"
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
        className="bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
              dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] justify-center items-center border border-gray-200 dark:border-gray-600/70 rounded-lg"
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
                          i === 0 ? "hsl(152, 60%, 40%)" : "hsl(0, 72%, 51%)"
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
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
      <div
        className="bg-gradient-to-t from-blue-50/70 via-blue-50/60 to-gray-50/90
              dark:from-[#11151a] dark:via-[#1e232a]/90 dark:to-[#17181e] justify-center items-center border border-gray-200 dark:border-gray-600/70 rounded-lg"
      >
      <Card className="bg-transparent shadow-none border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Spenders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingByUser} layout="vertical">
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
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    fontSize: 12,
                  }}
                  // formatter={(value: number) => [`$${value.toLocaleString()}`, "Spent"]}
                />
                <Bar
                  dataKey="spent"
                  fill="hsl(220, 60%, 20%)"
                  radius={[0, 4, 4, 0]}
                >
                  {spendingByUser.map((_, i) => (
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
