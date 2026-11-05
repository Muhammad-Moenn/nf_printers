"use client";

import { SectionCards } from "@/components/section-cards";
import { useAdminDashboardStore } from "@/app/store/admin-dashboard-store";
import type { AdminStatsCardsPayload } from "@/app/schemas/admin-dashboard-schema";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

function RealtimeAdminCardSectionClient({
  payload,
}: {
  payload: AdminStatsCardsPayload;
}) {
  const cards = useAdminDashboardStore((state) => state.cards);

  const setStatsPayload = useAdminDashboardStore(
    (state) => state.setStatsPayload
  );
  const refreshStatsCards = useAdminDashboardStore(
    (state) => state.refreshStatsCards
  );
  const visibleCards = cards.length ? cards : payload.cards;

  useEffect(() => {
    setStatsPayload(payload);
  }, [payload, setStatsPayload]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-cards-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
        },
        () => refreshStatsCards({ force: true })
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "User",
        },
        () => refreshStatsCards({ force: true })
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [refreshStatsCards]);

  return (
    <div className="grid auto-rows-fr grid-cols-1 gap-4 pb-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 ">
      <SectionCards
        cards={visibleCards}
        cardClassName="dark:!border-[var(--border)] dark:!bg-[var(--surface-2)] dark:shadow-[var(--shadow-lg)]"
      />
    </div>
  );
}

export default RealtimeAdminCardSectionClient;
