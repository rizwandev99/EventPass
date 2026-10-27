import { describe, it, expect } from "vitest";
import { calculateOrderTotal, generateTicketCode, verifyTicketCode } from "@/lib/domain/booking";

export { calculateOrderTotal, generateTicketCode, verifyTicketCode };

describe("F5 Booking Calculation & HMAC Ticket Cryptography", () => {
  it("AC-F5-1: total = sum of tier price x quantity in paise; display uses rupees with Indian digit grouping", () => {
    const items = [
      { pricePaise: 250000, quantity: 2 }, // 2 x ₹2,500 = ₹5,000 (500000 paise)
      { pricePaise: 6000000, quantity: 2 }, // 2 x ₹60,000 = ₹1,20,000 (12000000 paise)
    ];

    const result = calculateOrderTotal(items);
    expect(result.totalPaise).toBe(12500000); // 1,25,000 * 100 paise
    expect(result.formattedRupees).toBe("₹1,25,000");
  });

  it("Ticket Code signing format EP1.<ticketId>.<sig> with constant-time verification", () => {
    const ticketId = "tkt_1234567890";
    const eventId = "evt_9876543210";
    const code = generateTicketCode(ticketId, eventId);

    expect(code).toMatch(/^EP1\.tkt_1234567890\.[A-Za-z0-9_-]{16}$/);

    // Valid check
    const verified = verifyTicketCode(code, eventId);
    expect(verified.valid).toBe(true);
    expect(verified.ticketId).toBe(ticketId);

    // Tampered ticket ID
    const tamperedCode = code.replace("tkt_1234567890", "tkt_tampered000");
    expect(verifyTicketCode(tamperedCode, eventId).valid).toBe(false);

    // Wrong event
    expect(verifyTicketCode(code, "different_event").valid).toBe(false);
  });
});
