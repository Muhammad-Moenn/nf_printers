import type {
  AdminStats,
  AdminStatsCard,
} from "@/app/schemas/admin-dashboard-schema";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);

export function buildAdminStatsCards(stats: AdminStats): AdminStatsCard[] {
  return [
    {
      title: "Today Revenue",
      value: formatCurrency(stats.todayRevenue),
      description: `${formatCurrency(stats.weekRevenue)} this week`,
      icon: "currency-dollar",
      color: "var(--violet)",
      href: "/admin-dashboard/revenue",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      description: "Waiting to be processed",
      icon: "clock",
      color: "var(--accent-text)",
      href: "/admin-dashboard/orders",
    },
    {
      title: "Active Orders",
      value: stats.processingOrders + stats.inProgressOrders,
      description: "Processing or in progress",
      icon: "package",
      color: "var(--primary)",
      href: "/admin-dashboard/orders",
    },
    {
      title: "Completed",
      value: stats.completedOrders,
      description: "Delivered orders",
      icon: "check-circle",
      color: "var(--success)",
      href: "/admin-dashboard/orders",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      description: `${formatCurrency(stats.monthRevenue)} this month`,
      icon: "currency-dollar",
      color: "var(--info)",
      href: "/admin-dashboard/revenue",
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      description: `${stats.totalUsers} total user accounts`,
      icon: "users",
      color: "var(--violet)",
      href: "/admin-dashboard/users",
    },
  ];
}
