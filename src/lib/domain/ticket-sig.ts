import crypto from "crypto";

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
  expectedEventId: string,
  secret: string = process.env.TICKET_SIGNING_SECRET || "default_test_secret_for_ticket_signing_128bits"
): { valid: boolean; ticketId?: string } {
  if (!code || typeof code !== "string") return { valid: false };

  const parts = code.split(".");
  if (parts.length !== 3 || parts[0] !== "EP1") return { valid: false };

  const ticketId = parts[1];
  const signature = parts[2];

  if (!ticketId || !signature || signature.length !== 16) return { valid: false };

  const expectedCode = generateTicketCode(ticketId, expectedEventId, secret);
  const expectedSignature = expectedCode.split(".")[2];

  // Constant-time signature comparison (AC-F8-1)
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length) return { valid: false };
    const valid = crypto.timingSafeEqual(a, b);
    return { valid, ticketId };
  } catch (e) {
    return { valid: false };
  }
}
