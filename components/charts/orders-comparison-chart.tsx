"use client";

import {
  TrendingUp,
  TrendingDown,
  CalendarDays,
  BarChart3,
} from "lucide-react";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Point = {
  label: string;
  total: number;
};

type Props = {
  thisWeek: number;
  lastWeek: number;
  thisMonth: number;
  lastMonth: number;
  weekSeries: Point[];
  monthSeries: Point[];
};

function MiniChart({ data }: { data: Point[] }) {
  return (
    <div className="h-20 w-full mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          
          <Tooltip  />
          <Line
            type="monotone"
            dataKey="label"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="total"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersComparisonCard({
  // thisWeek,
  lastWeek,
  thisMonth,
  lastMonth,
  weekSeries,
  monthSeries,
}: Props) {
   const thisWeek=0
  const weekChange =
    lastWeek === 0 ? 0 : ((thisWeek - lastWeek) / lastWeek) * 100;

  const monthChange =
    lastMonth === 0 ? 0 : ((thisMonth - lastMonth) / lastMonth) * 100;

  const TrendIconWeek = weekChange >= 0 ? TrendingUp : TrendingDown;
  const TrendIconMonth = monthChange >= 0 ? TrendingUp : TrendingDown;

  return (
    
    <div className="flex flex-col gap-6 p-6 w-full ">
      
      {/* Header */}
      <div className="flex gap-2 items-center">
        <CalendarDays className="w-5 h-5 text-blue-500" />
        <h4 className="text-[20px] lg:text-[22px] font-medium text-gray-800 dark:text-gray-200">
          Weekly vs Monthly Orders
        </h4>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Week */}
        <div className="rounded-lg border p-4 text-left dark:border-gray-600">
          <p className="text-sm text-gray-500">This Week</p>
          <p className="text-2xl font-semibold">{thisWeek}</p>

          <div className="flex items-center gap-2 mt-1">
            <TrendIconWeek
              className={`w-4 h-4 ${
                weekChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                weekChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {lastWeek.toFixed(1)}
              {" "}
              (
              {weekChange >= 0 ? "+" : ""}
              {weekChange.toFixed(1)}%
              )
            </span>
            <span className="text-xs text-gray-500">
              vs last week
            </span>
          </div>

         {thisWeek ?(<MiniChart data={weekSeries} />):(<div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
               <BarChart3 className="lg:w-10 w-6 h-6 lg:h-10 mb-2 opacity-70" />
              No weekly data available
            </div>)} 
        </div>

        {/* Month */}
        <div className="rounded-lg border p-4 dark:border-gray-600 text-left">
          <p className="text-sm text-gray-500">This Month</p>
          <p className="text-2xl font-semibold">{thisMonth}</p>

          <div className="flex items-center gap-2 mt-1">
            <TrendIconMonth
              className={`w-4 h-4 ${
                monthChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                monthChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >{lastMonth.toFixed(1)}
            {" "}
            (
              {monthChange >= 0 ? "+" : ""}
              {monthChange.toFixed(1)}%
            )
            </span>
            <span className="text-xs text-gray-500">
              vs last month
            </span>
          </div>

          {thisMonth ?(<MiniChart data={monthSeries} />):(<div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
               <BarChart3 className="w-6 lg:w-10  h-6 lg:h-10 mb-2 opacity-70" />
              No monthly data available
            </div>)}
        </div>

      </div>
    </div>
  );
}