import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { AdminUsersRealtimeSync } from "@/components/admin-realtime-sync";
import { requireAdminPage } from "@/lib/auth-guards";
import { getAdminUsersDashboardData } from "@/lib/data/admin-users";
import { DEFAULT_ADMIN_USERS_QUERY } from "@/lib/query/admin-defaults";
import { makeQueryClient } from "@/lib/query/query-client";
import { queryKeys } from "@/lib/query/query-keys";

import RealtimeAdminUsersClient from "./RealtimeAdminUsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const user = await requireAdminPage();

  const initialData = await getAdminUsersDashboardData();
  if (!initialData) redirect("/sign-in");

  const queryClient = makeQueryClient();
  queryClient.setQueryData(
    queryKeys.admin.users(user.id, DEFAULT_ADMIN_USERS_QUERY),
    initialData
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminUsersRealtimeSync adminId={user.id} />
      <RealtimeAdminUsersClient adminId={user.id} />
    </HydrationBoundary>
  );
}
