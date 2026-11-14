import {
  DEFAULT_ADMIN_ORDERS_QUERY,
  DEFAULT_ADMIN_USERS_QUERY,
} from "@/lib/query/admin-defaults";

type QueryFilterValue = string | number | boolean | null | undefined;

export type QueryFilters = Record<string, QueryFilterValue>;

export type UserOrdersFilters = QueryFilters & {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  sortMode?: "az" | "za" | "latest" | "oldest";
};

export type AdminOrdersFilters = UserOrdersFilters;

export type AdminUsersFilters = QueryFilters & {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
};

function stableFilterEntries(filters: QueryFilters = {}): string[] {
  return Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
    .flatMap(([key, value]) => [key, String(value)]);
}

function withDefaults(
  defaults: QueryFilters,
  filters?: QueryFilters
): QueryFilters {
  const merged = { ...defaults };

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null) {
        merged[key] = value;
      }
    }
  }

  return merged;
}

// Reuse the server-side hydration defaults so the keys cannot drift.
const adminOrdersDefaults: QueryFilters = { ...DEFAULT_ADMIN_ORDERS_QUERY };

const userOrdersDefaults: QueryFilters = {
  page: 1,
  pageSize: 20,
  status: "all",
  search: "",
  sortKey: "createdAt",
  sortDirection: "desc",
};

const adminUsersDefaults: QueryFilters = { ...DEFAULT_ADMIN_USERS_QUERY };

export const queryKeys = {
  user: {
    all: (userId: string) => ["user", userId] as const,
    profile: (userId: string) => ["user", userId, "profile"] as const,
    dashboard: (userId: string) => ["user", userId, "dashboard"] as const,
    orders: (userId: string, filters?: UserOrdersFilters) =>
      [
        "user",
        userId,
        "orders",
        ...stableFilterEntries(withDefaults(userOrdersDefaults, filters)),
      ] as const,
    ordersRoot: (userId: string) => ["user", userId, "orders"] as const,
    order: (userId: string, orderId: string) =>
      ["user", userId, "orders", "detail", orderId] as const,
    reorder: (userId: string) => ["user", userId, "orders", "reorder"] as const,
    reorderDetail: (userId: string, orderId: string) =>
      ["user", userId, "orders", "reorder", orderId] as const,
    stats: (userId: string) => ["user", userId, "stats"] as const,
    designs: (userId: string) => ["user", userId, "designs"] as const,
    conversation: (userId: string) =>
      ["user", userId, "conversation"] as const,
    messages: (userId: string) => ["user", userId, "messages"] as const,
    unseenMessages: (userId: string) =>
      ["user", userId, "unseen-messages"] as const,
  },

  admin: {
    all: (adminId: string) => ["admin", adminId] as const,
    dashboard: (adminId: string) =>
      ["admin", adminId, "dashboard"] as const,
    stats: (adminId: string) => ["admin", adminId, "stats"] as const,
    activity: (adminId: string) => ["admin", adminId, "activity"] as const,
    /** Prefix for every revenue query (analytics + per-period management). */
    revenueRoot: (adminId: string) =>
      ["admin", adminId, "revenue"] as const,
    revenueAnalytics: (adminId: string) =>
      ["admin", adminId, "revenue", "analytics"] as const,
    revenueManagement: (adminId: string, period: string) =>
      ["admin", adminId, "revenue", "management", period] as const,
    /** Prefix for every paginated/filtered order list. */
    ordersRoot: (adminId: string) => ["admin", adminId, "orders"] as const,
    orders: (adminId: string, filters?: AdminOrdersFilters) =>
      [
        "admin",
        adminId,
        "orders",
        ...stableFilterEntries(withDefaults(adminOrdersDefaults, filters)),
      ] as const,
    payments: (adminId: string, filters?: QueryFilters) =>
      [
        "admin",
        adminId,
        "payments",
        ...stableFilterEntries(filters),
      ] as const,
    /** Prefix for every paginated/filtered user list. */
    usersRoot: (adminId: string) => ["admin", adminId, "users"] as const,
    users: (adminId: string, filters?: AdminUsersFilters) =>
      [
        "admin",
        adminId,
        "users",
        ...stableFilterEntries(withDefaults(adminUsersDefaults, filters)),
      ] as const,
    /** Prefix for every filtered service list. */
    servicesRoot: (adminId: string) => ["admin", adminId, "services"] as const,
    services: (adminId: string, filters?: QueryFilters) =>
      [
        "admin",
        adminId,
        "services",
        ...stableFilterEntries(filters),
      ] as const,
  },

  messages: {
    all: ["messages"] as const,
    unseen: (userId: string, role: string) =>
      ["messages", userId, "unseen", role] as const,
    adminConversations: (adminId: string) =>
      ["messages", adminId, "admin", "conversations"] as const,
    adminConversation: (adminId: string, conversationId: string) =>
      ["messages", adminId, "admin", "conversation", conversationId] as const,
    adminConversationOlderRoot: (adminId: string, conversationId: string) =>
      [
        "messages",
        adminId,
        "admin",
        "conversation-history",
        conversationId,
      ] as const,
    adminConversationOlder: (
      adminId: string,
      conversationId: string,
      cursor: string
    ) =>
      [
        "messages",
        adminId,
        "admin",
        "conversation-history",
        conversationId,
        cursor,
      ] as const,
    userMessages: (userId: string) =>
      ["messages", userId, "user"] as const,
  },

  orders: {
    all: (userId: string) => ["orders", userId] as const,
    realtime: (userId: string) =>
      ["orders", userId, "realtime"] as const,
  },

  pricing: {
    estimate: (signature: string) =>
      ["pricing", "estimate", signature] as const,
  },

  public: {
    services: ["public", "services"] as const,
  },
};
