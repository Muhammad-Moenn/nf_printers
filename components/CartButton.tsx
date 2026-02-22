"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCartStore } from "@/app/store/cart-store";
import Link from "next/link";

export function CartButton() {
  const items = useCartStore((s) => s.items.length);
  // console.log("Cart items:", items);  
  return (
    <Link href="/user-dashboard/add-to-cart">
    <div
      // variant="ghost"
      
      className="relative cursor-pointer 
     
      "
    >
      <ShoppingCart className="w-[20px] h-[20px] mx-1" />

      {items > 0 && (
        <span
          className="
          absolute top-0 -right-1
          h-4 w-4
          rounded-full
          bg-red-500
          text-white
          text-[10px]
           font-semibold
          flex items-center justify-center
        "
        >
          {items}
        </span>
      )}
    </div>
    </Link>
  );
}


 // -ml-2 border border-transparent hover:border-gray-300/50 hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 p-2 rounded-md flex items-center justify-center hover:shadow-sm