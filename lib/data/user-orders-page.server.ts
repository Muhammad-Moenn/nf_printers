import "server-only";

import type { Prisma } from "@prisma/client";
import { z } from "zod";

import {
  CACHE_TTL,
  cacheKeys,
  userOrdersFilterHash,
  userOrdersPagePrefix,
} from "@/lib/cache/keys";
import { getOrSetVersioned } from "@/lib/cache/store";
import { dashboardOrderSelect, toDashboardOrder } from "@/lib/order-mappers";
import { prisma } from "@/lib/prisma";
import type { DashboardOrder } from "@/types/order";

export const userOrdersPageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  status: z
    .enum(["all", "pending", "processing", "in_progress", "completed", "cancelled"])
    .default("all"),
  search: z.string().trim().max(120).default(""),
  sortKey: z
    .enum(["createdAt", "orderDate", "product", "status", "id"])
    .default("createdAt"),
  sortMode: z.enum(["az", "za", "latest", "oldest"]).default("latest"),
});

export type UserOrdersPageQuery = z.infer<typeof userOrdersPageQuerySchema>;

export type UserOrdersPageResult = {
  orders: DashboardOrder[];
  total: number;
  page: number;
  pageSize: number;
};

/** Matches the order table's initial state, used for server hydration. */
export const DEFAULT_USER_ORDERS_QUERY: UserOrdersPageQuery = {
  page: 1,
  pageSize: 10,
  status: "all",
  search: "",
  sortKey: "createdAt",
  sortMode: "latest",
};

function toOrderBy(
  sortKey: UserOrdersPageQuery["sortKey"],
  direction: Prisma.SortOrder
): Prisma.OrderOrderByWithRelationInput {
  switch (sortKey) {
    case "orderDate":
      return { orderDate: direction };
    case "product":
      return { product: direction };
    case "status":
      return { status: direction };
    case "id":
      return { id: direction };
    default:
      return { createdAt: direction };
  }
}

export async function loadUserOrdersPage(
  userId: string,
  query: UserOrdersPageQuery
): Promise<UserOrdersPageResult> {
  const take = Math.min(query.pageSize, 50);
  const skip = (query.page - 1) * take;

  // Mutations bump this counter, which retires every cached page for the user
  // without scanning or deleting individual filter keys. The counter and the
  // page are read in one round trip on a hit.
  return getOrSetVersioned(
    cacheKeys.user.ordersVersion(userId),
    userOrdersPagePrefix(userId),
    userOrdersFilterHash({ ...query, pageSize: take }),
    CACHE_TTL.userOrdersPage,
    async () => {
      const where: Prisma.OrderWhereInput = {
        userId,
        ...(query.status !== "all" ? { status: query.status } : {}),
        ...(query.search
          ? {
              OR: [
                { id: { contains: query.search, mode: "insensitive" } },
                { product: { contains: query.search, mode: "insensitive" } },
                { service: { contains: query.search, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      const direction: Prisma.SortOrder =
        query.sortMode === "az" || query.sortMode === "oldest" ? "asc" : "desc";

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          orderBy: toOrderBy(query.sortKey, direction),
          skip,
          take,
          select: dashboardOrderSelect,
        }),
        prisma.order.count({ where }),
      ]);

      return {
        orders: orders.map(toDashboardOrder),
        total,
        page: query.page,
        pageSize: take,
      };
    }
  );
}
