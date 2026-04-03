"use client";
import { Eye, MoreHorizontal } from "lucide-react";

const orders = [
  { id: "ORD-4821", customer: "Sarah Mitchell", type: "Flyers", qty: 500, status: "Completed", total: "$245.00", date: "Mar 7, 2026" },
  { id: "ORD-4820", customer: "James Cooper", type: "Business Cards", qty: 1000, status: "In Progress", total: "$89.00", date: "Mar 7, 2026" },
  { id: "ORD-4819", customer: "Elena Rodriguez", type: "Banners", qty: 3, status: "Pending", total: "$420.00", date: "Mar 6, 2026" },
  { id: "ORD-4818", customer: "Michael Chen", type: "Brochures", qty: 250, status: "Completed", total: "$312.00", date: "Mar 6, 2026" },
  { id: "ORD-4817", customer: "Lisa Thompson", type: "Booklets", qty: 100, status: "In Progress", total: "$578.00", date: "Mar 5, 2026" },
  { id: "ORD-4816", customer: "David Park", type: "Flyers", qty: 2000, status: "Cancelled", total: "$680.00", date: "Mar 5, 2026" },
];

const statusStyles: Record<string, string> = {
  Completed: "bg-success/15 text-success",
  "In Progress": "bg-info/15 text-info",
  Pending: "bg-warning/15 text-warning",
  Cancelled: "bg-destructive/15 text-destructive",
};

const RecentOrders = () => {
  return (
    <div className="dashboard-card">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
          <p className="stat-label mt-1">Latest transactions</p>
        </div>
        <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="stat-label pb-3 text-left">Customer</th>
              <th className="stat-label pb-3 text-left">Print Type</th>
              <th className="stat-label pb-3 text-right">Qty</th>
              <th className="stat-label pb-3 text-left">Status</th>
              <th className="stat-label pb-3 text-right">Total</th>
              <th className="stat-label pb-3 text-left">Date</th>
              <th className="stat-label pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-border/50 transition-colors hover:bg-secondary/30">
                <td className="py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.customer}</p>
                    <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
                  </div>
                </td>
                <td className="py-3 text-sm text-secondary-foreground">{order.type}</td>
                <td className="py-3 text-right font-mono text-sm text-secondary-foreground">{order.qty.toLocaleString()}</td>
                <td className="py-3">
                  <span className={`status-badge ${statusStyles[order.status]}`}>{order.status}</span>
                </td>
                <td className="py-3 text-right font-mono text-sm font-semibold text-foreground">{order.total}</td>
                <td className="py-3 text-sm text-muted-foreground">{order.date}</td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
