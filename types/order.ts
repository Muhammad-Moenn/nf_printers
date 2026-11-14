import type {
  MonthOrderMetrics,
  OrderSeriesPoint,
  WeekDayMetrics,
} from "@/lib/order-metrics";

export type OrderStatus = "pending" | "in_progress" | "completed" | "cancelled" | "processing";

export interface Order {
  id: string; // Order ID
  designs?: { url: string; key: string }[] ; // Design preview URL (optional)
  product: string; // Product name
  service:string
  quantity: string; // Quantity
  status?: OrderStatus; // Optional status
  orderDate?: Date | string | null; // Order date
  deliveryDate?: Date | string | null; // Delivery date (can be "-" for N/A)
  amount: string; // Price / total
  // Optional Fields for Reorder / UI / Extra info
  finishingOptions?: string[]; // ["Lamination", "Binding", etc.]
  paperType?: string; // Art Paper, Gloss, Card Stock, etc.
  size?: string;
  gsm?: string; // A4, A5, Custom
  colorMode?: string; // "BW" | "CMYK"
  sides?: string;
  requirements?: string;
  isReorder?: boolean;
}

export type OrderDesign = { url: string; key: string };

export type PricingStatus = "PENDING_REVIEW" | "APPROVED" | "OVERRIDDEN";

export type DashboardOrder = Omit<Order, "designs" | "status"> & {
  designs: OrderDesign[];
  status: OrderStatus;
  userId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  estimatedAmount: number | null;
  finalAmount: number | null;
  pricingStatus?: PricingStatus;
};

export type MonthlyPaidRow = { month: string; total: number };

export type MonthlyOrderRow = {
  label: string;
  pending: number;
  completed: number;
  cancelled: number;
  inprogress: number;
  total: number;
};

export type DashboardStatusCounts = {
  total: number;
  pending: number;
  processing: number;
  inProgress: number;
  completed: number;
  cancelled: number;
};

export type DashboardPayload = {
  userId: string;
  recentOrders: DashboardOrder[];
  totalPaid: number;
  currentWeekPaid: number;
  currentMonthPaid: number;
  weeklyData: WeekDayMetrics[];
  lastWeekData: WeekDayMetrics[];
  statusCounts: DashboardStatusCounts;
  orderSeries: Record<"7D" | "30D" | "90D", OrderSeriesPoint[]>;
  monthSeries: OrderSeriesPoint[];
  monthComparison: {
    currentMonth: MonthOrderMetrics;
    lastMonth: MonthOrderMetrics;
  };
};

export type OrdersRealtimeData = DashboardPayload & {
  monthlyTotal: MonthlyPaidRow[];
  monthlyOrders: MonthlyOrderRow[];
};

export type OrderDetail = DashboardOrder & {
  payment?: {
    status?: string | null;
    amount?: number | string | null;
  } | null;
};
