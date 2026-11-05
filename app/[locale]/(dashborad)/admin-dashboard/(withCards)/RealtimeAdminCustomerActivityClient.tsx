"use client";

import { useAdminDashboardStore } from "@/app/store/admin-dashboard-store";
import type { AdminStats } from "@/app/schemas/admin-dashboard-schema";
import { AdminCustomerActivityPanel } from "@/components/charts/admin-charts/admin-stats-panels";

export default function RealtimeAdminCustomerActivityClient({
  initialStats,
}: {
  initialStats: AdminStats;
}) {
  const stats = useAdminDashboardStore((state) => state.stats);

  return <AdminCustomerActivityPanel stats={stats ?? initialStats} />;
}
