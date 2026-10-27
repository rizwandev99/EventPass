import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/health/route";
import { createPrismaClient, prisma } from "@/server/db";
import { resetTestDatabase } from "../../scripts/reset-test-db";

describe("EventPass Integration Smoke Suite", () => {
  describe("API Health Endpoint", () => {
    it("returns HTTP 200 with status ok and valid ISO timestamp", async () => {
      const response = await GET();
      expect(response).toBeDefined();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json).toHaveProperty("status", "ok");
      expect(json).toHaveProperty("timestamp");
      expect(json).toHaveProperty("db");

      const timestamp = new Date(json.timestamp).getTime();
      expect(Number.isNaN(timestamp)).toBe(false);
      expect(["connected", "disconnected", "unconfigured", "mock_configured"]).toContain(
        json.db
      );
    });
  });

  describe("Prisma Database Client Lifecycle", () => {
    it("exports a singleton prisma instance with expected client delegates", () => {
      expect(prisma).toBeDefined();
      expect(typeof prisma.$connect).toBe("function");
      expect(typeof prisma.$disconnect).toBe("function");
      expect(typeof prisma.$queryRaw).toBe("function");
      expect(prisma.event).toBeDefined();
      expect(prisma.ticket).toBeDefined();
      expect(prisma.order).toBeDefined();
      expect(prisma.ticketTier).toBeDefined();
      expect(prisma.guest).toBeDefined();
      expect(prisma.scanLog).toBeDefined();
      expect(prisma.rateLimit).toBeDefined();
    });

    it("creates custom PrismaClient with environment fallback or custom URL", () => {
      const client = createPrismaClient("postgresql://user:password@localhost:5432/testdb");
      expect(client).toBeDefined();
      expect(typeof client.$connect).toBe("function");
      expect(typeof client.$disconnect).toBe("function");
      expect(typeof client.$queryRaw).toBe("function");
    });
  });

  describe("Test Database Reset Harness", () => {
    it("executes resetTestDatabase tool gracefully without crashing in sandbox", async () => {
      const result = await resetTestDatabase();
      expect(result).toBe(true);
    });
  });
});
