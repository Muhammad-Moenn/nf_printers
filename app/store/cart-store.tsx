import { OrderStatus } from "@/types/order";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // Order ID
   designs?: { url: string; key: string }[] ; // Design preview URL (optional)
   product: string; // Product name
   service:string
   quantity: string; // Quantity
   status?: OrderStatus; // Optional status
   orderDate?: Date | null; // Order date
   deliveryDate?: Date | null; // Delivery date (can be "-" for N/A)
   amount: string; // Price / total
   // Optional Fields for Reorder / UI / Extra info
   finishingOptions?: string[]; // ["Lamination", "Binding", etc.]
   paperType?: string; // Art Paper, Gloss, Card Stock, etc.
   size?: string;
   gsm?: string; // A4, A5, Custom
   colorMode?: string; // "BW" | "CMYK"
   sides?: string;
   requirements?:string;
    isReorder?:boolean;
}

type CartStore = {
  items: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateSpecs: (id: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
 editCartItem: (id: string, updates: Partial<CartItem>) => void; 
  getTotalAmount: () => number;
  getTotalQuantity: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // ➕ Add to cart
      addToCart: (item) => {
        const items = get().items;

        const existingIndex = items.findIndex(
          (i) =>
            // i.product === item.product &&
            i.service === item.service &&
            i.size === item.size &&
            i.paperType === item.paperType &&
            i.gsm === item.gsm &&
            i.colorMode === item.colorMode &&
            i.sides === item.sides &&
            JSON.stringify(i.finishingOptions) ===
              JSON.stringify(item.finishingOptions)
        );

        if (existingIndex !== -1) {
          const updated = [...items];

          const currentQty = Number(updated[existingIndex].quantity) || 0;
          const newQty = Number(item.quantity) || 0;

          updated[existingIndex].quantity = String(currentQty + newQty);

          set({ items: updated });
        } else {
          set({ items: [...items, item] });
        }
      },
          // Edit item 
          editCartItem: (id, updates) =>
  set({
    items: get().items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    ),
  }),
  
      // ❌ Remove
      removeFromCart: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      // 🔢 Update quantity
      updateQuantity: (id, quantity) =>
        set({
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, quantity: String(Math.max(1, quantity)) }
              : i
          ),
        }),

      // 🛠️ Update specs
      updateSpecs: (id, updates) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        }),

      // 🧹 Clear
      clearCart: () => set({ items: [] }),

      // 💰 Total amount
      getTotalAmount: () =>
        get().items.reduce((sum, item) => {
          const clean = item.amount.replace(/[^\d.]/g, "");
          return sum + Number(clean || 0);
        }, 0),

      // 🔢 Total quantity
      getTotalQuantity: () =>
        get().items.reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        ),
    }),
    {
      name: "printing-cart",
    }
  )
);
