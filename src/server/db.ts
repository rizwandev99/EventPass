import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Set websocket constructor for Neon serverless in Node.js
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = globalThis.WebSocket ?? ws;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function isPlaceholderDb(url?: string): boolean {
  const target = url || process.env.DATABASE_URL;
  if (!target) return true;
  return (
    target.includes("user:password") ||
    target.includes("ep-sample") ||
    target.includes("ep-test.us-east-2.aws.neon.tech")
  );
}

export function createPrismaClient(overrideUrl?: string): PrismaClient {
  const connectionString = overrideUrl || process.env.DATABASE_URL;
  if (!connectionString) {
    return new PrismaClient();
  }

  // Use neon driver adapter when neon connection is provided
  if (connectionString.includes("neon.tech")) {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
