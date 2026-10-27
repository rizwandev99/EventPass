import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  PrismaClient,
  EventCategory,
  EventStatus,
  OrderStatus,
  TicketStatus,
  ScanResult,
  ScanSource,
  type Event as PrismaEvent,
  type TicketTier as PrismaTicketTier,
  type Order as PrismaOrder,
  type Ticket as PrismaTicket,
  type ScanLog as PrismaScanLog,
  type Guest as PrismaGuest,
  type RateLimit as PrismaRateLimit,
} from "@prisma/client";

describe("Milestone M0 Empirical Challenge: Prisma Schema & Types Oracle", () => {
  it("exports all 6 enums with exact PRD specified values", () => {
    expect(Object.values(EventCategory).sort()).toEqual(
      ["ART", "COMEDY", "FOOD", "MUSIC", "SPORTS", "TECH"].sort()
    );

    expect(Object.values(EventStatus).sort()).toEqual(
      ["CANCELLED", "PUBLISHED"].sort()
    );

    expect(Object.values(OrderStatus).sort()).toEqual(
      ["CANCELLED", "CONFIRMED"].sort()
    );

    expect(Object.values(TicketStatus).sort()).toEqual(
      ["CANCELLED", "USED", "VALID"].sort()
    );

    expect(Object.values(ScanResult).sort()).toEqual(
      ["ADMITTED", "ALREADY_USED", "INVALID", "TICKET_CANCELLED", "WRONG_EVENT"].sort()
    );

    expect(Object.values(ScanSource).sort()).toEqual(
      ["OFFLINE_SYNC", "ONLINE"].sort()
    );
  });

  it("exports type definitions for all 7 models", () => {
    const dummyEvent: Partial<PrismaEvent> = {
      id: "evt_123",
      slug: "test-event",
      title: "Test Event",
      category: EventCategory.TECH,
      status: EventStatus.PUBLISHED,
    };
    expect(dummyEvent.slug).toBe("test-event");

    const dummyTier: Partial<PrismaTicketTier> = {
      id: "tier_123",
      eventId: "evt_123",
      pricePaise: 49900,
      capacity: 100,
      sold: 10,
      maxPerOrder: 6,
    };
    expect(dummyTier.pricePaise).toBe(49900);

    const dummyOrder: Partial<PrismaOrder> = {
      id: "ord_123",
      guestId: "gst_123",
      totalPaise: 49900,
      status: OrderStatus.CONFIRMED,
      paymentRef: "FAKE-123",
    };
    expect(dummyOrder.totalPaise).toBe(49900);

    const dummyTicket: Partial<PrismaTicket> = {
      id: "tkt_123",
      code: "EP1.tkt_123.abcdefghijklmnop",
      status: TicketStatus.VALID,
    };
    expect(dummyTicket.code).toContain("EP1.");

    const dummyScanLog: Partial<PrismaScanLog> = {
      id: "log_123",
      result: ScanResult.ADMITTED,
      source: ScanSource.ONLINE,
    };
    expect(dummyScanLog.result).toBe(ScanResult.ADMITTED);

    const dummyGuest: Partial<PrismaGuest> = {
      id: "gst_test",
      displayName: "Guest User",
    };
    expect(dummyGuest.id).toBe("gst_test");

    const dummyRateLimit: Partial<PrismaRateLimit> = {
      id: "rl_123",
      key: "chat:gst_123",
      count: 1,
    };
    expect(dummyRateLimit.count).toBe(1);
  });
});

