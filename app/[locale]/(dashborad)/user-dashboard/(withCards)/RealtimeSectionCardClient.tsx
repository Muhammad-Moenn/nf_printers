"use client";

import { CardData, SectionCards } from "@/components/section-cards";
import { useAuthUser } from "@/components/auth-provider";
import { usePathname } from "next/navigation";
import {
  EMPTY_ORDERS_REALTIME_DATA,
  useOrderMetrics,
} from "@/lib/query/hooks/use-orders";

function RealtimeReordersClient({ userId }: { userId: string }) {
  const pathname = usePathname();
  const { user } = useAuthUser();
  const { data } = useOrderMetrics(userId);
  const payload = data ?? EMPTY_ORDERS_REALTIME_DATA;
  const { totalPaid, currentMonthPaid, currentWeekPaid, statusCounts } = payload;

  const orderCounts = {
    active: statusCounts.inProgress,
    pending: statusCounts.pending,
    completed: statusCounts.completed,
  };

  const cards: CardData[] = [
    {
      title: "Active Orders",
      value: orderCounts.active,
      description: "Orders currently in progress",
      icon: "package",
      shortLabel: "In Progress",
      color: "var(--primary)", // Blue
      is_chart: true,
        total_order: statusCounts.total,
    },
    {
      title: "Pending Quotes",
      value: orderCounts.pending,
      description: "Awaiting approval",
      icon: "file-text",
      shortLabel: "Awaiting",
      color: "var(--warning)", // Amber
      is_chart: true,
      total_order: statusCounts.total,
    },
    {
      title: "Completed Orders",
      value: orderCounts.completed,
      description: "Successfully delivered",
      icon: "check-circle",
      shortLabel: "Delivered",
      color: "var(--success)", // Green
      is_chart: true,
       total_order: statusCounts.total,
    },
    {
      title: "Total Paid",
      value: new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
      }).format(totalPaid),
      description: "Lifetime payments",
      icon: "wallet",
      is_chart: false,
      current_monthPaid:currentMonthPaid,
      current_weekPaid:currentWeekPaid
    },
  ];

  if (pathname.includes("/reorder")) return null;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <header className="mb-4 flex flex-col gap-1 pt-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-neutral-100 sm:text-[26px]">
          Welcome back, {user?.fullName || user?.firstName || "there"}!
        </h1>
        <p className="text-sm text-muted-foreground dark:text-neutral-400 sm:text-base">
          Track your orders, check status and manage your printing needs.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-3 p-1 sm:grid-cols-2 xl:grid-cols-4">
        <SectionCards cards={cards} cardClassName="border-primary-border/80 shadow-[var(--shadow-sm)]" />
      </div>
    </div>
  );
}

export default RealtimeReordersClient;
