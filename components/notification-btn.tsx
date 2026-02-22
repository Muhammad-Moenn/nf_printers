"use client";

import { BellRing, Flag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function  NotificationButton() {
  const [notification,setnotification]=useState(true);

  return (
    <div
      // variant="ghost"
      // size="icon"
      className="relative cursor-pointer  "
    >
      <BellRing   className="w-[20px] h-[20px]"/>

      {notification  && (
        <span className="
          absolute top-[0px] right-[0px]
          h-2 w-2
          z-1
          rounded-full
          bg-red-500
        ">
          
        </span>
      )}
    </div>
  );
}
// border border-transparent hover:border-gray-300/50 hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 p-2 rounded-md flex items-center justify-center hover:shadow-sm