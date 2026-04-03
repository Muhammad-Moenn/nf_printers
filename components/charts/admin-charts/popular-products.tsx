"use client";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const productData = [
  { name: "Flyers", orders: 342 },
  { name: "Business Cards", orders: 289 },
  { name: "Brochures", orders: 198 },
  { name: "Banners", orders: 156 },
  { name: "Booklets", orders: 94 },
];

const PopularProducts = () => {
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fill: "hsl(215 15% 55%)", fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 22% 14%)",
                border: "1px solid hsl(220 18% 22%)",
                borderRadius: "8px",
                color: "hsl(210 20% 92%)",
              }}
            />
            <Bar dataKey="orders" fill="hsl(152 60% 45%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PopularProducts;
