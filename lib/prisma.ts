// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

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
  url.searchParams.set("connection_limit", "1");
  url.searchParams.set("pool_timeout", "30");
  // Supabase's pooler can be slow on the first (cold) connection; the Prisma
  // default of 5s is too tight and produces "Can't reach database server".
  url.searchParams.set("connect_timeout", "30");
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
}
