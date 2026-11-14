import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { AdminRevenueRealtimeSync } from "@/components/admin-realtime-sync";
import { requireAdminPage } from "@/lib/auth-guards";
import { getAdminRevenueManagementData } from "@/lib/data/admin-dashboard";
import { DEFAULT_ADMIN_REVENUE_PERIOD } from "@/lib/query/admin-defaults";
import { makeQueryClient } from "@/lib/query/query-client";
import { queryKeys } from "@/lib/query/query-keys";

import AdminRevenueManagementClient from "./AdminRevenueManagementClient";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const user = await requireAdminPage();

  const payload = await getAdminRevenueManagementData(DEFAULT_ADMIN_REVENUE_PERIOD);
  if (!payload) redirect("/sign-in");

  const queryClient = makeQueryClient();
  queryClient.setQueryData(
    queryKeys.admin.revenueManagement(user.id, DEFAULT_ADMIN_REVENUE_PERIOD),
    payload
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminRevenueRealtimeSync adminId={user.id} />
      <AdminRevenueManagementClient adminId={user.id} />
    </HydrationBoundary>
  );
}
