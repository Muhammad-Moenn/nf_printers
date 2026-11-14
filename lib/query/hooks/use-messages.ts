"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";

import { applyAdminMessageSent } from "@/lib/query/admin-message-cache";
import {
  deleteAdminConversation,
  fetchAdminConversation,
  fetchAdminConversations,
  fetchUnseenMessageCount,
  fetchUserMessages,
  sendAdminMessage,
  sendUserMessage,
  type ConversationListPage,
  type MessagePayload,
  type MessageRecord,
} from "@/lib/data/messages";
import { queryKeys } from "@/lib/query/query-keys";

export function useUnseenMessageCount(
  userId: string | undefined,
  role: string | undefined
) {
  const scopedUserId = userId ?? "anonymous";
  const scopedRole = role ?? "guest";

  return useQuery({
    queryKey: queryKeys.messages.unseen(scopedUserId, scopedRole),
    queryFn: () => fetchUnseenMessageCount(scopedRole),
    enabled: Boolean(userId && role),
    select: (data) => data.count ?? 0,
    staleTime: 15_000,
  });
}

// The conversations endpoint is Redis-cached server-side for 5s, so keep the
// client copy fresh without refetching on every mount.
const ADMIN_CONVERSATIONS_STALE_TIME = 10_000;
const ADMIN_CONVERSATION_STALE_TIME = 10_000;

export function useAdminConversations(adminId: string | undefined) {
  return useInfiniteQuery({
    queryKey: queryKeys.messages.adminConversations(adminId ?? "anonymous"),
    queryFn: ({ pageParam }) => fetchAdminConversations(pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: Boolean(adminId),
    staleTime: ADMIN_CONVERSATIONS_STALE_TIME,
  });
}

export function useAdminConversation(
  adminId: string | undefined,
  conversationId: string | null
) {
  return useQuery({
    queryKey: queryKeys.messages.adminConversation(
      adminId ?? "anonymous",
      conversationId ?? ""
    ),
    queryFn: () => fetchAdminConversation(conversationId as string),
    enabled: Boolean(adminId && conversationId),
    staleTime: ADMIN_CONVERSATION_STALE_TIME,
  });
}

export function useAdminConversationOlderPages(
  adminId: string | undefined,
  conversationId: string | null,
  cursors: string[]
) {
  return useQueries({
    queries: cursors.map((cursor) => ({
      queryKey: queryKeys.messages.adminConversationOlder(
        adminId ?? "anonymous",
        conversationId ?? "",
        cursor
      ),
      queryFn: () => fetchAdminConversation(conversationId as string, cursor),
      enabled: Boolean(adminId && conversationId),
      staleTime: Infinity,
    })),
  });
}

export function useSendAdminMessage(adminId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: MessagePayload;
    }) => sendAdminMessage(conversationId, payload),
    onSuccess: (message, variables) => {
      // Patch the preview and open conversation from the server response
      // instead of invalidating the whole conversation list. The realtime echo
      // is idempotent and covers other open tabs.
      applyAdminMessageSent(
        queryClient,
        adminId ?? "anonymous",
        variables.conversationId,
        message
      );
    },
  });
}

export function useDeleteAdminConversation(adminId: string | undefined) {
  const queryClient = useQueryClient();
  const scopedAdminId = adminId ?? "anonymous";

  return useMutation({
    mutationFn: (conversationId: string) =>
      deleteAdminConversation(conversationId),
    onSuccess: (_result, conversationId) => {
      queryClient.setQueryData<
        InfiniteData<ConversationListPage, string | null>
      >(
        queryKeys.messages.adminConversations(scopedAdminId),
        (current) =>
          current
            ? {
                ...current,
                pages: current.pages.map((page) => ({
                  ...page,
                  conversations: page.conversations.filter(
                    (item) => item.id !== conversationId
                  ),
                })),
              }
            : current
      );
      queryClient.removeQueries({
        queryKey: queryKeys.messages.adminConversation(
          scopedAdminId,
          conversationId
        ),
      });
      queryClient.removeQueries({
        queryKey: queryKeys.messages.adminConversationOlderRoot(
          scopedAdminId,
          conversationId
        ),
      });
      void queryClient.invalidateQueries(
        { queryKey: queryKeys.messages.adminConversations(scopedAdminId) },
        { cancelRefetch: false }
      );
      void queryClient.invalidateQueries(
        { queryKey: queryKeys.messages.unseen(scopedAdminId, "ADMIN") },
        { cancelRefetch: false }
      );
    },
  });
}

export function useUserMessages(
  userId: string | undefined,
  initialData?: MessageRecord[]
) {
  return useQuery({
    queryKey: queryKeys.messages.userMessages(userId ?? "anonymous"),
    queryFn: fetchUserMessages,
    enabled: Boolean(userId),
    staleTime: 15_000,
    initialData,
  });
}

export function useSendUserMessage(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MessagePayload) => sendUserMessage(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries(
        { queryKey: queryKeys.messages.userMessages(userId ?? "anonymous") },
        { cancelRefetch: false }
      );
    },
  });
}
