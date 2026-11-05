"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import { getAdminPopularServicesAction } from "@/app/actions/admin-dashboard-action";
import type { PopularService } from "@/app/schemas/admin-dashboard-schema";
import PopularProducts from "@/components/charts/admin-charts/popular-products";
import { supabase } from "@/lib/supabaseClient";

export default function RealtimePopularProductsClient({
  initialData,
}: {
  initialData: PopularService[];
}) {
  const [popularServices, setPopularServices] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const refreshPopularServices = useCallback(() => {
    startTransition(async () => {
      const payload = await getAdminPopularServicesAction();

      if (!payload) {
        setError("Popular products are unavailable.");
        return;
      }

      setPopularServices(payload.popularServices);
      setError(null);
    });
  }, []);

  useEffect(() => {
    setPopularServices(initialData);
  }, [initialData]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-popular-products-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
        },
        refreshPopularServices
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [refreshPopularServices]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-t from-primary-soft/70 via-primary-soft/60 to-surface-2/90 p-4 shadow dark:border-[var(--border)] dark:from-[var(--surface-1)] dark:via-[var(--surface-2)] dark:to-[var(--surface-2)]">
      <PopularProducts data={popularServices} />
      {(isPending || error) && (
        <p className="mt-3 text-xs font-medium text-muted-foreground">
          {isPending ? "Refreshing popular products..." : error}
        </p>
      )}
    </div>
  );
}
