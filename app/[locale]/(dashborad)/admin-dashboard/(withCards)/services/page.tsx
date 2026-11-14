import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";

import { AdminServicesRealtimeSync } from "@/components/admin-realtime-sync";
import { requireAdminPage } from "@/lib/auth-guards";
import { getAdminServices } from "@/lib/data/admin-services";
import { makeQueryClient } from "@/lib/query/query-client";
import { queryKeys } from "@/lib/query/query-keys";

import RealtimeAdminServicesClient from "./RealtimeAdminServicesClient";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const user = await requireAdminPage();

  const initialData = await getAdminServices();
  if (!initialData) redirect("/sign-in");

  // Seed the exact key the client requests, matching the other admin pages.
  const queryClient = makeQueryClient();
  queryClient.setQueryData(queryKeys.admin.services(user.id), initialData);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminServicesRealtimeSync adminId={user.id} />
      <RealtimeAdminServicesClient adminId={user.id} initialData={initialData} />
    </HydrationBoundary>
  );
}
