import "server-only";

import type { Prisma } from "@prisma/client";

import type {
  DashboardOrder,
  OrderDetail,
  OrderDesign,
} from "@/types/order";

export const dashboardOrderSelect = {
  id: true,
  userId: true,
  product: true,
  service: true,
  quantity: true,
  amount: true,
  status: true,
  orderDate: true,
  deliveryDate: true,
  paperType: true,
  size: true,
  gsm: true,
  colorMode: true,
  sides: true,
  finishingOptions: true,
  requirements: true,
  isReorder: true,
  designs: true,
  createdAt: true,
  updatedAt: true,
  estimatedAmount: true,
  finalAmount: true,
  pricingStatus: true,
} as const satisfies Prisma.OrderSelect;

export const orderDetailSelect = {
  ...dashboardOrderSelect,
  payment: { select: { status: true, amount: true } },
} as const satisfies Prisma.OrderSelect;

export type DashboardOrderSource = Prisma.OrderGetPayload<{
  select: typeof dashboardOrderSelect;
}>;

export type OrderDetailSource = Prisma.OrderGetPayload<{
  select: typeof orderDetailSelect;
}>;

function normalizeDesigns(value: Prisma.JsonValue): OrderDesign[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (
      item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      typeof (item as Record<string, unknown>).url === "string" &&
      typeof (item as Record<string, unknown>).key === "string"
    ) {
      const design = item as { url: string; key: string };
      return [{ url: design.url, key: design.key }];
    }

    return [];
  });
}

export function toDashboardOrder(order: DashboardOrderSource): DashboardOrder {
  return {
    id: order.id,
    userId: order.userId,
    product: order.product,
    service: order.service,
    quantity: order.quantity,
    amount: order.amount,
    status: order.status,
    orderDate: order.orderDate ?? undefined,
    deliveryDate: order.deliveryDate ?? undefined,
    paperType: order.paperType ?? undefined,
    size: order.size ?? undefined,
    gsm: order.gsm ?? undefined,
    colorMode: order.colorMode ?? undefined,
    sides: order.sides ?? undefined,
    finishingOptions: order.finishingOptions,
    requirements: order.requirements ?? undefined,
    isReorder: order.isReorder ?? undefined,
    designs: normalizeDesigns(order.designs),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    estimatedAmount:
      order.estimatedAmount == null ? null : Number(order.estimatedAmount),
    finalAmount: order.finalAmount == null ? null : Number(order.finalAmount),
    pricingStatus: order.pricingStatus,
  };
}

export function toOrderDetail(order: OrderDetailSource): OrderDetail {
  return {
    ...toDashboardOrder(order),
    pricingStatus: order.pricingStatus,
    payment: order.payment
      ? {
          status: order.payment.status,
          amount:
            order.payment.amount == null ? null : Number(order.payment.amount),
        }
      : null,
  };
}
