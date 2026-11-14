"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import type { AdminServicesPayload } from "@/app/schemas/admin-services-schema";
import { getAdminServices } from "@/lib/data/admin-services";
import { queryKeys } from "@/lib/query/query-keys";

// Must stay above the Redis TTL (60s) so a refetch never returns a warm entry.
const SERVICES_STALE_TIME = 65_000;

export function adminServicesQueryOptions(adminId: string | undefined) {
  return queryOptions({
    queryKey: queryKeys.admin.services(adminId ?? "anonymous"),
    queryFn: async (): Promise<AdminServicesPayload> => {
      const payload = await getAdminServices();
      if (!payload) throw new Error("Admin access required.");
      return payload;
    },
    enabled: Boolean(adminId),
    staleTime: SERVICES_STALE_TIME,
  });
}

export function useAdminServices(
  adminId: string | undefined,
  initialData?: AdminServicesPayload
) {
  return useQuery({
    ...adminServicesQueryOptions(adminId),
    initialData,
  });
}
