"use client";

import { CardData, SectionCards } from "@/components/section-cards";
import { supabase } from "@/lib/supabaseClient";
import React, { useEffect, useState } from "react";
const EMPTY_DATA = {
  activeOrders: [],
  pendingOrders: [],
  completedOrders: [],
  totalPaid: 0,
};
function RealtimeReordersClient({ Data }: { Data: any }) {
  
 const [cardData, setCardData] = useState(Data ?? EMPTY_DATA);
const {
    activeOrders = [],
    pendingOrders = [],
    completedOrders = [],
    totalPaid = 0,
  } = cardData ?? EMPTY_DATA;
  

 const refetch = async () => {
  try {
    const res = await fetch("/api/orders/realtime", { cache: "no-store" });
    if (!res.ok) return;

    const data = await res.json();
    console.log("Refetch data:", data);

    setCardData({
      activeOrders: Array.isArray(data.activeOrders) ? data.activeOrders : [],
      pendingOrders: Array.isArray(data.pendingOrders) ? data.pendingOrders : [],
      completedOrders: Array.isArray(data.completedOrders)
        ? data.completedOrders
        : [],
      totalPaid: typeof data.totalPaid === "number" ? data.totalPaid : 0,
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
    },
    {
      title: "Pending Quotes",
      value: pendingOrders.length,
      description: "Awaiting approval",
      icon: "file-text",
    },
    {
      title: "Completed Orders",
      value: completedOrders.length,
      description: "Successfully delivered",
      icon: "check-circle",
    },
    {
      title: "Total Paid",
      value: new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
      }).format(totalPaid),
      description: "Lifetime payments",
      icon: "wallet",
    },
  ];

  return <SectionCards cards={cards} />;
}

export default RealtimeReordersClient;