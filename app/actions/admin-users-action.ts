"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import {
  CACHE_TTL,
  adminUsersFilterHash,
  adminUsersPagePrefix,
  cacheKeys,
} from "@/lib/cache/keys";
import { getOrSetVersioned } from "@/lib/cache/store";
import { prisma } from "@/lib/prisma";
import { GetDBUser } from "./user_action";
import type { MockUser, UserOrder } from "@/data/mockUsers";

function parseAmount(amount: string | null | undefined) {
  const value = Number(String(amount ?? "").replace(/[^\d.]/g, ""));
  return Number.isNaN(value) ? 0 : value;
}

function mapOrderStatus(status: string): UserOrder["status"] {
  if (status === "in_progress") return "in_progress";
  if (status === "processing") return "processing";
  if (status === "pending") return "pending";
  if (status === "cancelled") return "cancelled";
  return "completed";
}

async function requireAdminUser() {
  const dbUser = await GetDBUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    return null;
  }

  return dbUser;
}

const adminUsersQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(5).max(100).default(20),
  search: z.string().trim().max(120).default(""),
  role: z.enum(["all", "customer", "employee", "admin"]).default("all"),
  status: z.enum(["all", "active", "suspended"]).default("all"),
  sortBy: z.enum(["joinedDate", "orders", "totalSpent"]).default("joinedDate"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

type UserListRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
  orderCount: number;
  totalSpent: number;
};

type TopSpenderRow = { name: string; spent: number };
type SignupRow = { month: string; users: number };

type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;

export async function getAdminUsersDashboardDataAction(input?: unknown) {
  const admin = await requireAdminUser();
  if (!admin) {
    return null;
  }

  const query = parseAdminUsersQuery(input);

  // User/profile/order writes bump this counter, retiring cached pages. The
  // counter and the page are read in one round trip on a hit.
  return getOrSetVersioned(
    cacheKeys.admin.usersVersion,
    adminUsersPagePrefix,
    adminUsersFilterHash(query),
    CACHE_TTL.adminUsersPage,
    () => loadAdminUsersDashboardData(query)
  );
}

function parseAdminUsersQuery(input: unknown): AdminUsersQuery {
  const parsedQuery = adminUsersQuerySchema.safeParse(input ?? {});
  return parsedQuery.success
    ? parsedQuery.data
    : adminUsersQuerySchema.parse({});
}

