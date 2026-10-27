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
        upcoming.push(t);
      }
    }
  }

  return { upcoming, past, cancelled };
}
