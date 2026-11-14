"use client";

import { AdminCustomerActivityPanel } from "@/components/charts/admin-charts/admin-stats-panels";
import { useAdminStats } from "@/lib/query/hooks/use-admin-dashboard";

export default function RealtimeAdminCustomerActivityClient({
  adminId,
}: {
  adminId: string;
}) {
  const { data } = useAdminStats(adminId);
  const stats = data?.stats;

  if (!stats) {
    return null;
  }

  return <AdminCustomerActivityPanel stats={stats} />;
}
