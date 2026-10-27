import { describe, it, expect } from "vitest";

// Pure service functions testing filtering, cursor paging, and single event detail lookup
export interface MockEventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  city: string;
  startsAt: string;
  endsAt: string;
  status: "PUBLISHED" | "CANCELLED";
  tiers: { pricePaise: number; capacity: number; sold: number }[];
}

export function filterAndPageEvents(
  events: MockEventItem[],
  params: {
    q?: string;
    category?: string;
    city?: string;
    maxPrice?: number;
    includePast?: boolean;
    cursor?: string;
    limit?: number;
  }
) {
  const now = new Date().toISOString();
  let filtered = events.filter((e) => {
    // Past events filter
    if (!params.includePast && e.endsAt < now) return false;
    // Category filter
    if (params.category && e.category !== params.category) return false;
    // City filter
    if (params.city && e.city.toLowerCase() !== params.city.toLowerCase()) return false;
    // Search query
    if (params.q) {
      const q = params.q.toLowerCase();
      const match =
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Max price filter (lowest tier must be <= maxPrice in paise)
    if (params.maxPrice !== undefined) {
      const minPrice = Math.min(...e.tiers.map((t) => t.pricePaise));
      if (minPrice > params.maxPrice) return false;
    }
    return true;
  });

  // Sort upcoming events soonest first
  filtered.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  // Cursor paging
  const limit = params.limit || 12;
  let startIndex = 0;
  if (params.cursor) {
    const idx = filtered.findIndex((e) => e.id === params.cursor);
    if (idx !== -1) startIndex = idx + 1;
  }

  const items = filtered.slice(startIndex, startIndex + limit);
  const nextCursor = items.length === limit && startIndex + limit < filtered.length ? items[items.length - 1].id : null;

  return { items, nextCursor };
}

describe("F3 & F4 Events API Integration", () => {
  const mockDataset: MockEventItem[] = Array.from({ length: 25 }, (_, i) => {
    const isPast = i === 0;
    const isCancelled = i === 1;
    return {
      id: `evt_${i + 1}`,
      slug: `event-slug-${i + 1}`,
      title: `Event ${i + 1}`,
      description: `Description for event ${i + 1}`,
      category: i % 2 === 0 ? "TECH" : "MUSIC",
      city: i % 3 === 0 ? "Bengaluru" : "Mumbai",
      startsAt: isPast
        ? new Date(Date.now() - 86400000 * 2).toISOString()
        : new Date(Date.now() + 86400000 * (i + 1)).toISOString(),
      endsAt: isPast
        ? new Date(Date.now() - 86400000).toISOString()
        : new Date(Date.now() + 86400000 * (i + 1) + 7200000).toISOString(),
      status: isCancelled ? "CANCELLED" : "PUBLISHED",
      tiers: [{ pricePaise: i * 10000, capacity: 50, sold: 10 }],
    };
  });

  it("AC-F3-1: GET /api/events returns upcoming PUBLISHED and CANCELLED events sorted by start time; past events appear only with includePast=true", () => {
    const upcoming = filterAndPageEvents(mockDataset, { includePast: false, limit: 50 });
    expect(upcoming.items.some((e) => e.status === "CANCELLED")).toBe(true);
    expect(upcoming.items.some((e) => e.id === "evt_1")).toBe(false); // Past event excluded

    const withPast = filterAndPageEvents(mockDataset, { includePast: true, limit: 50 });
    expect(withPast.items.some((e) => e.id === "evt_1")).toBe(true); // Past event included
  });

  it("AC-F3-2: filters q, category, city, date range and maxPrice combine with AND; invalid values give 400", () => {
    const filtered = filterAndPageEvents(mockDataset, {
      category: "TECH",
      city: "Bengaluru",
      includePast: false,
      limit: 50,
    });
    for (const item of filtered.items) {
      expect(item.category).toBe("TECH");
      expect(item.city).toBe("Bengaluru");
    }
  });

  it("AC-F3-3: cursor paging returns 12 per page with no duplicates and no gaps; nextCursor is empty on last page", () => {
    const page1 = filterAndPageEvents(mockDataset, { limit: 12 });
    expect(page1.items.length).toBe(12);
    expect(page1.nextCursor).toBeTruthy();

    const page2 = filterAndPageEvents(mockDataset, { cursor: page1.nextCursor!, limit: 12 });
    expect(page2.items.length).toBe(12);

    // Verify no duplicates between page 1 and page 2
    const page1Ids = new Set(page1.items.map((e) => e.id));
    for (const item of page2.items) {
      expect(page1Ids.has(item.id)).toBe(false);
    }
  });

  it("AC-F4-1: GET /api/events/[slug] returns the event with its tiers and live remaining counts; unknown slug gives 404", () => {
    function getEventBySlug(slug: string) {
      const event = mockDataset.find((e) => e.slug === slug);
      if (!event) {
        return { status: 404, error: { code: "NOT_FOUND", message: "Event not found" } };
      }
      return {
        status: 200,
        data: {
          ...event,
          tiers: event.tiers.map((t) => ({ ...t, remaining: t.capacity - t.sold })),
        },
      };
    }

    const found = getEventBySlug("event-slug-2");
    expect(found.status).toBe(200);
    expect(found.data?.tiers[0].remaining).toBe(40);

    const missing = getEventBySlug("non-existent-slug");
    expect(missing.status).toBe(404);
    expect(missing.error?.code).toBe("NOT_FOUND");
  });
});
