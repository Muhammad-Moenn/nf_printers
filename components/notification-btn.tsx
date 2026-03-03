"use client";

import { BellRing } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function NotificationButton({ dbUser }: any) {
  const [notification, setNotification] = useState(0);

  // ✅ Stable fetch function
  const fetchCount = useCallback(async () => {
    if (!dbUser?.id) return;

    try {
      const endpoint =
        dbUser.role === "ADMIN"
          ? "/api/admin-message/all-unseen-count"
          : "/api/user-message/unseen-count";

      const res = await fetch(endpoint);
      if (!res.ok) return;

      const data = await res.json();
      setNotification(data.count ?? 0);
      // console.log("Fetched notification count:", data.count);
    } catch (error) {
      console.error("Fetch notification error:", error);
    }
  }, [dbUser]);

  useEffect(() => {
    if (!dbUser?.id) return;

    // 🔹 Initial load
    fetchCount();

    // 🔹 Realtime subscription
    const channel = supabase
      .channel(`messages-${dbUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Message",
          // filter: `receiverId=eq.${dbUser.id}`,
        },
        (payload) => {

          // console.log("Message change detected, fetching count...");
          fetchCount();
        }
      )
      .subscribe((status) => {
        console.log("Realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
       console.log("Realtime status closed:");
    };
  }, [dbUser, fetchCount]);

  if (!dbUser) return null;
  return (
    <Link href={
    dbUser.role === "ADMIN"
      ? "/admin-dashboard/admin-inbox"
      : "/user-dashboard/user-inbox"
  }
   className="relative group cursor-pointer z-10">
  <BellRing className="w-5 h-5" />

  {notification > 0 && (
    <span
      className={`
        absolute -top-[3px] right-[0px] group-hover:-top-2 group-hover:-right-[4px]
        p-[3px] w-2 h-2 group-hover:w-[16px] group-hover:h-[16px] 
        flex items-center justify-center
        rounded-full bg-red-500
        text-white font-medium text-[9px]
        z-10
        group-hover:flex
        before:content-['']  
      `}
    >
      {/* number hidden by default */}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
        {notification > 9 ? "9+" : notification}
      </span>
    </span>
  )}
</Link>
  );
}
