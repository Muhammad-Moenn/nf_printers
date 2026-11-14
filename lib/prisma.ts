// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

import { recordPrismaQuery } from "@/lib/perf/metrics";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return undefined;
  }

  const url = new URL(databaseUrl);
  url.searchParams.set("sslmode", "require");
  // Allow independent page/data requests to use the pooler concurrently.
  // Keep this low enough for Supabase pooler limits and override per
  // environment when needed.
  url.searchParams.set(
    "connection_limit",
    process.env.PRISMA_CONNECTION_LIMIT ?? "5"
  );
  url.searchParams.set("pool_timeout", process.env.PRISMA_POOL_TIMEOUT ?? "30");
  // Supabase's pooler can be slow on the first (cold) connection; the Prisma
  // default of 5s is too tight and produces "Can't reach database server".
  url.searchParams.set(
    "connect_timeout",
    process.env.PRISMA_CONNECT_TIMEOUT ?? "30"
  );
  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;

  // Dev-only timing middleware. Model/action labels only; never store the SQL
  // text or parameters in the metrics registry.
  const timedPrisma = prisma as PrismaClient & { __nfPerfTimed?: boolean };
  if (!timedPrisma.__nfPerfTimed) {
    prisma.$use(async (params, next) => {
      const startedAt = performance.now();
      try {
        return await next(params);
      } finally {
        const model = params.model ?? "raw";
        recordPrismaQuery(
          `${model}.${params.action}`,
          performance.now() - startedAt
        );
      }
    });
    timedPrisma.__nfPerfTimed = true;
  }
}
