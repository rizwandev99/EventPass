import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";
import { mockDb, isPlaceholderOrUnreachable } from "./mock-db";

// Set websocket constructor for Neon serverless in Node.js
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = globalThis.WebSocket ?? ws;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function isPlaceholderDb(url?: string): boolean {
  return isPlaceholderOrUnreachable(url || process.env.DATABASE_URL);
}

export function createPrismaClient(overrideUrl?: string): PrismaClient {
  const connectionString = overrideUrl || process.env.DATABASE_URL;

  // Use in-memory mock database when database URL is placeholder/unreachable in sandbox
  if (isPlaceholderDb(connectionString)) {
    return mockDb as unknown as PrismaClient;
  }

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
