import { describe, it, expect } from "vitest";
import { formatEventPriceAndBadge, type TierSummary } from "@/lib/domain/events";

export { formatEventPriceAndBadge, type TierSummary };

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
