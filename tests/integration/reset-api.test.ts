import { describe, it, expect } from "vitest";
import { POST, GET } from "@/app/api/reset/route";

describe("Reset & Seed API Route", () => {
  it("POST /api/reset resets and seeds database returning success: true", async () => {
    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.mode).toBeDefined();
    expect(data.message).toBeDefined();
  });

  it("GET /api/reset also resets and seeds database returning success: true", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
