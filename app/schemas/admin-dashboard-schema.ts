import { z } from "zod";

export const adminStatsSchema = z.object({
  totalUsers: z.number(),
  totalCustomers: z.number(),
  totalEmployees: z.number(),
  totalOrders: z.number(),
  pendingOrders: z.number(),
  processingOrders: z.number(),
  inProgressOrders: z.number(),
  completedOrders: z.number(),
  cancelledOrders: z.number(),
  totalRevenue: z.number(),
  todayRevenue: z.number(),
  weekRevenue: z.number(),
  monthRevenue: z.number(),
});

export const adminStatsCardSchema = z.object({
  title: z.string(),
  value: z.union([z.string(), z.number()]),
  description: z.string(),
  href: z.string().optional(),
  icon: z.enum([
    "package",
    "file-text",
    "check-circle",
    "wallet",
    "users",
    "user-cog",
    "shopping-cart",
    "clock",
    "x-circle",
    "currency-dollar",
  ]),
  color: z.string().optional(),
});

export const adminStatsCardsPayloadSchema = z.object({
  stats: adminStatsSchema,
  cards: z.array(adminStatsCardSchema),
});

export const revenuePointSchema = z.object({
  month: z.string(),
  revenue: z.number(),
});

export const adminRevenueAnalyticsPayloadSchema = z.object({
  monthlyRevenue: z.array(revenuePointSchema).length(12),
  totalRevenue: z.number(),
  todayRevenue: z.number(),
  weekRevenue: z.number(),
  monthRevenue: z.number(),
});

export const revenuePeriodSchema = z.enum([
  "this-month",
  "last-month",
  "this-year",
  "all-time",
]);

export const revenueManagementPayloadSchema = z.object({
  period: revenuePeriodSchema,
  totals: z.object({
    revenue: z.number(),
    paymentsReceived: z.number(),
    outstandingBalance: z.number(),
    pendingPaymentCount: z.number().int().nonnegative(),
    pendingPaymentAmount: z.number(),
    refundedAmount: z.number(),
    expenses: z.number(),
    netProfit: z.number(),
    previousRevenue: z.number(),
    previousPaymentsReceived: z.number(),
    previousOutstandingBalance: z.number(),
    previousPendingPaymentAmount: z.number(),
    previousExpenses: z.number(),
    previousNetProfit: z.number(),
  }),
  dailyAnalytics: z.array(
    z.object({
      label: z.string(),
      revenue: z.number(),
      paymentsReceived: z.number(),
    }),
  ),
  weeklyAnalytics: z.array(
    z.object({
      label: z.string(),
      revenue: z.number(),
      paymentsReceived: z.number(),
    }),
  ),
  monthlyAnalytics: z
    .array(
      z.object({
        month: z.string(),
        revenue: z.number(),
        paymentsReceived: z.number(),
      }),
    )
    .length(12),
  paymentStatuses: z.array(
    z.object({
      name: z.string(),
      count: z.number().int().nonnegative(),
      amount: z.number(),
      color: z.string(),
    }),
  ),
  outstandingPayments: z.array(
    z.object({
      id: z.string(),
      customer: z.string(),
      orderAmount: z.number(),
      amountPaid: z.number(),
      outstanding: z.number(),
      dueDate: z.string().nullable(),
      status: z.string(),
    }),
  ),
  recentTransactions: z.array(
    z.object({
      id: z.string(),
      customer: z.string(),
      amount: z.number(),
      method: z.string(),
      status: z.string(),
      date: z.string(),
    }),
  ),
});

export const orderOverviewItemSchema = z.object({
  name: z.enum([
    "Completed",
    "In Progress",
    "Processing",
    "Pending",
    "Cancelled",
  ]),
  value: z.number().int().nonnegative(),
  color: z.string(),
});

export const adminOrdersOverviewPayloadSchema = z.object({
  data: z.array(orderOverviewItemSchema).length(5),
  totalOrders: z.number().int().nonnegative(),
});

export const popularServiceSchema = z.object({
  name: z.string(),
  value: z.number().int().nonnegative(),
});

export const adminDashboardActivityPayloadSchema = z.object({
  latestOrders: z.array(z.any()),
  popularServices: z.array(popularServiceSchema),
});

export const adminPopularServicesPayloadSchema = z.object({
  popularServices: z.array(popularServiceSchema),
});

export const adminLatestOrdersPayloadSchema = z.object({
  latestOrders: z.array(z.any()).max(5),
});

export const adminOrderStatusSchema = z.enum([
  "pending",
  "processing",
  "in_progress",
  "completed",
  "cancelled",
]);

export const adminOrderCustomerSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

export const adminPricingSourceSchema = z.enum([
  "RULE_BASED",
  "ML_MODEL",
  "MANUAL",
]);

export const adminPricingConfidenceSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const adminPricingStatusSchema = z.enum([
  "PENDING_REVIEW",
  "APPROVED",
  "OVERRIDDEN",
]);

export const adminPricingBreakdownItemSchema = z.object({
  label: z.string(),
  amount: z.number(),
});

