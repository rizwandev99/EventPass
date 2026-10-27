import { describe, it, expect } from "vitest";
import { getTierRemainingLabel, generateMapsUrl, buildEventMetadata } from "@/lib/domain/events";

export { getTierRemainingLabel, generateMapsUrl, buildEventMetadata };

describe("F4 Event Detail Utilities", () => {
  it("AC-F4-3: remaining label is exact number when <=20, 'Available' above 20, and 'Sold out' at 0", () => {
    expect(getTierRemainingLabel(0)).toBe("Sold out");
    expect(getTierRemainingLabel(5)).toBe("5 left");
    expect(getTierRemainingLabel(20)).toBe("20 left");
    expect(getTierRemainingLabel(21)).toBe("Available");
    expect(getTierRemainingLabel(150)).toBe("Available");
  });

  it("AC-F4-7: page metadata (title, description, Open Graph) is built from event data", () => {
    const meta = buildEventMetadata({
      title: "Indie Rock Night",
      description: "A loud and energetic night of underground indie rock bands in Bengaluru.",
      slug: "indie-rock-night",
    });

    expect(meta.title).toBe("Indie Rock Night — EventPass");
    expect(meta.description).toContain("indie rock bands");
    expect(meta.openGraph.url).toBe("https://eventpass.demo/events/indie-rock-night");
  });

  it("AC-F4-8: Open in Maps link safely encodes venue and city, including special characters", () => {
    const url = generateMapsUrl("The Humming Tree & Co.", "Bengaluru / Karnataka");
    expect(url).toBe(
      "https://www.google.com/maps/search/?api=1&query=The%20Humming%20Tree%20%26%20Co.%2C%20Bengaluru%20%2F%20Karnataka"
    );
  });
});
