import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { AdminOrdersRealtimeSync } from "@/components/admin-realtime-sync";
import { requireAdminPage } from "@/lib/auth-guards";
import { getAdminOrdersPageData } from "@/lib/data/admin-dashboard";
import { DEFAULT_ADMIN_ORDERS_QUERY } from "@/lib/query/admin-defaults";
import { makeQueryClient } from "@/lib/query/query-client";
import { queryKeys } from "@/lib/query/query-keys";

import RealtimeAdminOrdersClient from "./RealtimeAdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrderPage() {
  const user = await requireAdminPage();

  const ordersData = await getAdminOrdersPageData();
  if (!ordersData) redirect("/sign-in");

  // Seed the exact key the table requests so it renders without a client fetch.
  const queryClient = makeQueryClient();
  queryClient.setQueryData(
    queryKeys.admin.orders(user.id, DEFAULT_ADMIN_ORDERS_QUERY),
    ordersData
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminOrdersRealtimeSync adminId={user.id} />
      <div className="overflow-hidden">
        <RealtimeAdminOrdersClient adminId={user.id} />
      </div>
    </HydrationBoundary>
  );
}
