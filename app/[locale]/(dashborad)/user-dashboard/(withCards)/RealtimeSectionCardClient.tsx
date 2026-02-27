"use client";

import { CardData, SectionCards } from "@/components/section-cards";
import { supabase } from "@/lib/supabaseClient";
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
  console.log("current",currentMonthPaid,currentWeekPaid)
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
      color: "#3B82F6", // Blue
      is_chart: true,
       total_order:Number(allOrders.length),
    },
    {
      title: "Pending Quotes",
      value: pendingOrders.length,
      description: "Awaiting approval",
      icon: "file-text",
      shortLabel: "Awaiting",
      color: "#F59E0B", // Orange
      is_chart: true,
     total_order:Number(allOrders.length),
    },
    {
      title: "Completed Orders",
      value: completedOrders.length,
      description: "Successfully delivered",
      icon: "check-circle",
      shortLabel: "Delivered",
      color: "#10B981", // Green
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

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 pb-10">
      <SectionCards cards={cards} />
    </div>
  );
}

export default RealtimeReordersClient;