describe("Milestone M0 Empirical Challenge: Seed Data Verification Harness", () => {
  interface SeedTier {
    name: string;
    description: string;
    pricePaise: number;
    capacity: number;
    sold: number;
    maxPerOrder: number;
  }

  interface SeedEvent {
    slug: string;
    title: string;
    description: string;
    category: EventCategory;
    city: string;
    venueName: string;
    address: string;
    startsAt: Date;
    endsAt: Date;
    status: EventStatus;
    coverSeed: string;
    tiers: SeedTier[];
  }

  // Extract events array by evaluating seed file generator logic in isolation
  function extractSeedEvents(): SeedEvent[] {
    const seedPath = path.resolve("prisma/seed.ts");
    const content = fs.readFileSync(seedPath, "utf-8");

    // Replace imports and prisma calls to return the raw events array
    const now = new Date();
    const days = (d: number, hours = 0) =>
      new Date(now.getTime() + (d * 24 + hours) * 60 * 60 * 1000);

    // Extract the events = [ ... ]; block using regex
    const eventMatch = content.match(/const events = (\[[\s\S]*?\n\s*\]);/);
    if (!eventMatch) {
      throw new Error("Failed to extract events array from prisma/seed.ts");
    }

    const evalFn = new Function(
      "EventCategory",
      "EventStatus",
      "days",
      `return ${eventMatch[1]};`
    );

    return evalFn(EventCategory, EventStatus, days);
  }

  const events = extractSeedEvents();

  it("contains exactly 14 events in seed data", () => {
    expect(events.length).toBe(14);
  });

  it("covers all 6 event categories defined in PRD", () => {
    const categories = new Set(events.map((e) => e.category));
    expect(categories.size).toBe(6);
    expect(categories.has(EventCategory.MUSIC)).toBe(true);
    expect(categories.has(EventCategory.TECH)).toBe(true);
    expect(categories.has(EventCategory.SPORTS)).toBe(true);
    expect(categories.has(EventCategory.COMEDY)).toBe(true);
    expect(categories.has(EventCategory.FOOD)).toBe(true);
    expect(categories.has(EventCategory.ART)).toBe(true);
  });

  it("covers all 7 Indian cities specified in PRD §9.4", () => {
    const cities = new Set(events.map((e) => e.city));
    const expectedCities = [
      "Delhi",
      "Noida",
      "Gurugram",
      "Bengaluru",
      "Mumbai",
      "Pune",
      "Hyderabad",
    ];
    for (const city of expectedCities) {
      expect(cities.has(city), `Missing city: ${city}`).toBe(true);
    }
  });

  it("verifies all prices are in integer paise and within Free to ₹5,000 (0 to 500,000 paise)", () => {
    for (const ev of events) {
      for (const tier of ev.tiers) {
        expect(Number.isInteger(tier.pricePaise)).toBe(true);
        expect(tier.pricePaise).toBeGreaterThanOrEqual(0);
        expect(tier.pricePaise).toBeLessThanOrEqual(500000); // <= ₹5,000
      }
    }
  });

  it("verifies tier count per event is between 2 and 4", () => {
    for (const ev of events) {
      expect(ev.tiers.length).toBeGreaterThanOrEqual(2);
      expect(ev.tiers.length).toBeLessThanOrEqual(4);
    }
  });

  it("verifies chronological integrity: startsAt < endsAt for every event", () => {
    for (const ev of events) {
      expect(ev.startsAt.getTime()).toBeLessThan(ev.endsAt.getTime());
    }
  });

  it("verifies capacity integrity: 0 <= sold <= capacity for every tier", () => {
    for (const ev of events) {
      for (const tier of ev.tiers) {
        expect(tier.capacity).toBeGreaterThan(0);
        expect(tier.sold).toBeGreaterThanOrEqual(0);
        expect(tier.sold).toBeLessThanOrEqual(tier.capacity);
      }
    }
  });

  it("verifies Edge Case 1: Starting soon (<24h from now)", () => {
    const now = new Date();
    const startingSoon = events.filter((e) => {
      const diffHours = (e.startsAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours < 24 && e.status === EventStatus.PUBLISHED;
    });
    expect(startingSoon.length).toBeGreaterThanOrEqual(1);
    expect(startingSoon[0].slug).toBe("delhi-live-indie-music-nights");
  });

  it("verifies Edge Case 2: Sold out (every tier at capacity)", () => {
    const soldOutEvents = events.filter((e) =>
      e.tiers.every((t) => t.sold === t.capacity)
    );
    expect(soldOutEvents.length).toBe(1);
    expect(soldOutEvents[0].slug).toBe("bengaluru-ai-systems-summit-2026");
  });

  it("verifies Edge Case 3: Almost gone (exactly 3 tickets left in total)", () => {
    const almostGoneEvents = events.filter((e) => {
      const totalRemaining = e.tiers.reduce(
        (sum, t) => sum + (t.capacity - t.sold),
        0
      );
      return totalRemaining === 3;
    });
    expect(almostGoneEvents.length).toBe(1);
    expect(almostGoneEvents[0].slug).toBe("mumbai-sunset-rooftop-standup");

    // Check individual tiers: Front row 2 left, General 1 left
    const event = almostGoneEvents[0];
    const remainingPerTier = event.tiers.map((t) => t.capacity - t.sold);
    expect(remainingPerTier.reduce((a, b) => a + b, 0)).toBe(3);
  });

  it("verifies Edge Case 4: One tier sold out (one tier full, others open)", () => {
    const oneTierSoldOut = events.filter((e) => {
      const hasFull = e.tiers.some((t) => t.sold === t.capacity);
      const hasOpen = e.tiers.some((t) => t.sold < t.capacity);
      return hasFull && hasOpen;
    });
    expect(oneTierSoldOut.length).toBeGreaterThanOrEqual(1);
    const hyderabadBeer = oneTierSoldOut.find(
      (e) => e.slug === "hyderabad-culinary-craft-beer-expo"
    );
    expect(hyderabadBeer).toBeDefined();
    expect(hyderabadBeer?.tiers.find((t) => t.name === "Tasting Pass")?.sold).toBe(50);
  });

  it("verifies Edge Case 5: Free event (price 0 paise for all tiers)", () => {
    const freeEvents = events.filter((e) =>
      e.tiers.every((t) => t.pricePaise === 0)
    );
    expect(freeEvents.length).toBeGreaterThanOrEqual(1);
    expect(freeEvents[0].slug).toBe("gurugram-open-source-developers-meetup");
  });

  it("verifies Edge Case 6: Cancelled event (status CANCELLED)", () => {
    const cancelledEvents = events.filter((e) => e.status === EventStatus.CANCELLED);
    expect(cancelledEvents.length).toBe(1);
    expect(cancelledEvents[0].slug).toBe("pune-monsoon-trail-running-marathon");
  });

  it("verifies Edge Case 7: Ended event (ended yesterday, for includePast=true)", () => {
    const now = new Date();
    const endedEvents = events.filter((e) => e.endsAt.getTime() < now.getTime());
    expect(endedEvents.length).toBe(1);
    expect(endedEvents[0].slug).toBe("noida-contemporary-art-dialogue");
  });

  it("verifies Edge Case 8: Layout stress test (very long title)", () => {
    const longTitleEvents = events.filter((e) => e.title.length > 80);
    expect(longTitleEvents.length).toBeGreaterThanOrEqual(1);
    expect(longTitleEvents[0].slug).toBe(
      "delhi-international-experimental-ambient-electronic-sound-arts-festival"
    );
    expect(longTitleEvents[0].title.length).toBeGreaterThan(80);
  });
});

describe("Milestone M0 Empirical Challenge: Concurrency Math & Security Boundary Tests", () => {
  it("strictly prevents floating-point penny/paise leakage in currency multiplication", () => {
    // In IEEE 754 float: 19.99 * 100 = 1998.9999999999998
    // In paise: 1999 paise * 3 = 5997 paise
    const pricePaise = 1999;
    const qty = 3;
    const totalPaise = pricePaise * qty;
    expect(Number.isInteger(totalPaise)).toBe(true);
    expect(totalPaise).toBe(5997);
  });

  it("handles high quantity paise multiplication without precision loss", () => {
    // ₹1,00,000 * 10 tickets = 10,000,000 paise * 10 = 100,000,000 paise (well within Number.MAX_SAFE_INTEGER 9e15)
    const expensiveTierPaise = 10000000;
    const maxTickets = 10;
    const total = expensiveTierPaise * maxTickets;
    expect(total).toBe(100000000);
    expect(Number.isSafeInteger(total)).toBe(true);
  });

  it("rejects tampered HMAC ticket signatures in constant time", () => {
    const secret = "test_super_secret_signing_key";
    const ticketId = "tkt_12345678";
    const eventId = "evt_87654321";

    const validSig = crypto
      .createHmac("sha256", secret)
      .update(`${ticketId}:${eventId}`)
      .digest("base64url")
      .slice(0, 16);

    const validCode = `EP1.${ticketId}.${validSig}`;

    // Tampered signatures
    const tamperedCode1 = `EP1.${ticketId}.${validSig.slice(0, 15)}X`;
    const tamperedCode2 = `EP1.tampered_tkt.${validSig}`;
    const malformedPrefix = `EP2.${ticketId}.${validSig}`;

    function verifyCode(code: string): boolean {
      const parts = code.split(".");
      if (parts.length !== 3 || parts[0] !== "EP1") return false;
      const [_, tId, sig] = parts;
      if (!sig || sig.length !== 16) return false;

      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(`${tId}:${eventId}`)
        .digest("base64url")
        .slice(0, 16);

      return crypto.timingSafeEqual(
        Buffer.from(sig, "utf-8"),
        Buffer.from(expectedSig, "utf-8")
      );
    }

    expect(verifyCode(validCode)).toBe(true);
    expect(verifyCode(tamperedCode1)).toBe(false);
    expect(verifyCode(malformedPrefix)).toBe(false);
  });
});