export const adminOrderItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  customer: adminOrderCustomerSchema,
  customerName: z.string(),
  customerEmail: z.string(),
  product: z.string(),
  service: z.string(),
  quantity: z.string(),
  amount: z.string(),
  quantityValue: z.number().int().positive().nullable(),
  estimatedAmount: z.number().nonnegative().nullable(),
  finalAmount: z.number().nonnegative().nullable(),
  pricingSource: adminPricingSourceSchema.nullable(),
  pricingConfidence: adminPricingConfidenceSchema.nullable(),
  pricingStatus: adminPricingStatusSchema,
  pricingBreakdown: z.array(adminPricingBreakdownItemSchema).nullable(),
  adminAdjusted: z.boolean(),
  adjustmentReason: z.string().nullable(),
  // ISO strings, matching the cache's JSON boundary (a Redis hit never returns
  // Date instances), so cached and fresh payloads have one shape.
  priceEstimatedAt: z.string().nullable(),
  priceReviewedAt: z.string().nullable(),
  status: adminOrderStatusSchema,
  orderDate: z.string().nullable(),
  deliveryDate: z.string().nullable(),
  paperType: z.string().nullable(),
  size: z.string().nullable(),
  gsm: z.string().nullable(),
  colorMode: z.string().nullable(),
  sides: z.string().nullable(),
  finishingOptions: z.array(z.string()),
  requirements: z.string().nullable(),
  isReorder: z.boolean(),
  designs: z.array(z.object({ url: z.string(), key: z.string() })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const adminMonthlyOrderAnalyticsSchema = z.object({
  label: z.string(),
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  processing: z.number().int().nonnegative(),
  inProgress: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  cancelled: z.number().int().nonnegative(),
});

export const adminYearlyOrderAnalyticsSchema = z.object({
  year: z.string(),
  total: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  cancelled: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
});

export const adminOrdersAnalyticsSchema = z.object({
  monthlyOrders: z.array(adminMonthlyOrderAnalyticsSchema).length(12),
  yearlyOrders: z.array(adminYearlyOrderAnalyticsSchema),
  topServices: z.array(popularServiceSchema),
  averageCompletedOrderValue: z.number().nonnegative(),
  ordersToday: z.number().int().nonnegative(),
  ordersThisWeek: z.number().int().nonnegative(),
  ordersThisMonth: z.number().int().nonnegative(),
});

export const adminOrdersPageQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(5).max(100).default(20),
  status: adminOrderStatusSchema.or(z.literal("all")).default("all"),
  search: z.string().trim().max(120).default(""),
  sortKey: z
    .enum([
      "id",
      "createdAt",
      "orderDate",
      "product",
      "status",
      "customerName",
      "amount",
    ])
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

export const adminOrdersPaginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const adminOrdersPagePayloadSchema = z.object({
  orders: z.array(adminOrderItemSchema),
  ordersNeedingAction: z.array(adminOrderItemSchema).max(6),
  pagination: adminOrdersPaginationSchema,
  stats: adminStatsSchema,
  analytics: adminOrdersAnalyticsSchema,
});

export type AdminStats = z.infer<typeof adminStatsSchema>;
export type AdminStatsCard = z.infer<typeof adminStatsCardSchema>;
export type AdminStatsCardsPayload = z.infer<
  typeof adminStatsCardsPayloadSchema
>;
export type RevenuePoint = z.infer<typeof revenuePointSchema>;
export type AdminRevenueAnalyticsPayload = z.infer<
  typeof adminRevenueAnalyticsPayloadSchema
>;
export type RevenuePeriod = z.infer<typeof revenuePeriodSchema>;
export type RevenueManagementPayload = z.infer<
  typeof revenueManagementPayloadSchema
>;
export type OrderOverviewItem = z.infer<typeof orderOverviewItemSchema>;
export type AdminOrdersOverviewPayload = z.infer<
  typeof adminOrdersOverviewPayloadSchema
>;
export type PopularService = z.infer<typeof popularServiceSchema>;
export type AdminDashboardActivityPayload = z.infer<
  typeof adminDashboardActivityPayloadSchema
>;
export type AdminPopularServicesPayload = z.infer<
  typeof adminPopularServicesPayloadSchema
>;
export type AdminLatestOrdersPayload = z.infer<
  typeof adminLatestOrdersPayloadSchema
>;
export type AdminOrderStatus = z.infer<typeof adminOrderStatusSchema>;
export type AdminPricingStatus = z.infer<typeof adminPricingStatusSchema>;
export type AdminOrderItem = z.infer<typeof adminOrderItemSchema>;
export type AdminMonthlyOrderAnalytics = z.infer<
  typeof adminMonthlyOrderAnalyticsSchema
>;
export type AdminYearlyOrderAnalytics = z.infer<
  typeof adminYearlyOrderAnalyticsSchema
>;
export type AdminOrdersAnalytics = z.infer<typeof adminOrdersAnalyticsSchema>;
export type AdminOrdersPagePayload = z.infer<
  typeof adminOrdersPagePayloadSchema
>;
export type AdminOrdersPageQuery = z.infer<typeof adminOrdersPageQuerySchema>;
export type AdminOrdersPagination = z.infer<
  typeof adminOrdersPaginationSchema
>;
