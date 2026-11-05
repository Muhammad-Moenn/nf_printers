"use client";

import Image from "next/image";
import { ImageIcon, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { CartItem, useCartStore } from "@/app/store/cart-store";
import { Button } from "./ui/button";

interface Props {
  item: CartItem;
}

export default function CartItemCard({ item }: Props) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const editCartItem = useCartStore((state) => state.editCartItem);

  const title = item.product || item.service || "Print order";
  const quantity = Math.max(1, Number(item.quantity) || 1);
  const design = item.designs?.[0];
  const gsm = item.gsm
    ? /gsm/i.test(item.gsm)
      ? item.gsm
      : `${item.gsm} GSM`
    : null;
  const specs = [item.size, item.paperType, gsm, item.colorMode, item.sides]
    .filter(Boolean)
    .join(" • ");

  return (
    <article className="rounded-card border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary-border sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:size-24">
            {design?.url ? (
              <Image
                src={design.url}
                alt={title}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="size-6" aria-hidden="true" />
                <span className="sr-only">No design uploaded</span>
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <h3
              className="truncate text-base font-semibold text-foreground"
              title={title}
            >
              {title}
            </h3>

            {specs && (
              <p className="text-[13px] leading-5 text-muted-foreground">
                {specs}
              </p>
            )}

            {item.finishingOptions?.length ? (
              <ul className="flex flex-wrap gap-1.5 pt-0.5">
                {item.finishingOptions.map((option) => (
                  <li
                    key={option}
                    className="rounded-badge bg-primary-soft px-2.5 py-1 text-[11px] font-medium text-primary-text ring-1 ring-inset ring-primary-border"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            ) : null}

            {item.requirements && (
              <p className="line-clamp-2 pt-1 text-xs italic text-muted-foreground">
                “{item.requirements}”
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 border-t border-border-subtle pt-3 lg:flex lg:shrink-0 lg:items-center lg:gap-5 lg:space-y-0 lg:border-t-0 lg:pt-0">
          <div className="flex items-center justify-between gap-4 lg:justify-start">
            <div
              className="flex h-9 items-center rounded-control border border-border bg-background"
              role="group"
              aria-label={`Quantity for ${title}`}
            >
              <button
                type="button"
                onClick={() => updateQuantity(item.id, quantity - 1)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-full w-9 items-center justify-center rounded-l-control text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
              >
                <Minus className="size-4" aria-hidden="true" />
              </button>

              <span
                className="w-10 text-center text-sm font-semibold tabular-nums text-foreground"
                aria-live="polite"
              >
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() => updateQuantity(item.id, quantity + 1)}
                aria-label="Increase quantity"
                className="flex h-full w-9 items-center justify-center rounded-r-control text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </div>

            <p className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              Rs {item.amount}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editCartItem(item.id, {})}
              className="h-9 w-full justify-center gap-1.5 border-primary-border bg-primary-soft text-primary-text hover:bg-primary-soft/80 hover:text-primary-text lg:w-auto"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeFromCart(item.id)}
              aria-label={`Remove ${title} from cart`}
              className="h-9 w-full justify-center gap-1.5 border-destructive-border bg-destructive-soft text-destructive-text hover:bg-destructive-soft/80 hover:text-destructive-text lg:w-auto"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
