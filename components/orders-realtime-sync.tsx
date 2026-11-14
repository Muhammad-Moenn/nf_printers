"use client";

import { useOrdersRealtime } from "@/lib/query/hooks/use-orders";

export function OrdersRealtimeSync({ userId }: { userId: string }) {
  useOrdersRealtime(userId);

  return null;
}
