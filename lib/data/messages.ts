import { apiClient } from "@/lib/api/client";
import { apiEndpoints } from "@/lib/api/endpoints";
import type { ChatAttachment } from "@/lib/chat-message";

export type MessageRecord = {
  id: string;
  conversationId?: string;
  senderId: string;
  receiverId?: string;
  text: string;
  seen: boolean;
  createdAt: string;
  updatedAt?: string;
  attachment?: ChatAttachment | null;
  [key: string]: unknown;
};

export type ConversationUser = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export type ConversationRecord = {
  id: string;
  userId?: string;
  updatedAt?: string;
  user?: ConversationUser;
  admin?: ConversationUser;
  messages?: MessageRecord[];
  _count?: { messages: number };
  [key: string]: unknown;
};

export type ConversationDetail = ConversationRecord & {
  messages: MessageRecord[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type ConversationListPage = {
  conversations: ConversationRecord[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type ReadStatus = { id: string; seen: boolean };

export type MessagePayload = {
  text: string;
  attachment?: ChatAttachment | null;
};

export function fetchAdminConversations(cursor?: string | null) {
  return apiClient<ConversationListPage>(
    apiEndpoints.adminMessages.conversations,
    { query: { cursor: cursor ?? undefined } }
  );
}

export function fetchAdminConversation(
  conversationId: string,
  cursor?: string | null
) {
  return apiClient<ConversationDetail>(
    apiEndpoints.adminMessages.conversation(conversationId),
    { query: { cursor: cursor ?? undefined } }
  );
}

export function markAdminConversationSeen(conversationId: string) {
  return apiClient<unknown>(apiEndpoints.adminMessages.markSeen(conversationId), {
    method: "POST",
  });
}

export function fetchAdminReadStatus(conversationId: string) {
  return apiClient<ReadStatus[]>(
    apiEndpoints.adminMessages.readStatus(conversationId)
  );
}

export function fetchLatestAdminConversation() {
  return apiClient<ConversationRecord>(
    apiEndpoints.adminMessages.latestConversation
  );
}

export function deleteAdminConversation(conversationId: string) {
  return apiClient<unknown>(apiEndpoints.adminMessages.conversation(conversationId), {
    method: "DELETE",
  });
}

export function sendAdminMessage(
  conversationId: string,
  payload: MessagePayload
) {
  return apiClient<MessageRecord>(
    apiEndpoints.adminMessages.sendMessage(conversationId),
    { method: "POST", body: { ...payload } }
  );
}

export function fetchUserMessages() {
  return apiClient<MessageRecord[]>(apiEndpoints.userMessages.get);
}

export function sendUserMessage(payload: MessagePayload) {
  return apiClient<MessageRecord>(apiEndpoints.userMessages.send, {
    method: "POST",
    body: { ...payload },
  });
}

export function fetchUnseenMessageCount(role: string) {
  const endpoint =
    role === "ADMIN"
      ? apiEndpoints.adminMessages.unseenCount
      : apiEndpoints.userMessages.unseenCount;

  return apiClient<{ count?: number }>(endpoint);
}
