"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import {
  deleteDesign,
  getUserDesigns,
  saveDesign,
  type Design,
} from "@/lib/data/designs";
import { queryKeys } from "@/lib/query/query-keys";

// Matches the server cache TTL (120s); mutations invalidate both sides.
const DESIGNS_STALE_TIME = 120_000;

export function designsQueryOptions(userId: string | undefined) {
  return queryOptions({
    queryKey: queryKeys.user.designs(userId ?? "anonymous"),
    queryFn: (): Promise<Design[]> => getUserDesigns(),
    staleTime: DESIGNS_STALE_TIME,
  });
}

export function useUserDesigns(
  userId: string | undefined,
  initialData?: Design[]
) {
  return useQuery({
    ...designsQueryOptions(userId),
    enabled: Boolean(userId),
    initialData,
  });
}

function invalidateDesigns(
  queryClient: QueryClient,
  userId: string | undefined
) {
  void queryClient.invalidateQueries(
    { queryKey: queryKeys.user.designs(userId ?? "anonymous") },
    { cancelRefetch: false }
  );
}

export function useSaveDesign(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (design: Design) => saveDesign(design),
    onSuccess: () => invalidateDesigns(queryClient, userId),
  });
}

export function useDeleteDesign(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (design: Design) => deleteDesign(design),
    onSuccess: () => invalidateDesigns(queryClient, userId),
  });
}
