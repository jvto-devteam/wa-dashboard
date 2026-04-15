import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var __prisma: PrismaClient | undefined;
  var __pgPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 10,                          // max 10 concurrent connections
    idleTimeoutMillis: 30_000,        // close idle connections after 30 s → recycles stale ones
    connectionTimeoutMillis: 10_000,  // throw after 10 s if can't get a connection (no more infinite hang)
  });
}

function createPrismaClient(): PrismaClient {
  const pool = global.__pgPool ?? (global.__pgPool = createPool());
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db: PrismaClient =
  global.__prisma ?? (global.__prisma = createPrismaClient());
