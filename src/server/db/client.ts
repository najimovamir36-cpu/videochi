import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * A single instance is cached on `globalThis` so Next.js hot reloads in
 * development do not open a new connection pool on every change. This replaces
 * the former in-memory `store.ts` as the one seam between the app and its
 * database — every repository talks to this client and nothing else.
 */

const globalForPrisma = globalThis as unknown as { __clipmindPrisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.__clipmindPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__clipmindPrisma = prisma;
}