async function loadAdminUsersDashboardData(query: AdminUsersQuery) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const pageSize = query.pageSize;

  const filters: Prisma.Sql[] = [];
  if (query.role !== "all") {
    filters.push(
      Prisma.sql`u.role = ${query.role.toUpperCase()}::"Role"`
    );
  }
  if (query.status === "suspended") {
    filters.push(Prisma.sql`FALSE`);
  }
  if (query.search) {
    const pattern = `%${query.search}%`;
    filters.push(
      Prisma.sql`(
        u."firstName" ILIKE ${pattern}
        OR u."lastName" ILIKE ${pattern}
        OR u.email ILIKE ${pattern}
      )`
    );
  }
  const whereSql = filters.length
    ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`
    : Prisma.empty;

  const directionSql = Prisma.raw(
    query.sortDirection === "asc" ? "ASC" : "DESC"
  );
  const orderSql =
    query.sortBy === "orders"
      ? Prisma.sql`ORDER BY "orderCount" ${directionSql}, u.id ASC`
      : query.sortBy === "totalSpent"
        ? Prisma.sql`ORDER BY "totalSpent" ${directionSql}, u.id ASC`
        : Prisma.sql`ORDER BY u."createdAt" ${directionSql}, u.id ASC`;

  const fetchUserPageRows = (targetPage: number) =>
    prisma.$queryRaw<UserListRow[]>`
      SELECT
        u.id,
        u.email,
        u."firstName",
        u."lastName",
        u.role,
        u."createdAt",
        u."updatedAt",
        COALESCE(o.order_count, 0)::int AS "orderCount",
        COALESCE(o.total_spent, 0)::float8 AS "totalSpent"
      FROM "User" u
      LEFT JOIN (
        SELECT
          "userId",
          COUNT(*)::int AS order_count,
          COALESCE(SUM("finalAmount"), 0) AS total_spent
        FROM "Order"
        GROUP BY "userId"
      ) o ON o."userId" = u.id
      ${whereSql}
      ${orderSql}
      LIMIT ${pageSize} OFFSET ${(targetPage - 1) * pageSize}
    `;

  // Count, stats, the requested page's rows, and the filter-independent
  // aggregates all run in one round trip. Only the clamped retry and the
  // per-user order history depend on an earlier result.
  const [totalRows, stats, requestedRows, topSpenders, signupRows] =
    await Promise.all([
      prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::int AS count
        FROM "User" u
        ${whereSql}
      `,
      (async () => {
        const [row] = await prisma.$queryRaw<
          { totalUsers: number; newThisMonth: number; staffUsers: number }[]
        >`
          SELECT
            COUNT(*)::int AS "totalUsers",
            COUNT(*) FILTER (WHERE "createdAt" >= ${startOfMonth})::int AS "newThisMonth",
            COUNT(*) FILTER (WHERE role IN ('ADMIN', 'EMPLOYEE'))::int AS "staffUsers"
          FROM "User"
        `;

        const totalUsers = row?.totalUsers ?? 0;

        return {
          totalUsers,
          activeUsers: totalUsers,
          newThisMonth: row?.newThisMonth ?? 0,
          staffUsers: row?.staffUsers ?? 0,
        };
      })(),
      fetchUserPageRows(query.page),
      // Aggregate from completed orders instead of scanning every user, so the
      // cost scales with completed orders rather than total registrations.
      prisma.$queryRaw<TopSpenderRow[]>`
        SELECT
          COALESCE(
            NULLIF(TRIM(CONCAT_WS(' ', u."firstName", u."lastName")), ''),
            u.email
          ) AS name,
          SUM(o."finalAmount")::float8 AS spent
        FROM "Order" o
        JOIN "User" u ON u.id = o."userId"
        WHERE o.status = 'completed' AND o."finalAmount" IS NOT NULL
        GROUP BY u.id
        ORDER BY spent DESC
        LIMIT 6
      `,
      // Bounded signup trend; the chart only needs a rolling window.
      prisma.$queryRaw<SignupRow[]>`
        SELECT
          to_char("createdAt", 'YYYY-MM') AS month,
          COUNT(*)::int AS users
        FROM "User"
        WHERE "createdAt" >= date_trunc('month', now()) - interval '11 months'
        GROUP BY 1
        ORDER BY 1
      `,
    ]);

  const total = totalRows[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(query.page, totalPages);
  // Re-query only when the requested page is past the end of a shrunken
  // result set; the common path returns the rows fetched above.
  const rows =
    page === query.page ? requestedRows : await fetchUserPageRows(page);

  const userIds = rows.map((row) => row.id);
  const pageUsers = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        // Only the order history is needed here; avoid loading full user rows.
        select: {
          id: true,
          orders: {
            orderBy: { createdAt: "desc" },
            take: 50,
            select: {
              id: true,
              service: true,
              quantity: true,
              status: true,
              amount: true,
              finalAmount: true,
              orderDate: true,
              createdAt: true,
            },
          },
        },
      })
    : [];
  const historyByUser = new Map(
    pageUsers.map((user) => [user.id, user.orders])
  );

  const mappedUsers: MockUser[] = rows.map((user) => {
    const orderHistory = (historyByUser.get(user.id) ?? []).map((order) => ({
      id: order.id,
      service: order.service || "Printing Order",
      quantity: Number(order.quantity) || 0,
      status: mapOrderStatus(order.status),
      total: order.finalAmount
        ? Number(order.finalAmount)
        : parseAmount(order.amount),
      date: (order.orderDate ?? order.createdAt).toISOString(),
    }));

    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.email.split("@")[0] ||
      "Unnamed User";

    return {
      id: user.id,
      name,
      email: user.email,
      company: "NF Printers Customer",
      role: user.role.toLowerCase() as MockUser["role"],
      orders: user.orderCount,
      totalSpent: user.totalSpent,
      status: "active",
      joinedDate: user.createdAt.toISOString(),
      phone: "Not provided",
      address: "Not provided",
      subscription: {
        plan:
          user.role === "ADMIN"
            ? "Admin"
            : user.role === "EMPLOYEE"
              ? "Staff"
              : "Customer",
        billingCycle: "monthly",
        status: "active",
        renewalDate: user.updatedAt.toISOString(),
        paymentHistory: [],
      },
      orderHistory,
    };
  });

  const monthlySignups = signupRows.map((row) => ({
    month: new Date(`${row.month}-01T00:00:00`).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    }),
    users: row.users,
  }));

  return {
    stats,
    users: mappedUsers,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
    charts: {
      monthlySignups,
      topSpenders,
    },
  };
}
