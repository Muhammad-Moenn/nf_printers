
export type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled";

export interface Order {
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