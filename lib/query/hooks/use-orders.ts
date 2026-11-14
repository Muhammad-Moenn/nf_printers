"use client";

import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";
import {
  fetchUserOrdersPage,
  type UserOrdersPageFilters,
} from "@/lib/data/orders-page";
import {
  getOrderById,
  getOrderForReorder,
  getUserOrdersForReorder,
  SaveOrder,
  UpdateOrder,
} from "@/lib/data/orders";
import { fetchOrdersRealtime } from "@/lib/data/orders-realtime";
import { queryKeys } from "@/lib/query/query-keys";
import { useRealtimeTables } from "@/lib/realtime-bus";
import type { Order, OrderDetail, OrdersRealtimeData } from "@/types/order";

// The paginated list is cached in Redis for 20s; the summary endpoint always
// bypasses that cache. Keep the client at or above the server TTL.
const ORDERS_STALE_TIME = 20_000;
const REORDER_STALE_TIME = 60_000;

const EMPTY_MONTH = {
  orders: [] as never[],
  totalOrders: 0,
  completed: 0,
  pending: 0,
  processing: 0,
  inProgress: 0,
  cancelled: 0,
  totalPaid: 0,
};

export const EMPTY_ORDERS_REALTIME_DATA: OrdersRealtimeData = {
  userId: "",
  recentOrders: [],
  totalPaid: 0,
  currentWeekPaid: 0,
  currentMonthPaid: 0,
  weeklyData: [],
  lastWeekData: [],
  statusCounts: {
    total: 0,
    pending: 0,
    processing: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
  },
  orderSeries: { "7D": [], "30D": [], "90D": [] },
  monthSeries: [],
  monthComparison: { currentMonth: EMPTY_MONTH, lastMonth: EMPTY_MONTH },
  monthlyTotal: [],
  monthlyOrders: [],
};

function retryOrderQuery(failureCount: number, error: unknown) {
  if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
    return false;
  }

  return failureCount < 1;
}

export function ordersQueryOptions(
  userId: string | undefined,
  initialData?: OrdersRealtimeData
) {
  return queryOptions({
    queryKey: queryKeys.user.ordersRoot(userId ?? "anonymous"),
    queryFn: ({ signal }) => fetchOrdersRealtime(signal),
    enabled: Boolean(userId),
    staleTime: ORDERS_STALE_TIME,
    retry: retryOrderQuery,
    initialData,
  });
}

const selectOrders = (data: OrdersRealtimeData) => data.recentOrders;

const selectMetrics = (data: OrdersRealtimeData) => ({
  statusCounts: data.statusCounts,
  totalPaid: data.totalPaid,
  currentWeekPaid: data.currentWeekPaid,
  currentMonthPaid: data.currentMonthPaid,
});

export function useOrdersData(
  userId: string | undefined,
  initialData?: OrdersRealtimeData
) {
  return useQuery(ordersQueryOptions(userId, initialData));
}

export function useOrders(
  userId: string | undefined,
  initialData?: OrdersRealtimeData
) {
  return useQuery({
    ...ordersQueryOptions(userId, initialData),
    select: selectOrders,
  });
}

export function useOrderMetrics(
  userId: string | undefined,
  initialData?: OrdersRealtimeData
) {
  return useQuery({
    ...ordersQueryOptions(userId, initialData),
    select: selectMetrics,
  });
}

export function userOrdersPageQueryOptions(
  userId: string | undefined,
  filters: UserOrdersPageFilters
) {
  return queryOptions({
    queryKey: queryKeys.user.orders(userId ?? "anonymous", filters),
    queryFn: ({ signal }) => fetchUserOrdersPage(filters, signal),
    enabled: Boolean(userId),
    staleTime: ORDERS_STALE_TIME,
    retry: retryOrderQuery,
  });
}

export function useUserOrdersPage(
  userId: string | undefined,
  filters: UserOrdersPageFilters
) {
  return useQuery({
    ...userOrdersPageQueryOptions(userId, filters),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(
  userId: string | undefined,
  orderId: string | null | undefined
) {
  return useQuery({
    queryKey: queryKeys.user.order(userId ?? "anonymous", orderId ?? ""),
    queryFn: () => getOrderById(orderId ?? ""),
    enabled: Boolean(userId && orderId),
    staleTime: 30_000,
  });
}

export function reorderQueryOptions(
  userId: string | undefined,
  initialData?: OrderDetail[]
) {
  return queryOptions({
    queryKey: queryKeys.user.reorder(userId ?? "anonymous"),
    queryFn: getUserOrdersForReorder,
    enabled: Boolean(userId),
    staleTime: REORDER_STALE_TIME,
    initialData,
  });
}

export function useReorderOrders(
  userId: string | undefined,
  initialData?: OrderDetail[]
) {
  return useQuery(reorderQueryOptions(userId, initialData));
}

export function useReorderOrder(
  userId: string | undefined,
  orderId: string | null | undefined
) {
  return useQuery({
    queryKey: queryKeys.user.reorderDetail(
      userId ?? "anonymous",
      orderId ?? ""
    ),
    queryFn: () => getOrderForReorder(orderId ?? ""),
    enabled: Boolean(userId && orderId),
    staleTime: 30_000,
    retry: retryOrderQuery,
  });
}

function invalidateUserOrders(
  queryClient: QueryClient,
  userId: string | undefined
) {
  const id = userId ?? "anonymous";

  // `ordersRoot` covers the dashboard payload and every paginated/filtered
  // order list, because those keys extend it as a prefix.
  void queryClient.invalidateQueries(
    { queryKey: queryKeys.user.ordersRoot(id) },
    { cancelRefetch: false }
  );
  // Saving an order can back-fill the design library from its attachments.
  void queryClient.invalidateQueries(
    { queryKey: queryKeys.user.designs(id) },
    { cancelRefetch: false }
  );
}

export function useSaveOrder(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: Order | Order[]) => SaveOrder(order),
    onSuccess: () => invalidateUserOrders(queryClient, userId),
  });
}

export function useUpdateOrder(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: Parameters<typeof UpdateOrder>[0]) => {
      const result = await UpdateOrder(order);

      if (!result.success) {
        throw new Error(result.error ?? "Failed to update order.");
      }

      return result;
    },
    onSuccess: () => invalidateUserOrders(queryClient, userId),
  });
}

export function useOrdersRealtime(userId: string | undefined) {
  const queryClient = useQueryClient();

  useRealtimeTables(
    "user-dashboard-realtime",
    ["Order"] as const,
    () => {
      void queryClient.invalidateQueries(
        { queryKey: queryKeys.user.ordersRoot(userId ?? "anonymous") },
        { cancelRefetch: false }
      );
    },
    { enabled: Boolean(userId) }
  );
}
