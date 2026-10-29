import crypto from "crypto";

export function generateGuestId(): string {
  // At least 128 bits of cryptographic randomness (16 bytes = 128 bits, hex = 32 chars)
  return "gst_" + crypto.randomBytes(16).toString("hex");
}

export function parseGuestCookie(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/eventpass_guest=([^;]+)/);
  if (!match || !match[1] || match[1].trim() === "") return null;
  return match[1].trim();
}

export function getGuestIdFromRequest(request: {
  cookies?: { get?: (name: string) => { value: string } | undefined };
  headers?: { get?: (name: string) => string | null };
}): string | null {
  const fromCookies = request.cookies?.get?.("eventpass_guest")?.value;
  if (fromCookies && fromCookies.trim().length > 0) {
    return fromCookies.trim();
  }
  const cookieHeader = request.headers?.get?.("cookie");
  return parseGuestCookie(cookieHeader);
}

export function createGuestCookieHeader(guestId: string): string {
  return `eventpass_guest=${guestId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`;
}
