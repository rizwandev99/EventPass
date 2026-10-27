import { describe, it, expect } from "vitest";
import { groupWalletTickets, type WalletTicketItem } from "@/lib/domain/wallet";

export { groupWalletTickets, type WalletTicketItem };

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
