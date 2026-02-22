"use client";

import Image from "next/image";
import { Minus, Plus, Trash } from "lucide-react";
import { CartItem, useCartStore } from "@/app/store/cart-store";
import { Button } from "./ui/button";

interface Props {
  item: CartItem;
}

export default function CartItemCard({ item }: Props) {
  const { updateQuantity, removeFromCart ,editCartItem} = useCartStore();

  return (
    <div className="flex flex-col lg:flex-row justify-between gap-4 p-4 rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm hover:shadow-md transition">
      {/* 🖼️ Design Preview */}
      <div className="flex gap-4">
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {item.designs?.[0] ? (
          <Image
            src={item.designs[0].url}
            alt={item.product}
            width={96}
            height={96}
            className="object-cover"
          />
        ) : (
          <span className="text-xs text-muted-foreground">No Design</span>
        )}
      </div>

      {/* 📄 Info */}
      <div className="flex-1 space-y-1">
        {/* <h4 className="font-semibold text-sm md:text-base">
          {item.product}
        </h4> */}

        <p className="text-xs text-muted-foreground font-semibold">
          {item.service}
        </p>

        {/* 🧾 Specs Summary */}
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {[item.size, item.paperType, item.gsm && `${item.gsm} GSM`, item.colorMode, item.sides]
            .filter(Boolean)
            .join(" • ")}
        </p>

        {/* 🎨 Finishing Options */}
        {item.finishingOptions?.length ? (
          <div className="flex flex-wrap gap-1 pt-1">
            {item.finishingOptions.map((opt:string) => (
              <span
                key={opt}
                className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800"
              >
                {opt}
              </span>
            ))}
          </div>
        ) : null}

        {/* 📝 Requirements */}
        {item.requirements && (
          <p className="text-xs italic text-gray-500 line-clamp-1 pt-1">
            “{item.requirements}”
          </p>
        )}
      </div>
      </div>
      {/* 🔢 Quantity + Price */}
      <div className="flex flex-row lg:flex-col items-start lg:items-end justify-center lg:justify-between gap-2  lg:gap-2">
        {/* Quantity Control */}
        <div className="flex items-center gap-2 border rounded-lg px-2 py-1 dark:border-gray-700">
          <button
            onClick={() => updateQuantity(item.id, Number(item.quantity) - 1)}
            className="p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <Minus size={14} />
          </button>

          <span className="text-sm font-medium w-6 text-center">
            {item.quantity}
          </span>

          <button
            onClick={() => updateQuantity(item.id, Number(item.quantity) + 1)}
            className="p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Price */}
        <div className="text-right flex  flex-row-reverse items-center justify-between w-full space-y-1 mt-1 lg:mt-0 lg:flex-col lg:items-end gap-2">
          <p className="font-semibold text-sm">
            Rs {item.amount}
          </p>

         <div className="flex gap-2"> <Button
            onClick={() => editCartItem(item.id, {})}
            className="text-[14px] cursor-pointer flex items-center gap-1 justify-end"
          >
            Edit
          </Button>
          <Button
          //  variant="destructive"
            onClick={() => removeFromCart(item.id)}
            className="text-[14px] flex items-center bg-red-500 hover:bg-red-500/90 gap-1 justify-end cursor-pointer"
          >
            <Trash size={8} /> Remove
          </Button></div>
        </div>
      </div>
    </div>
  );
}
