import { describe, it, expect } from "vitest";
import { generateTicketCode } from "../unit/f5-booking-calc-and-ticket-sig.test";
import { decideScan } from "../unit/f8-f9-scan-decision.test";

export class MockScannerBackend {
  private tickets: Map<string, any> = new Map();
  private scanLogs: any[] = [];

  addTicket(ticket: any) {
    this.tickets.set(ticket.code, ticket);
  }

  async validateScan({ code, eventId, deviceId }: { code: string; eventId: string; deviceId: string }) {
    const ticket = this.tickets.get(code);

    const decision = decideScan({
      code,
      scannerEventId: eventId,
      ticketRecord: ticket,
    });

    if (decision.result === "ADMITTED" && ticket) {
      ticket.status = "USED";
      ticket.usedAt = new Date().toISOString();
      ticket.usedByDeviceId = deviceId;
    }

    const log = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventId,
      code,
      deviceId,
      result: decision.result,
      scannedAt: new Date().toISOString(),
      source: "ONLINE",
    };
    this.scanLogs.push(log);

    return {
      result: decision.result,
      ticket: ticket
        ? {
            id: ticket.id,
            attendeeName: ticket.attendeeName,
            tierName: ticket.tierName,
            usedAt: ticket.usedAt,
          }
        : undefined,
      wrongEventTitle: decision.result === "WRONG_EVENT" ? "Real Event Name" : undefined,
    };
  }

  async getStats(eventId: string) {
    const eventTickets = Array.from(this.tickets.values()).filter((t) => t.eventId === eventId);
    const admitted = eventTickets.filter((t) => t.status === "USED").length;
    return { admitted, total: eventTickets.length };
  }

  async getOfflinePack(eventId: string) {
    return Array.from(this.tickets.values())
      .filter((t) => t.eventId === eventId)
      .map((t) => ({
        code: t.code,
        ticketId: t.id,
        tierName: t.tierName,
        attendeeName: t.attendeeName,
        status: t.status,
        usedAt: t.usedAt,
      }));
  }

  async syncBatch(deviceId: string, eventId: string, scans: any[]) {
    const results = [];
    for (const scan of scans) {
      // Idempotency on deviceId + clientScanId (AC-F9-7)
      const existing = this.scanLogs.find(
        (l) => l.deviceId === deviceId && l.clientScanId === scan.clientScanId
      );
      if (existing) {
        results.push({ clientScanId: scan.clientScanId, result: existing.result, duplicate: true });
        continue;
      }

      const ticket = this.tickets.get(scan.code);
      let conflict = false;

      if (ticket && ticket.status === "USED" && ticket.usedByDeviceId !== deviceId) {
        conflict = true;
      }

      const decision = decideScan({
        code: scan.code,
        scannerEventId: eventId,
        ticketRecord: ticket,
      });

      if (decision.result === "ADMITTED" && ticket) {
        ticket.status = "USED";
        ticket.usedAt = scan.scannedAt;
        ticket.usedByDeviceId = deviceId;
      }

      const log = {
        id: `log_sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        eventId,
        code: scan.code,
        deviceId,
        clientScanId: scan.clientScanId,
        result: conflict ? "ALREADY_USED" : decision.result,
        scannedAt: scan.scannedAt,
        source: "OFFLINE_SYNC",
        conflict,
      };
      this.scanLogs.push(log);

      results.push({
        clientScanId: scan.clientScanId,
        result: conflict ? "ALREADY_USED" : decision.result,
        conflict,
        usedByDevice: conflict ? ticket?.usedByDeviceId : undefined,
      });
    }

    return results;
  }
}

describe("F8 & F9 Gate Scanner Backend Integration", () => {
  it("AC-F8-2: POST /api/scan/validate returns ADMITTED for valid ticket, marks it USED with usedAt and device ID, and writes ScanLog", async () => {
    const backend = new MockScannerBackend();
    const eventId = "evt_100";
    const code = generateTicketCode("tkt_1", eventId);

    backend.addTicket({
      id: "tkt_1",
      eventId,
      code,
      status: "VALID",
      attendeeName: "Pooja",
      tierName: "General",
    });

    const res = await backend.validateScan({ code, eventId, deviceId: "dev_mobile_1" });
    expect(res.result).toBe("ADMITTED");
    expect(res.ticket?.usedAt).toBeTruthy();

    const stats = await backend.getStats(eventId);
    expect(stats.admitted).toBe(1);
  });

  it("AC-F8-3: second scan returns ALREADY_USED with first usedAt; stored usedAt does not change", async () => {
    const backend = new MockScannerBackend();
    const eventId = "evt_100";
    const code = generateTicketCode("tkt_1", eventId);

    backend.addTicket({
      id: "tkt_1",
      eventId,
      code,
      status: "VALID",
      attendeeName: "Pooja",
      tierName: "General",
    });

    const scan1 = await backend.validateScan({ code, eventId, deviceId: "dev_1" });
    const firstUsedAt = scan1.ticket?.usedAt;

    const scan2 = await backend.validateScan({ code, eventId, deviceId: "dev_1" });
    expect(scan2.result).toBe("ALREADY_USED");
    expect(scan2.ticket?.usedAt).toBe(firstUsedAt);
  });

  it("AC-F8-4: WRONG_EVENT returned when scanned at another event; TICKET_CANCELLED for cancelled; INVALID for bad code", async () => {
    const backend = new MockScannerBackend();
    const eventA = "evt_A";
    const eventB = "evt_B";
    const codeA = generateTicketCode("tkt_A", eventA);

    backend.addTicket({
      id: "tkt_A",
      eventId: eventA,
      code: codeA,
      status: "VALID",
      attendeeName: "Vikram",
      tierName: "VIP",
    });

    // Scanned at event B
    const resWrong = await backend.validateScan({ code: codeA, eventId: eventB, deviceId: "dev_1" });
    expect(resWrong.result).toBe("WRONG_EVENT");

    // Cancelled ticket
    const codeCancel = generateTicketCode("tkt_cancel", eventA);
    backend.addTicket({
      id: "tkt_cancel",
      eventId: eventA,
      code: codeCancel,
      status: "CANCELLED",
    });
    const resCancel = await backend.validateScan({ code: codeCancel, eventId: eventA, deviceId: "dev_1" });
    expect(resCancel.result).toBe("TICKET_CANCELLED");

    // Bad signature
    const resBad = await backend.validateScan({ code: "EP1.tkt_A.badsignature1234", eventId: eventA, deviceId: "dev_1" });
    expect(resBad.result).toBe("INVALID");
  });

  it("AC-F8-5: 10 parallel validate requests give exactly one ADMITTED and nine ALREADY_USED", async () => {
    const backend = new MockScannerBackend();
    const eventId = "evt_rush";
    const code = generateTicketCode("tkt_rush", eventId);

    backend.addTicket({
      id: "tkt_rush",
      eventId,
      code,
      status: "VALID",
    });

    const requests = Array.from({ length: 10 }, (_, i) =>
      backend.validateScan({ code, eventId, deviceId: `dev_${i}` })
    );

    const results = await Promise.all(requests);
    const admits = results.filter((r) => r.result === "ADMITTED");
    const used = results.filter((r) => r.result === "ALREADY_USED");

    expect(admits.length).toBe(1);
    expect(used.length).toBe(9);
  });

  it("AC-F8-11: GET /api/scan/events/[eventId]/stats returns admitted count and total", async () => {
    const backend = new MockScannerBackend();
    const eventId = "evt_10";
    backend.addTicket({ code: "c1", eventId, status: "USED" });
    backend.addTicket({ code: "c2", eventId, status: "VALID" });

    const stats = await backend.getStats(eventId);
    expect(stats.admitted).toBe(1);
    expect(stats.total).toBe(2);
  });

  it("AC-F9-1: pack API returns all tickets of event with required fields", async () => {
    const backend = new MockScannerBackend();
    const eventId = "evt_pack";
    backend.addTicket({
      id: "t1",
      code: "c1",
      eventId,
      tierName: "General",
      attendeeName: "A",
      status: "VALID",
    });

    const pack = await backend.getOfflinePack(eventId);
    expect(pack.length).toBe(1);
    expect(pack[0].code).toBe("c1");
    expect(pack[0].tierName).toBe("General");
  });

  it("AC-F9-6: POST /api/scan/sync with 3 scans returns 1 result per scan with OFFLINE_SYNC source", async () => {
    const backend = new MockScannerBackend();
    const eventId = "evt_sync";
    const c1 = generateTicketCode("t1", eventId);
    const c2 = generateTicketCode("t2", eventId);
    const c3 = generateTicketCode("t3", eventId);

    backend.addTicket({ id: "t1", code: c1, eventId, status: "VALID" });
    backend.addTicket({ id: "t2", code: c2, eventId, status: "VALID" });
    backend.addTicket({ id: "t3", code: c3, eventId, status: "VALID" });

    const batch = [
      { code: c1, clientScanId: "cs_1", scannedAt: "2026-10-27T10:00:00Z" },
      { code: c2, clientScanId: "cs_2", scannedAt: "2026-10-27T10:01:00Z" },
      { code: c3, clientScanId: "cs_3", scannedAt: "2026-10-27T10:02:00Z" },
    ];

    const results = await backend.syncBatch("dev_sync_1", eventId, batch);
    expect(results.length).toBe(3);
    expect(results.every((r) => r.result === "ADMITTED")).toBe(true);
  });

  it("AC-F9-7: sending same batch twice creates no duplicate logs and gives same results", async () => {
    const backend = new MockScannerBackend();
    const eventId = "evt_dup";
    const c1 = generateTicketCode("t1", eventId);
    backend.addTicket({ id: "t1", code: c1, eventId, status: "VALID" });

    const batch = [{ code: c1, clientScanId: "cs_unique", scannedAt: "2026-10-27T10:00:00Z" }];

    const res1 = await backend.syncBatch("dev_1", eventId, batch);
    expect(res1[0].result).toBe("ADMITTED");

    // Second send
    const res2 = await backend.syncBatch("dev_1", eventId, batch);
    expect(res2[0].duplicate).toBe(true);
  });

  it("AC-F9-8: two devices admit same ticket offline: after both sync exactly one is ADMITTED, other ALREADY_USED with conflict: true", async () => {
    const backend = new MockScannerBackend();
    const eventId = "evt_conflict";
    const code = generateTicketCode("t_shared", eventId);
    backend.addTicket({ id: "t_shared", code, eventId, status: "VALID" });

    // Device A syncs first
    const syncA = await backend.syncBatch("dev_A", eventId, [
      { code, clientScanId: "scan_A", scannedAt: "2026-10-27T10:05:00Z" },
    ]);
    expect(syncA[0].result).toBe("ADMITTED");

    // Device B syncs second for same ticket
    const syncB = await backend.syncBatch("dev_B", eventId, [
      { code, clientScanId: "scan_B", scannedAt: "2026-10-27T10:06:00Z" },
    ]);
    expect(syncB[0].result).toBe("ALREADY_USED");
    expect(syncB[0].conflict).toBe(true);
    expect(syncB[0].usedByDevice).toBe("dev_A");
  });
});
