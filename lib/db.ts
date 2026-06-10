import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/** Record a system event; never throws (logging must not break the request). */
export async function logSystemEvent(type: string, metadata?: Record<string, unknown>) {
  try {
    await db.systemEvent.create({ data: { type, metadata: metadata as object } });
  } catch (err) {
    console.error("Failed to log system event", type, err);
  }
}
