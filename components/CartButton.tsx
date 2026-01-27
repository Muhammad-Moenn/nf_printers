"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CartButton() {
  const [total,setTotal]=useState(12);

  return (
    <Button
      variant="ghost"
      // size="icon"
      className="relative cursor-pointer -mb-2 "
    >
      <ShoppingCart size={28} />

      {total > 0 && (
        <span className="
          absolute -top-1 -right-1
          h-4 w-4
          rounded-full
          bg-red-500
          text-white
          text-[10px]
           font-semibold
          flex items-center justify-center
        ">
          {total}
        </span>
      )}
    </Button>
  );
}
