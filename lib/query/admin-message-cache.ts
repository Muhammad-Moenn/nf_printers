import type { InfiniteData, QueryClient } from "@tanstack/react-query";

import type {
  ConversationDetail,
  ConversationListPage,
  ConversationRecord,
  MessageRecord,
} from "@/lib/data/messages";
import { queryKeys } from "@/lib/query/query-keys";
import type { RealtimePayload } from "@/lib/realtime-bus";

type InboxMessage = MessageRecord & { conversationId: string };
type ConversationListData = InfiniteData<ConversationListPage, string | null>;
type DetailPatchMode = "insert" | "update" | "remove";

function readString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/**
 * Supabase returns the raw column values for `postgres_changes`. Message rows
 * use REPLICA IDENTITY FULL, so this works for `new` and `old` alike.
 */
function toInboxMessage(record: Record<string, unknown>): InboxMessage | null {
  const id = readString(record.id);
  const conversationId = readString(record.conversationId);
  const senderId = readString(record.senderId);
  const createdAt = readString(record.createdAt);
  const text = typeof record.text === "string" ? record.text : null;

  if (!id || !conversationId || !senderId || !createdAt || text === null) {
    return null;
  }

  const message: InboxMessage = {
    id,
    conversationId,
    senderId,
    text,
    seen: record.seen === true,
    createdAt,
  };

  const receiverId = readString(record.receiverId);
  if (receiverId) message.receiverId = receiverId;

  const updatedAt = readString(record.updatedAt);
  if (updatedAt) message.updatedAt = updatedAt;

  return message;
}

