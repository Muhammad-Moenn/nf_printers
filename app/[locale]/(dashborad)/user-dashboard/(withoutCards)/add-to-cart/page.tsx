"use client";
import { SaveOrder, UpdateOrder } from "@/app/actions/order-action";
import { CartItem, useCartStore } from "@/app/store/cart-store";
import CartItemCard from "@/components/cart-item-card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "react-toastify";

export default function CartPage() {
  const [isLoading, setIsLoading] = useState(false);

  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.getTotalAmount());

  const orderItems = items.filter((item) => !item.isReorder);
  const reorderItems = items.filter((item) => item.isReorder);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length <= 0) return;

    setIsLoading(true);
    try {
      if (orderItems.length > 0) {
        await SaveOrder(orderItems);
      }
      if (reorderItems.length > 0) {
        await UpdateOrder(reorderItems);
      }
      useCartStore.getState().clearCart();
      toast.success("cart items placed successfully!");
    } catch (err) {
      toast.error("Failed to placed cart items");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4 lg:px-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Your Cart ({items.length} items)
        </h2>
        <div className="w-full cursor-pointer max-w-[130px]">
          <Button
            disabled={isLoading}
            onClick={(e) => handleSubmit(e)}
            type="submit"
            className="w-full py-5 cursor-pointer"
          >
            {isLoading
              ? `Placing ${items.length > 1 ? "Orders..." : "Order..."}`
              : `Place ${items.length > 1 ? "Orders" : "Order"}`}
          </Button>
        </div>
      </div>

      {items.map((item) => (
        <CartItemCard key={item.id} item={item} />
      ))}

      {/* Summary */}
      <div className="flex justify-between pt-6 border-t dark:border-gray-700">
        <span className="text-sm text-muted-foreground">Subtotal</span>
        <span className="text-lg font-semibold">Rs {total.toFixed(2)}</span>
      </div>
    </div>
  );
}
