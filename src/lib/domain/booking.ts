import crypto from "crypto";

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