function compareMessages(left: MessageRecord, right: MessageRecord) {
  const leftTime = new Date(left.createdAt).getTime();
  const rightTime = new Date(right.createdAt).getTime();
  if (leftTime !== rightTime) return leftTime - rightTime;
  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

function patchDetail(
  current: ConversationDetail | undefined,
  message: MessageRecord,
  mode: DetailPatchMode
): ConversationDetail | undefined {
  if (!current) return current;

  const index = current.messages.findIndex((item) => item.id === message.id);

  if (mode === "remove") {
    if (index === -1) return current;
    return {
      ...current,
      messages: current.messages.filter((item) => item.id !== message.id),
    };
  }

  if (index === -1) {
    if (mode === "update") return current;
    return {
      ...current,
      messages: [...current.messages, message].sort(compareMessages),
    };
  }

  const existing = current.messages[index];
  if (
    existing.seen === message.seen &&
    existing.text === message.text &&
    existing.createdAt === message.createdAt &&
    existing.senderId === message.senderId
  ) {
    return current;
  }

  const nextMessages = current.messages.slice();
  nextMessages[index] = message;
  return { ...current, messages: nextMessages };
}

function patchConversationList(
  current: ConversationListData,
  conversationId: string,
  update: (conversation: ConversationRecord) => ConversationRecord,
  moveToTop: boolean
): { data: ConversationListData; found: boolean; changed: boolean } {
  const state: {
    found: boolean;
    changed: boolean;
    conversation: ConversationRecord | null;
  } = { found: false, changed: false, conversation: null };

  const pages = current.pages.map((page) => {
    let pageChanged = false;
    const conversations = page.conversations.map((conversation) => {
      if (conversation.id !== conversationId) return conversation;

      state.found = true;
      const next = update(conversation);
      state.conversation = next;
      if (next !== conversation) {
        state.changed = true;
        pageChanged = true;
      }
      return next;
    });

    return pageChanged ? { ...page, conversations } : page;
  });

  if (!state.found || !state.conversation) {
    return { data: current, found: state.found, changed: false };
  }

  const first = pages[0];
  if (!moveToTop || first?.conversations[0]?.id === conversationId) {
    return {
      data: state.changed ? { ...current, pages } : current,
      found: true,
      changed: state.changed,
    };
  }

  const remaining = pages.map((page) => ({
    ...page,
    conversations: page.conversations.filter(
      (conversation) => conversation.id !== conversationId
    ),
  }));
  const [head, ...tail] = remaining;
  if (!head) {
    return { data: current, found: true, changed: false };
  }

  return {
    data: {
      ...current,
      pages: [
        {
          ...head,
          conversations: [state.conversation, ...head.conversations],
        },
        ...tail,
      ],
    },
    found: true,
    changed: true,
  };
}

function applyMessageInsert(
  queryClient: QueryClient,
  adminId: string,
  activeConversationId: string | null,
  message: InboxMessage
) {
  const isIncoming = message.senderId !== adminId;
  const isActive = message.conversationId === activeConversationId;
  const conversationsKey = queryKeys.messages.adminConversations(adminId);

  let found = false;
  queryClient.setQueryData<ConversationListData>(
    conversationsKey,
    (current) => {
      if (!current) return current;
      const result = patchConversationList(
        current,
        message.conversationId,
        (conversation) => {
          const unread = conversation._count?.messages ?? 0;
          const incrementsUnread = isIncoming && !message.seen;
          const nextUnread = isActive
            ? 0
            : incrementsUnread
              ? unread + 1
              : unread;
          return {
            ...conversation,
            updatedAt: message.createdAt,
            messages: [message],
            _count: { ...(conversation._count ?? {}), messages: nextUnread },
          };
        },
        true
      );
      found = result.found;
      return result.data;
    }
  );

  // A conversation that is not in the loaded pages (for example the first
  // message from a new customer) needs its user fields from the server. This is
  // the only case that refetches the list.
  if (!found && queryClient.getQueryData(conversationsKey)) {
    void queryClient.invalidateQueries(
      { queryKey: conversationsKey },
      { cancelRefetch: false }
    );
  }

  queryClient.setQueryData<ConversationDetail>(
    queryKeys.messages.adminConversation(adminId, message.conversationId),
    (current) => patchDetail(current, message, "insert")
  );
}

function applyMessageUpdate(
  queryClient: QueryClient,
  adminId: string,
  activeConversationId: string | null,
  payload: RealtimePayload
) {
  const message = toInboxMessage(payload.new);
  if (!message) return;

  const previous = toInboxMessage(payload.old);
  const becameSeen = previous?.seen === false && message.seen;
  const isIncoming = message.senderId !== adminId;
  const isActive = message.conversationId === activeConversationId;

  queryClient.setQueryData<ConversationDetail>(
    queryKeys.messages.adminConversation(adminId, message.conversationId),
    (current) => patchDetail(current, message, "update")
  );

  queryClient.setQueriesData<ConversationDetail>(
    {
      queryKey: queryKeys.messages.adminConversationOlderRoot(
        adminId,
        message.conversationId
      ),
    },
    (current) => patchDetail(current, message, "update")
  );

  queryClient.setQueryData<ConversationListData>(
    queryKeys.messages.adminConversations(adminId),
    (current) => {
      if (!current) return current;
      const result = patchConversationList(
        current,
        message.conversationId,
        (conversation) => {
          const previewMatches = conversation.messages?.[0]?.id === message.id;
          const unread = conversation._count?.messages ?? 0;
          const nextUnread =
            becameSeen && isIncoming && !isActive
              ? Math.max(0, unread - 1)
              : unread;

          if (!previewMatches && nextUnread === unread) return conversation;

          const next: ConversationRecord = { ...conversation };
          if (previewMatches) next.messages = [message];
          if (nextUnread !== unread) {
            next._count = {
              ...(conversation._count ?? {}),
              messages: nextUnread,
            };
          }
          return next;
        },
        false
      );
      return result.data;
    }
  );
}

function applyMessageDelete(
  queryClient: QueryClient,
  adminId: string,
  payload: RealtimePayload
) {
  const message = toInboxMessage(payload.old);
  if (!message) return;

  queryClient.setQueryData<ConversationDetail>(
    queryKeys.messages.adminConversation(adminId, message.conversationId),
    (current) => patchDetail(current, message, "remove")
  );

  queryClient.setQueriesData<ConversationDetail>(
    {
      queryKey: queryKeys.messages.adminConversationOlderRoot(
        adminId,
        message.conversationId
      ),
    },
    (current) => patchDetail(current, message, "remove")
  );

  queryClient.setQueryData<ConversationListData>(
    queryKeys.messages.adminConversations(adminId),
    (current) => {
      if (!current) return current;
      const result = patchConversationList(
        current,
        message.conversationId,
        (conversation) =>
          conversation.messages?.[0]?.id === message.id
            ? { ...conversation, messages: [] }
            : conversation,
        false
      );
      return result.data;
    }
  );
}

function applyConversationInsert(
  queryClient: QueryClient,
  adminId: string,
  payload: RealtimePayload
) {
  const conversationId = readString(payload.new.id);
  if (!conversationId) return;

  const updatedAt = readString(payload.new.updatedAt);
  const conversationsKey = queryKeys.messages.adminConversations(adminId);

  let found = false;
  queryClient.setQueryData<ConversationListData>(
    conversationsKey,
    (current) => {
      if (!current) return current;
      const result = patchConversationList(
        current,
        conversationId,
        (conversation) =>
          updatedAt && conversation.updatedAt !== updatedAt
            ? { ...conversation, updatedAt }
            : conversation,
        false
      );
      found = result.found;
      return result.data;
    }
  );

  if (!found && queryClient.getQueryData(conversationsKey)) {
    void queryClient.invalidateQueries(
      { queryKey: conversationsKey },
      { cancelRefetch: false }
    );
  }
}

function applyConversationUpdate(
  queryClient: QueryClient,
  adminId: string,
  payload: RealtimePayload
) {
  const conversationId = readString(payload.new.id);
  if (!conversationId) return;

  const updatedAt = readString(payload.new.updatedAt);
  queryClient.setQueryData<ConversationListData>(
    queryKeys.messages.adminConversations(adminId),
    (current) => {
      if (!current) return current;
      const result = patchConversationList(
        current,
        conversationId,
        (conversation) =>
          updatedAt && conversation.updatedAt !== updatedAt
            ? { ...conversation, updatedAt }
            : conversation,
        false
      );
      return result.data;
    }
  );
}

function applyConversationDelete(
  queryClient: QueryClient,
  adminId: string,
  payload: RealtimePayload
) {
  const conversationId =
    readString(payload.old.id) ?? readString(payload.new.id);
  if (!conversationId) return;

  queryClient.setQueryData<ConversationListData>(
    queryKeys.messages.adminConversations(adminId),
    (current) => {
      if (!current) return current;

      let changed = false;
      const pages = current.pages.map((page) => {
        const conversations = page.conversations.filter(
          (conversation) => conversation.id !== conversationId
        );
        if (conversations.length === page.conversations.length) return page;
        changed = true;
        return { ...page, conversations };
      });

      return changed ? { ...current, pages } : current;
    }
  );

  queryClient.removeQueries({
    queryKey: queryKeys.messages.adminConversation(adminId, conversationId),
  });
  queryClient.removeQueries({
    queryKey: queryKeys.messages.adminConversationOlderRoot(
      adminId,
      conversationId
    ),
  });
}

/**
 * Patch the cached admin inbox in place from RLS-filtered Realtime payloads.
 * No server call happens here; the list is only refetched for a conversation
 * that is not cached yet.
 */
export function applyAdminRealtimeEvents(
  queryClient: QueryClient,
  params: {
    adminId: string;
    activeConversationId: string | null;
    events: readonly RealtimePayload[];
  }
) {
  const { adminId, activeConversationId, events } = params;
  if (!adminId) return;

  for (const event of events) {
    if (event.table === "Message") {
      switch (event.eventType) {
        case "INSERT": {
          const message = toInboxMessage(event.new);
          if (message) {
            applyMessageInsert(
              queryClient,
              adminId,
              activeConversationId,
              message
            );
          }
          break;
        }
        case "UPDATE":
          applyMessageUpdate(
            queryClient,
            adminId,
            activeConversationId,
            event
          );
          break;
        case "DELETE":
          applyMessageDelete(queryClient, adminId, event);
          break;
      }
      continue;
    }

    if (event.table === "Conversation") {
      switch (event.eventType) {
        case "INSERT":
          applyConversationInsert(queryClient, adminId, event);
          break;
        case "UPDATE":
          applyConversationUpdate(queryClient, adminId, event);
          break;
        case "DELETE":
          applyConversationDelete(queryClient, adminId, event);
          break;
      }
    }
  }
}

/** Applies an admin's own send response without waiting for the Realtime echo. */
export function applyAdminMessageSent(
  queryClient: QueryClient,
  adminId: string,
  conversationId: string,
  message: MessageRecord
) {
  const inboxMessage: InboxMessage = {
    id: message.id,
    conversationId: message.conversationId ?? conversationId,
    senderId: message.senderId,
    text: message.text,
    seen: message.seen,
    createdAt: message.createdAt,
    ...(message.receiverId ? { receiverId: message.receiverId } : {}),
    ...(message.updatedAt ? { updatedAt: message.updatedAt } : {}),
    ...(message.attachment ? { attachment: message.attachment } : {}),
  };

  applyMessageInsert(queryClient, adminId, null, inboxMessage);
}
