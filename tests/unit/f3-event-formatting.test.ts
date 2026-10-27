import { describe, it, expect } from "vitest";

// Domain logic for pricing text and status badges (PRD F3 AC-F3-4)
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

describe("F3 Event Price & Badge Formatting", () => {
  it("AC-F3-4: price text is 'From ₹X' using lowest tier, or 'Free' when every tier is free; 'Sold out' when 0 left; 'Almost gone' when <=10 left", () => {
    // All free tiers
    const freeEvent = formatEventPriceAndBadge([
      { pricePaise: 0, capacity: 100, sold: 10 },
      { pricePaise: 0, capacity: 50, sold: 5 },
    ]);
    expect(freeEvent.priceText).toBe("Free");
    expect(freeEvent.badge).toBeNull();

    // Paid tiers: lowest tier ₹499 (49900 paise)
    const paidEvent = formatEventPriceAndBadge([
      { pricePaise: 49900, capacity: 100, sold: 10 },
      { pricePaise: 129900, capacity: 50, sold: 5 },
    ]);
    expect(paidEvent.priceText).toBe("From ₹499");
    expect(paidEvent.badge).toBeNull();

    // Almost gone: <= 10 tickets remaining in total
    const almostGoneEvent = formatEventPriceAndBadge([
      { pricePaise: 50000, capacity: 20, sold: 15 }, // 5 left
      { pricePaise: 100000, capacity: 10, sold: 7 }, // 3 left -> total 8 left
    ]);
    expect(almostGoneEvent.badge).toBe("Almost gone");

    // Sold out: 0 remaining across all tiers
    const soldOutEvent = formatEventPriceAndBadge([
      { pricePaise: 50000, capacity: 20, sold: 20 },
      { pricePaise: 100000, capacity: 10, sold: 10 },
    ]);
    expect(soldOutEvent.badge).toBe("Sold out");
  });
});
