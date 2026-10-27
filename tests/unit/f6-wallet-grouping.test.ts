import { describe, it, expect } from "vitest";

// Domain logic for digital wallet grouping (AC-F6-2)
export interface WalletTicketItem {
  id: string;
  code: string;
  status: "VALID" | "USED" | "CANCELLED";
  event: {
    id: string;
    title: string;
    endsAt: string;
    status: "PUBLISHED" | "CANCELLED";
  };
}

export function groupWalletTickets(
  tickets: WalletTicketItem[],
  referenceNow: Date = new Date()
): {
  upcoming: WalletTicketItem[];
  past: WalletTicketItem[];
  cancelled: WalletTicketItem[];
} {
  const upcoming: WalletTicketItem[] = [];
  const past: WalletTicketItem[] = [];
  const cancelled: WalletTicketItem[] = [];

  for (const t of tickets) {
    if (t.status === "CANCELLED" || t.event.status === "CANCELLED") {
      cancelled.push(t);
    } else {
      const endsAt = new Date(t.event.endsAt);
      if (endsAt.getTime() < referenceNow.getTime()) {
        past.push(t);
      } else {
        // Event not ended and ticket not cancelled
        upcoming.push(t);
      }
    }
  }

  return { upcoming, past, cancelled };
}

describe("F6 Wallet Ticket Grouping", () => {
  it("AC-F6-2: grouping puts tickets into Upcoming, Past, or Cancelled; handles event that ends exactly now", () => {
    const now = new Date("2026-10-27T12:00:00Z");

    const tickets: WalletTicketItem[] = [
      {
        id: "t1",
        code: "EP1.t1.sig1",
        status: "VALID",
        event: {
          id: "e1",
          title: "Future Event",
          endsAt: "2026-10-27T18:00:00Z",
          status: "PUBLISHED",
        },
      },
      {
        id: "t2",
        code: "EP1.t2.sig2",
        status: "USED",
        event: {
          id: "e2",
          title: "Ongoing Event",
          endsAt: "2026-10-27T14:00:00Z",
          status: "PUBLISHED",
        },
      },
      {
        id: "t3",
        code: "EP1.t3.sig3",
        status: "VALID",
        event: {
          id: "e3",
          title: "Yesterday Event",
          endsAt: "2026-10-26T22:00:00Z",
          status: "PUBLISHED",
        },
      },
      {
        id: "t4",
        code: "EP1.t4.sig4",
        status: "CANCELLED",
        event: {
          id: "e4",
          title: "Cancelled Ticket",
          endsAt: "2026-10-28T00:00:00Z",
          status: "PUBLISHED",
        },
      },
      {
        id: "t5",
        code: "EP1.t5.sig5",
        status: "VALID",
        event: {
          id: "e5",
          title: "Ends Exactly Now",
          endsAt: "2026-10-27T12:00:00Z",
          status: "PUBLISHED",
        },
      },
    ];

    const grouped = groupWalletTickets(tickets, now);

    // t1 and t2 (used but ongoing) and t5 (ends exactly now, not < now) are in upcoming
    expect(grouped.upcoming.map((t) => t.id)).toEqual(["t1", "t2", "t5"]);
    expect(grouped.past.map((t) => t.id)).toEqual(["t3"]);
    expect(grouped.cancelled.map((t) => t.id)).toEqual(["t4"]);
  });
});
