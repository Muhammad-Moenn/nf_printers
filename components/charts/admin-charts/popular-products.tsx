"use client";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type ProductData = {
  name: string;
  value: number;
};

const PopularProducts = ({ data }: { data: ProductData[] }) => {
  const hasOrders = data.some((product) => product.value > 0);

  return (
    <div className="">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Popular Products</h2>
          <p className="stat-label mt-1">By order volume</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
          <BarChart3 className="h-5 w-5 text-success" />
        </div>
      </div>

      <div className="h-64">
        {hasOrders ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
              <XAxis
                type="number"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--popover-foreground)",
                }}
              />
              <Bar
                dataKey="value"
                name="Orders"
                fill="var(--success)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center border-t border-border-strong/70 text-center dark:border-[var(--input)]">
            <BarChart3 className="h-8 w-8 text-neutral-400 dark:text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-foreground dark:text-neutral-200">
              No product orders yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Popular services appear here after orders are placed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularProducts;
