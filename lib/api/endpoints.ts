export const apiEndpoints = {
  auth: {
    me: "/api/auth/me",
  },
  orders: {
    realtime: "/api/orders/realtime",
  },
  userOrders: {
    list: "/api/user/orders",
  },
  pricing: {
    predict: "/api/pricing/predict",
  },
  uploads: {
    delete: "/api/uploadthing/delete",
  },
  contact: "/api/contact",
  adminMessages: {
    conversations: "/api/admin-message/all-conversations",
    conversation: (conversationId: string) =>
      `/api/admin-message/all-conversations/${conversationId}`,
    sendMessage: (conversationId: string) =>
      `/api/admin-message/all-conversations/${conversationId}/send-message`,
    markSeen: (conversationId: string) =>
      `/api/admin-message/all-conversations/${conversationId}/mark-seen`,
    readStatus: (conversationId: string) =>
      `/api/admin-message/all-conversations/${conversationId}/read-status`,
    latestConversation: "/api/admin-message/latest-converstaion",
    latestMessage: (conversationId: string) =>
      `/api/admin-message/latest-message/${conversationId}`,
    unseenCount: "/api/admin-message/all-unseen-count",
  },
  userMessages: {
    get: "/api/user-message/get-message",
    send: "/api/user-message/send-message",
    unseenCount: "/api/user-message/unseen-count",
  },
} as const;
