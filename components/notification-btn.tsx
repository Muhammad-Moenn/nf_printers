"use client";

import { BellRing, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function  NotificationButton() {
  const [notification,setnotification]=useState(true);

  return (
    <Button
      variant="ghost"
      // size="icon"
      className="relative cursor-pointer  -mb-2"
    >
      <BellRing  size={28} className="w-6 h-6"/>

      {notification  && (
        <span className="
          absolute top-1 right-1
          h-2 w-2
          z-1
          rounded-full
          bg-red-500
        ">
          
        </span>
      )}
    </Button>
  );
}
