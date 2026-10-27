import crypto from "crypto";

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
