"use client";

import { BellRing, Flag, MessageCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function  NotificationButton() {
  const [notification,setnotification]=useState(0);
  
  useEffect(() => {
  async function fetchCount() {
    const res = await fetch("/api/user-message/unseen-count");
    const data = await res.json();
    setnotification(data.count);
  }

  fetchCount();
}, []);
  return (
    <Link href="/user-dashboard/user-inbox" className="relative group cursor-pointer">
  <BellRing className="w-5 h-5" />

  {notification > 0 && (
    <span
      className={`
        absolute -top-1 right-[0px] group-hover:-top-2 group-hover:-right-[4px]
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
// border border-transparent hover:border-gray-300/50 hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 p-2 rounded-md flex items-center justify-center hover:shadow-sm