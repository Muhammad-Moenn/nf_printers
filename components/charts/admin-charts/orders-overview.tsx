"use client";
import { ShoppingCart } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const orderData = [
  { name: "Completed", value: 156, color: "hsl(152 60% 45%)" },
  { name: "In Progress", value: 43, color: "hsl(210 80% 60%)" },
  { name: "Pending", value: 28, color: "hsl(36 90% 55%)" },
  { name: "Cancelled", value: 8, color: "hsl(0 72% 55%)" },
];

const totalOrders = orderData.reduce((sum, d) => sum + d.value, 0);

const OrdersOverview = () => {
  return (
    <div className=" w-full">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
        <div className="text-left">
          <h2 className="text-xl font-semibold text-foreground">Orders Overview</h2>
          <p className="stat-label ">Order processing status</p>
        </div>
      </div>

      <div className="flex items-center flex-col gap-6">
        <div className="relative h-44 w-44 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={orderData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={2} stroke="hsl(220 22% 14%)">
                {orderData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220 22% 14%)",
                  border: "1px solid hsl(220 18% 22%)",
                  borderRadius: "8px",
                  color: "hsl(210 20% 92%)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{totalOrders}</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 w-full">
          {orderData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-secondary-foreground">{item.name}</span>
              </div>
              <span className="font-mono text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersOverview;
