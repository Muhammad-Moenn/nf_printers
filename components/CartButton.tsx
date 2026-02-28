"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCartStore } from "@/app/store/cart-store";
import Link from "next/link";

export function CartButton() {
  const items = useCartStore((s) => s.items.length);
  return (
    <Link href="/user-dashboard/add-to-cart">
    <div
      // variant="ghost"
      
      className="relative cursor-pointer group
     
      "
    >
      <ShoppingCart className="w-[20px] h-[20px] mx-1" />

      {items > 0 && (
        <span
          className="
          absolute -top-0 right-[0px] group-hover:-top-2 group-hover:-right-[4px]
        p-[3px] w-2 h-2 group-hover:w-[16px] group-hover:h-[16px] 
        flex items-center justify-center
        rounded-full bg-red-500
        text-white font-medium text-[9px]
        z-10
        group-hover:flex
        before:content-[''] 
        "
        >
          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          {items > 9 ? "9+" : items}
          </span>
        </span>
      )}
    </div>
    </Link>
  );
}


 // -ml-2 border border-transparent hover:border-gray-300/50 hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 p-2 rounded-md flex items-center justify-center hover:shadow-sm