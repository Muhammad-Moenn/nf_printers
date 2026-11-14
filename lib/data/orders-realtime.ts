"use client";

import { apiEndpoints } from "@/lib/api/endpoints";
import { apiClient } from "@/lib/api/client";
import type { OrdersRealtimeData } from "@/types/order";

export function fetchOrdersRealtime(
  signal?: AbortSignal
): Promise<OrdersRealtimeData> {
  return apiClient<OrdersRealtimeData>(apiEndpoints.orders.realtime, { signal });
}
