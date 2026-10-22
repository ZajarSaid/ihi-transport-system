import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client";

/**
 * Interactive transactions issue several statements over the network against
 * Turso, so Prisma's default 5s timeout is too short.
 */
export const TRANSACTION_OPTIONS = {
  maxWait: 10_000,
  timeout: 30_000,
};

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;

  if (tursoUrl) {
    return new PrismaClient({
      adapter: new PrismaLibSql({
        url: tursoUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
    });
  }

  const databaseUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
