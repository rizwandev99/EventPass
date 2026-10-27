import { describe, it, expect } from "vitest";
import { verifyTicketCode, generateTicketCode } from "./f5-booking-calc-and-ticket-sig.test";

// Pure scan decision engine (used identically on client and server - PRD AC-F9-3)
export type ScanResult =
  | "ADMITTED"
  | "ALREADY_USED"
  | "WRONG_EVENT"
  | "INVALID"
  | "TICKET_CANCELLED";

export interface ScanDecisionInput {
  code: string;
  scannerEventId: string;
  ticketRecord?: {
    id: string;
    eventId: string;
    status: "VALID" | "USED" | "CANCELLED";
    usedAt?: string | null;
  } | null;
}

export function decideScan(input: ScanDecisionInput): {
  result: ScanResult;
  usedAt?: string | null;
} {
  const { code, scannerEventId, ticketRecord } = input;

  if (!code || typeof code !== "string" || code.trim() === "") {
    return { result: "INVALID" };
  }

  // Format check EP1.<id>.<sig>
  const parts = code.split(".");
  if (parts.length !== 3 || parts[0] !== "EP1" || !parts[1] || parts[2].length !== 16) {
    return { result: "INVALID" };
  }

  // If no ticket found in pack or db
  if (!ticketRecord) {
    return { result: "INVALID" };
  }

  // Cryptographic constant-time signature verification for this ticket's real event
  const sigCheck = verifyTicketCode(code, ticketRecord.eventId);
  if (!sigCheck.valid) {
    return { result: "INVALID" };
  }

  // Wrong event check
  if (ticketRecord.eventId !== scannerEventId) {
    return { result: "WRONG_EVENT" };
  }

  // Status checks
  if (ticketRecord.status === "CANCELLED") {
    return { result: "TICKET_CANCELLED" };
  }

  if (ticketRecord.status === "USED") {
    return { result: "ALREADY_USED", usedAt: ticketRecord.usedAt };
  }

  return { result: "ADMITTED" };
}

describe("F8 & F9 Scan Decision Engine", () => {
  it("AC-F8-1: code checker accepts valid code and rejects wrong prefix, bad sig, changed ID, wrong length, and empty string", () => {
    const eventId = "evt_correct";
    const validCode = generateTicketCode("tkt_123", eventId);

    expect(verifyTicketCode(validCode, eventId).valid).toBe(true);
    expect(verifyTicketCode("", eventId).valid).toBe(false);
    expect(verifyTicketCode("EP2.tkt_123.sig1234567890123", eventId).valid).toBe(false);
    expect(verifyTicketCode("EP1.tkt_changed.sig1234567890123", eventId).valid).toBe(false);
    expect(verifyTicketCode("EP1.tkt_123.short", eventId).valid).toBe(false);
  });

  it("AC-F9-3: decideScan returns same result on client and server for same inputs (table test covering all 5 results)", () => {
    const eventA = "evt_A";
    const eventB = "evt_B";
    const validCodeA = generateTicketCode("tkt_1", eventA);

    // 1. ADMITTED
    const resAdmitted = decideScan({
      code: validCodeA,
      scannerEventId: eventA,
      ticketRecord: { id: "tkt_1", eventId: eventA, status: "VALID" },
    });
    expect(resAdmitted.result).toBe("ADMITTED");

    // 2. ALREADY_USED
    const resUsed = decideScan({
      code: validCodeA,
      scannerEventId: eventA,
      ticketRecord: { id: "tkt_1", eventId: eventA, status: "USED", usedAt: "2026-10-27T10:00:00Z" },
    });
    expect(resUsed.result).toBe("ALREADY_USED");
    expect(resUsed.usedAt).toBe("2026-10-27T10:00:00Z");

    // 3. WRONG_EVENT
    const resWrongEvent = decideScan({
      code: validCodeA,
      scannerEventId: eventB, // Scanned at Event B instead of Event A
      ticketRecord: { id: "tkt_1", eventId: eventA, status: "VALID" },
    });
    expect(resWrongEvent.result).toBe("WRONG_EVENT");

    // 4. TICKET_CANCELLED
    const resCancelled = decideScan({
      code: validCodeA,
      scannerEventId: eventA,
      ticketRecord: { id: "tkt_1", eventId: eventA, status: "CANCELLED" },
    });
    expect(resCancelled.result).toBe("TICKET_CANCELLED");

    // 5. INVALID
    const resInvalid = decideScan({
      code: "EP1.tkt_fake.badsignature1234",
      scannerEventId: eventA,
      ticketRecord: { id: "tkt_fake", eventId: eventA, status: "VALID" },
    });
    expect(resInvalid.result).toBe("INVALID");
  });
});
