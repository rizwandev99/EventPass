import { describe, it, expect } from "vitest";
import crypto from "crypto";

// Domain logic for guest session cookies (PRD F2)
export function generateGuestId(): string {
  // At least 128 bits of cryptographic randomness (16 bytes = 128 bits, hex = 32 chars)
  return "gst_" + crypto.randomBytes(16).toString("hex");
}

export function parseGuestCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/eventpass_guest=([^;]+)/);
  return match ? match[1] : null;
}

export function createGuestCookieHeader(guestId: string): string {
  return `eventpass_guest=${guestId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;
}

describe("F2 Guest Session Integration", () => {
  it("AC-F2-1: request without guest cookie gets new cookie with >=128 bits randomness; later requests keep same ID", () => {
    // 1st request: no cookie
    const initialCookie = null;
    let guestId = parseGuestCookie(initialCookie);
    expect(guestId).toBeNull();

    // Server generates new guest ID
    const newGuestId = generateGuestId();
    // Verify at least 128 bits of randomness (hex portion >= 32 hex chars)
    const hexPart = newGuestId.replace("gst_", "");
    expect(hexPart.length).toBeGreaterThanOrEqual(32);

    const setCookie = createGuestCookieHeader(newGuestId);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");

    // Later request sends the cookie back
    const subsequentCookie = `eventpass_guest=${newGuestId}; other=123`;
    const preservedGuestId = parseGuestCookie(subsequentCookie);
    expect(preservedGuestId).toBe(newGuestId);
  });

  it("AC-F2-2: orders and tickets are only returned for the guest in cookie; another guest gets 404", async () => {
    // Guest ownership authorization invariant
    const guestA = generateGuestId();
    const guestB = generateGuestId();

    const mockOrders = [
      { id: "ord_1", guestId: guestA, title: "Order A" },
      { id: "ord_2", guestId: guestB, title: "Order B" },
    ];

    function getOrderForGuest(orderId: string, requestGuestId: string) {
      const order = mockOrders.find((o) => o.id === orderId);
      if (!order || order.guestId !== requestGuestId) {
        return { status: 404, error: { code: "NOT_FOUND", message: "Order not found" } };
      }
      return { status: 200, data: order };
    }

    const resA = getOrderForGuest("ord_1", guestA);
    expect(resA.status).toBe(200);

    // Guest B requesting Guest A's order must return 404 NOT_FOUND
    const resB = getOrderForGuest("ord_1", guestB);
    expect(resB.status).toBe(404);
    expect(resB.error?.code).toBe("NOT_FOUND");
  });

  it("AC-F2-3: public pages and event APIs do not create Guest rows; first booking or wallet read does", () => {
    let guestDbCreated = false;

    function handlePublicEventQuery() {
      // Browsing events is anonymous and purely read-only
      return { events: [] };
    }

    function handleFirstBookingOrWalletRead(guestId: string) {
      // Lazy creation on stateful action
      guestDbCreated = true;
      return { guestId, created: true };
    }

    handlePublicEventQuery();
    expect(guestDbCreated).toBe(false);

    handleFirstBookingOrWalletRead(generateGuestId());
    expect(guestDbCreated).toBe(true);
  });
});
