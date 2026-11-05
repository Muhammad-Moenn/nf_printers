"use client";

import { BarChart3 } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { getAdminLatestOrdersAction } from "@/app/actions/admin-dashboard-action";
import LatestOrdersTable from "@/components/latest-order-table";
import { supabase } from "@/lib/supabaseClient";

export default function RealtimeLatestOrdersClient({
  initialOrders,
}: {
  initialOrders: any[];
}) {
  const [latestOrders, setLatestOrders] = useState(initialOrders);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshLatestOrders = useCallback(() => {
    startTransition(async () => {
      const payload = await getAdminLatestOrdersAction();

      if (!payload) {
        setError("Latest orders are unavailable.");
        return;
      }

      setLatestOrders(payload.latestOrders);
      setError(null);
    });
  }, []);

  useEffect(() => {
    setLatestOrders(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-latest-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
        },
        refreshLatestOrders
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [refreshLatestOrders]);

  return (
    <div className="overflow-hidden rounded-lg  pb-0 ">
      {(isPending || error) && (
        <div className="border-b border-border px-6 py-3 text-xs font-medium text-muted-foreground dark:border-[var(--border)] dark:bg-[var(--surface-3)]">
          {isPending ? "Refreshing latest orders..." : error}
        </div>
      )}

      {latestOrders.length ? (
        <LatestOrdersTable ordersData={latestOrders} darkPalette="services" />
      ) : (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
          <BarChart3 className="h-10 w-10 opacity-70" />
          No orders available
        </div>
      )}
    </div>
  );
}
