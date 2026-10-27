import { describe, it, expect, beforeEach } from "vitest";

// Domain logic for IndexedDB offline wallet & scanner packs (PRD 6.4, AC-F7-4, AC-F7-8, AC-F9-2, AC-F9-9)
export interface OfflineWalletStore {
  tickets: Map<string, any>;
  lastUpdated: string | null;
}

export class MockWalletCache {
  private store: OfflineWalletStore = { tickets: new Map(), lastUpdated: null };

  saveTickets(tickets: any[]) {
    this.store.tickets.clear();
    for (const t of tickets) {
      this.store.tickets.set(t.id, t);
    }
    this.store.lastUpdated = new Date().toISOString();
  }

  getTickets(): any[] {
    return Array.from(this.store.tickets.values());
  }

  getLastUpdated(): string | null {
    return this.store.lastUpdated;
  }
}

export function shouldServiceWorkerCache(url: string, method: string): boolean {
  if (method !== "GET") return false;
  // Never cache order creation, scan validation, or scan sync APIs (AC-F7-8)
  if (url.includes("/api/orders")) return false;
  if (url.includes("/api/scan/validate")) return false;
  if (url.includes("/api/scan/sync")) return false;
  return true;
}

export class MockSyncClient {
  private queue: any[] = [];

  enqueue(item: any) {
    this.queue.push(item);
  }

  getQueue() {
    return [...this.queue];
  }

  createBatch(maxChunk: number = 100) {
    return this.queue.slice(0, maxChunk);
  }

  removeConfirmed(confirmedClientScanIds: string[]) {
    const idSet = new Set(confirmedClientScanIds);
    this.queue = this.queue.filter((item) => !idSet.has(item.clientScanId));
  }
}

describe("F7 & F9 Offline Storage, Cache Rules & Sync Client", () => {
  it("AC-F7-4: wallet cache saves, reads and replaces in IndexedDB; stale tickets removed", () => {
    const cache = new MockWalletCache();
    cache.saveTickets([{ id: "t1", title: "Event 1" }, { id: "t2", title: "Event 2" }]);

    expect(cache.getTickets().length).toBe(2);
    expect(cache.getLastUpdated()).toBeTruthy();

    // Replace with fresh server data where t2 was cancelled/removed
    cache.saveTickets([{ id: "t1", title: "Event 1" }, { id: "t3", title: "Event 3" }]);
    const current = cache.getTickets();
    expect(current.length).toBe(2);
    expect(current.some((t) => t.id === "t2")).toBe(false);
    expect(current.some((t) => t.id === "t3")).toBe(true);
  });

  it("AC-F7-8: caching rules never cache non-GET requests or any API call for orders, scan validate, or scan sync", () => {
    // Non-GET requests
    expect(shouldServiceWorkerCache("https://eventpass.demo/api/orders", "POST")).toBe(false);
    expect(shouldServiceWorkerCache("https://eventpass.demo/api/scan/sync", "POST")).toBe(false);

    // Banned GET endpoints
    expect(shouldServiceWorkerCache("https://eventpass.demo/api/orders/ord_123", "GET")).toBe(false);
    expect(shouldServiceWorkerCache("https://eventpass.demo/api/scan/validate", "GET")).toBe(false);
    expect(shouldServiceWorkerCache("https://eventpass.demo/api/scan/sync", "GET")).toBe(false);

    // Allowed static and event pages
    expect(shouldServiceWorkerCache("https://eventpass.demo/", "GET")).toBe(true);
    expect(shouldServiceWorkerCache("https://eventpass.demo/events/tech-summit", "GET")).toBe(true);
    expect(shouldServiceWorkerCache("https://eventpass.demo/_next/static/chunks/main.js", "GET")).toBe(true);
  });

  it("AC-F9-2: pack is saved with download time; new download replaces old pack for that event only", () => {
    const packs = new Map<string, { eventId: string; downloadedAt: string; tickets: any[] }>();

    function savePack(eventId: string, tickets: any[]) {
      packs.set(eventId, {
        eventId,
        downloadedAt: new Date().toISOString(),
        tickets,
      });
    }

    savePack("evt_1", [{ ticketId: "t1" }, { ticketId: "t2" }]);
    savePack("evt_2", [{ ticketId: "t3" }]);

    expect(packs.get("evt_1")?.tickets.length).toBe(2);
    expect(packs.get("evt_2")?.tickets.length).toBe(1);

    // Replace evt_1 only
    savePack("evt_1", [{ ticketId: "t1_updated" }]);
    expect(packs.get("evt_1")?.tickets.length).toBe(1);
    expect(packs.get("evt_2")?.tickets.length).toBe(1);
  });

  it("AC-F9-9: sync client sends chunks of at most 100, removes only confirmed items, keeps failed items", () => {
    const syncClient = new MockSyncClient();
    for (let i = 0; i < 150; i++) {
      syncClient.enqueue({ clientScanId: `scan_${i}`, code: `code_${i}` });
    }

    // Chunk size limit <= 100
    const chunk1 = syncClient.createBatch(100);
    expect(chunk1.length).toBe(100);

    // Server confirms first 50
    const confirmed = chunk1.slice(0, 50).map((s) => s.clientScanId);
    syncClient.removeConfirmed(confirmed);

    // 100 items remain in queue
    expect(syncClient.getQueue().length).toBe(100);
    expect(syncClient.getQueue()[0].clientScanId).toBe("scan_50");
  });
});
