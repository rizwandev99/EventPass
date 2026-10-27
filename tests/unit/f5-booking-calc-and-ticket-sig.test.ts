import { describe, it, expect } from "vitest";
import crypto from "crypto";

// Domain logic for pricing and ticket code cryptography (PRD 6.2, AC-F5-1, AC-F8-1)
export function calculateOrderTotal(
  items: { pricePaise: number; quantity: number }[]
): {
  totalPaise: number;
  formattedRupees: string;
} {
  const totalPaise = items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);
  const rupees = Math.floor(totalPaise / 100);
  const formattedRupees = `₹${rupees.toLocaleString("en-IN")}`;
  return { totalPaise, formattedRupees };
}

export function generateTicketCode(
  ticketId: string,
  eventId: string,
  secret: string = process.env.TICKET_SIGNING_SECRET || "default_test_secret_for_ticket_signing_128bits"
): string {
  const data = `${ticketId}:${eventId}`;
  const hmac = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  const signature = hmac.substring(0, 16);
  return `EP1.${ticketId}.${signature}`;
}

export function verifyTicketCode(
  code: string,
  eventId: string,
  secret: string = process.env.TICKET_SIGNING_SECRET || "default_test_secret_for_ticket_signing_128bits"
): { valid: boolean; ticketId?: string } {
  if (!code || typeof code !== "string") return { valid: false };
  const parts = code.split(".");
  if (parts.length !== 3) return { valid: false };

  const [prefix, ticketId, signature] = parts;
  if (prefix !== "EP1" || !ticketId || !signature || signature.length !== 16) {
    return { valid: false };
  }

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${ticketId}:${eventId}`)
    .digest("base64url")
    .substring(0, 16);

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (sigBuffer.length !== expectedBuffer.length) {
    return { valid: false };
  }

  const match = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  return { valid: match, ticketId: match ? ticketId : undefined };
}

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
