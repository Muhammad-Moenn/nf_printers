"use client";

import { useSaveOrder, useUpdateOrder } from "@/lib/query/hooks/use-orders";
import { useCartStore } from "@/app/store/cart-store";
import CartItemCard from "@/components/cart-item-card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Info, ReceiptText, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface Props {
  newOrderHref?: string;
  userId: string;
}

export default function CartPageContent({ newOrderHref, userId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const saveOrder = useSaveOrder(userId);
  const updateOrder = useUpdateOrder(userId);

  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotalAmount());

  const totalItems = items.length;
  const hasItems = totalItems > 0;
  const isPlural = totalItems !== 1;

  const placeLabel = isPlural ? "Place Orders" : "Place Order";
  const placingLabel = isPlural ? "Placing Orders..." : "Placing Order...";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!hasItems || isLoading) return;

    const orderItems = items.filter((item) => !item.isReorder);
    const reorderItems = items.filter((item) => item.isReorder);

    setIsLoading(true);
    try {
      if (orderItems.length > 0) {
        await saveOrder.mutateAsync(orderItems);
      }
      if (reorderItems.length > 0) {
        await updateOrder.mutateAsync(reorderItems);
      }
      useCartStore.getState().clearCart();
      toast.success("Cart items placed successfully!");
    } catch {
      toast.error("Failed to place cart items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary ring-1 ring-inset ring-primary-border">
              <ShoppingCart className="size-7" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-[28px]">
                Your Cart{" "}
                <span className="text-primary-text">
                  ({totalItems} {isPlural ? "Items" : "Item"})
                </span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review your items before placing the order
              </p>
            </div>
          </div>

          {/* {hasItems && (
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="hidden h-11 shrink-0 gap-2 px-5 font-semibold shadow-sm sm:inline-flex"
            >
              <ShoppingCart className="size-4" aria-hidden="true" />
              {isLoading ? placingLabel : placeLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          )} */}
        </header>

        {hasItems ? (
          <>
            <section aria-label="Cart items" className="space-y-3">
              {items.map((item) => (
                <CartItemCard key={item.id} item={item} />
              ))}
            </section>

            <section
              aria-label="Order summary"
              className="rounded-card border border-border bg-card p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-border">
                  <div className="flex items-center gap-3 sm:pr-6">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <Info className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Total Items
                      </p>
                      <p className="text-lg font-bold tracking-tight text-primary-text">
                        {totalItems}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:px-6">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <ReceiptText className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Subtotal
                      </p>
                      <p className="text-xl font-bold tracking-tight text-foreground">
                        Rs {total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="h-11 w-full gap-2 px-5 font-semibold shadow-sm lg:w-auto"
                >
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  {isLoading ? placingLabel : placeLabel}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </section>
          </>
        ) : (
          <section className="flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-primary-border bg-card px-6 py-16 text-center shadow-sm">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary-soft text-primary">
              <ShoppingCart className="size-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Your cart is empty
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a print job to review its details here before placing your
                order.
              </p>
            </div>
            {newOrderHref && (
              <Button
                asChild
                size="lg"
                className="mt-1 gap-2 px-5 font-semibold"
              >
                <Link href={newOrderHref}>
                  Start a new order
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </section>
        )}
      </form>
    </main>
  );
}
