export interface TierSummary {
  pricePaise: number;
  capacity: number;
  sold: number;
}

export function formatEventPriceAndBadge(tiers: TierSummary[]): {
  priceText: string;
  badge: "Sold out" | "Almost gone" | null;
} {
  if (!tiers || tiers.length === 0) {
    return { priceText: "Free", badge: null };
  }

  const allFree = tiers.every((t) => t.pricePaise === 0);
  const lowestPaise = Math.min(...tiers.map((t) => t.pricePaise));
  const totalRemaining = tiers.reduce((sum, t) => sum + Math.max(0, t.capacity - t.sold), 0);

  let priceText = "";
  if (allFree) {
    priceText = "Free";
  } else {
    const rupees = Math.floor(lowestPaise / 100);
    priceText = `From ₹${rupees.toLocaleString("en-IN")}`;
  }

  let badge: "Sold out" | "Almost gone" | null = null;
  if (totalRemaining === 0) {
    badge = "Sold out";
  } else if (totalRemaining <= 10) {
    badge = "Almost gone";
  }

  return { priceText, badge };
}

export function getTierRemainingLabel(remaining: number): string {
  if (remaining <= 0) return "Sold out";
  if (remaining <= 20) return `${remaining} left`;
  return "Available";
}

export function generateMapsUrl(venue: string, city: string): string {
  const query = `${venue}, ${city}`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildEventMetadata(event: {
  title: string;
  description: string;
  slug: string;
}) {
  return {
    title: `${event.title} — EventPass`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      url: `https://eventpass.demo/events/${event.slug}`,
      siteName: "EventPass",
      type: "website",
    },
  };
}
