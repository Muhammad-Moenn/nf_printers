"use client";

import { CardData, SectionCards } from "@/components/section-cards";
import { supabase } from "@/lib/supabaseClient";
import React, { useEffect, useState } from "react";

type AdminCardData = {
  totalUsers: number;
  totalEmployees: number;
  totalOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
};

const EMPTY_DATA: AdminCardData = {
  totalUsers: 0,
  totalEmployees: 0,
  totalOrders: 0,
  pendingOrders: 0,
  cancelledOrders: 0,
  totalRevenue: 0,
};

function RealtimeAdminCardSectionClient({ data }: { data: any }) {
  const [cardData, setCardData] = useState<AdminCardData>(
    data ?? EMPTY_DATA
  );

  const {
    totalUsers,
    totalEmployees,
    totalOrders,
    pendingOrders,
    cancelledOrders,
    totalRevenue,
  } = cardData;

  // Optional: enable realtime later
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
        () => {
          // You can refetch admin stats API here
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const cards: CardData[] = [
    {
      title: "Total Users",
      value: totalUsers,
      description: "Registered platform users",
      icon: "users",
    },
    {
      title: "Total Employees",
      value: totalEmployees,
      description: "Active staff members",
      icon: "user-cog",
    },
    {
      title: "Total Orders",
      value: totalOrders,
      description: "All orders placed",
      icon: "shopping-cart",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      description: "Awaiting processing",
      icon: "clock",
    },
    {
      title: "Cancelled Orders",
      value: cancelledOrders,
      description: "Orders cancelled",
      icon: "x-circle",
    },
    {
      title: "Total Revenue",
      value: new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
      }).format(totalRevenue),
      description: "Lifetime revenue generated",
      icon: "currency-dollar",
    },
  ];

  return (
    <div  className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-2 gap-4  *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs  @xl/main:grid-cols-3 @5xl/main:grid-cols-6 pb-10">
      <SectionCards cards={cards} />
    </div>
  );
}

export default RealtimeAdminCardSectionClient;