"use client";
import { RefreshCw, ShoppingCart } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { OrderOverviewItem } from "@/app/schemas/admin-dashboard-schema";

type OrdersOverviewProps = {
  data: OrderOverviewItem[];
  isRefreshing?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

const OrdersOverview = ({
  data,
  isRefreshing = false,
  error = null,
  onRefresh,
}: OrdersOverviewProps) => {
  const totalOrders = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-semibold text-foreground">
              Orders Overview
            </h2>
            <p className="stat-label">Order processing status</p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            aria-label="Refresh orders overview"
            title="Refresh orders overview"
            disabled={isRefreshing}
            onClick={onRefresh}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-card text-muted-foreground transition-colors hover:border-primary-border hover:text-primary-text disabled:cursor-wait disabled:opacity-60 dark:border-[var(--input)] dark:bg-[var(--surface-4)] dark:text-neutral-300 dark:hover:border-primary dark:hover:text-primary-soft-foreground"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm font-medium text-destructive-text dark:text-destructive-soft-foreground">
          {error}
        </p>
      )}

      <div className="flex flex-col items-center gap-6">
        <div className="relative flex h-44 w-44 flex-shrink-0 items-center justify-center">
          {totalOrders > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="var(--popover)"
                  >
                    {data.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">
                  {totalOrders}
                </span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </>
          ) : (
            <div className="text-center">
              <ShoppingCart className="mx-auto h-8 w-8 text-neutral-400" />
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                No orders yet
              </p>
            </div>
          )}
        </div>

        <div className="flex w-full flex-1 flex-col gap-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-secondary-foreground">
                  {item.name}
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-foreground">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersOverview;
