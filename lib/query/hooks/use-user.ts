"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type { ProfileData } from "@/app/actions/user_action";
import {
  getProfile,
  updateEmailPreferences,
  updateProfile,
} from "@/lib/data/user";
import { queryKeys } from "@/lib/query/query-keys";

export function profileQueryOptions(
  userId: string | undefined,
  initialData?: ProfileData
) {
  return queryOptions({
    queryKey: queryKeys.user.profile(userId ?? "anonymous"),
    queryFn: getProfile,
    enabled: Boolean(userId),
    staleTime: 60_000,
    initialData,
  });
}

export function useProfile(
  userId: string | undefined,
  initialData?: ProfileData
) {
  return useQuery(profileQueryOptions(userId, initialData));
}

function invalidateProfile(userId: string | undefined) {
  return queryKeys.user.profile(userId ?? "anonymous");
}

export function useUpdateProfile(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateProfile(formData);
      if ("error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries(
        { queryKey: invalidateProfile(userId) },
        { cancelRefetch: false }
      );
      window.dispatchEvent(new Event("nf-auth-session-changed"));
    },
  });
}

export function useUpdateEmailPreferences(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      emailNotifications: boolean;
      marketingEmails: boolean;
    }) => {
      const result = await updateEmailPreferences(input);
      if ("error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries(
        { queryKey: invalidateProfile(userId) },
        { cancelRefetch: false }
      );
    },
  });
}
