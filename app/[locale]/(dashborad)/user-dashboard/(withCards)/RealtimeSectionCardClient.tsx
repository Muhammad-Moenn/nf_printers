"use client";

import { CardData, SectionCards } from "@/components/section-cards";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/components/auth-provider";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
const EMPTY_DATA = {
  allOrders:[],
  activeOrders: [],
  pendingOrders: [],
  completedOrders: [],
  totalPaid: 0,
  currentMonthPaid:0,
    currentWeekPaid:0,
};
function RealtimeReordersClient({ Data }: { Data: any }) {
  const pathname = usePathname();
  const { user } = useAuthUser();
  const [cardData, setCardData] = useState(Data ?? EMPTY_DATA);
  const {
    allOrders=[],
    activeOrders = [],
    pendingOrders = [],
    completedOrders = [],
    totalPaid = 0,
    currentMonthPaid=0,
    currentWeekPaid=0,
  } = cardData ?? EMPTY_DATA;

  const refetch = async () => {
    try {
      const res = await fetch("/api/orders/realtime", { cache: "no-store" });
      if (!res.ok) return;

      const data = await res.json();
      // console.log("Refetch data:", data.currentMonthPaid,data.currentWeekPaid);

      setCardData({
        allOrders:Array.isArray(data.allOrders)? data.allOrders:[],
        activeOrders: Array.isArray(data.activeOrders) ? data.activeOrders : [],
        pendingOrders: Array.isArray(data.pendingOrders)
          ? data.pendingOrders
          : [],
        completedOrders: Array.isArray(data.completedOrders)
          ? data.completedOrders
          : [],
        totalPaid: typeof data.totalPaid === "number" ? data.totalPaid : 0,
        currentMonthPaid: typeof data.currentMonthPaid === "number" ? data.currentMonthPaid : 0,
        currentWeekPaid: typeof data.currentWeekPaid === "number" ? data.currentWeekPaid : 0,
      });
    } catch (err) {
      console.error("Refetch failed", err);
    }
  };
  useEffect(() => {
    const channel = supabase
      .channel("cards-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Order",
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);
  const cards: CardData[] = [
    {
      title: "Active Orders",
      value: activeOrders.length,
      description: "Orders currently in progress",
      icon: "package",
      shortLabel: "In Progress",
      color: "var(--primary)", // Blue
      is_chart: true,
       total_order:Number(allOrders.length),
    },
    {
      title: "Pending Quotes",
      value: pendingOrders.length,
      description: "Awaiting approval",
      icon: "file-text",
      shortLabel: "Awaiting",
      color: "var(--warning)", // Amber
      is_chart: true,
     total_order:Number(allOrders.length),
    },
    {
      title: "Completed Orders",
      value: completedOrders.length,
      description: "Successfully delivered",
      icon: "check-circle",
      shortLabel: "Delivered",
      color: "var(--success)", // Green
      is_chart: true,
      total_order:Number(allOrders.length),
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
