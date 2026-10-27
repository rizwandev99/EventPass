import { verifyTicketCode } from "./booking";

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
