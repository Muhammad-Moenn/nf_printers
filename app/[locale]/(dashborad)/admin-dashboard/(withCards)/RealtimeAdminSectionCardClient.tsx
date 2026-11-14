"use client";

import { SectionCards } from "@/components/section-cards";
import { useAdminStats } from "@/lib/query/hooks/use-admin-dashboard";

function RealtimeAdminCardSectionClient({ adminId }: { adminId: string }) {
  const { data } = useAdminStats(adminId);
  const visibleCards = data?.cards ?? [];

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
