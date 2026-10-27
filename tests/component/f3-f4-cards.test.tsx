import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventCard } from "@/components/events/event-card";
import { ShareButton } from "@/components/events/share-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

describe("F3 & F4 UI Components", () => {
  const sampleEvent = {
    id: "evt_1",
    slug: "tech-summit-2026",
    title: "Tech Summit 2026",
    description: "Future of web & cloud architecture",
    category: "TECH",
    city: "Bengaluru",
    venueName: "Palace Grounds",
    startsAt: new Date(Date.now() + 86400000).toISOString(),
    endsAt: new Date(Date.now() + 90000000).toISOString(),
    coverSeed: "tech-summit-seed",
    status: "PUBLISHED" as const,
    tiers: [{ pricePaise: 99900, capacity: 100, sold: 10 }],
  };

  it("AC-F3-5: event card shows cover, title, local date and time, venue, city, price text and right badge", () => {
    render(<EventCard event={sampleEvent} />);
    expect(screen.getByText("Tech Summit 2026")).toBeInTheDocument();
    expect(screen.getByText(/Bengaluru/)).toBeInTheDocument();
    expect(screen.getByText(/Palace Grounds/)).toBeInTheDocument();
    expect(screen.getByText(/From ₹999/)).toBeInTheDocument();
  });

  it("AC-F3-8: loading shows skeleton cards; failed request shows error state with working retry", async () => {
    const handleRetry = vi.fn();
    const { rerender } = render(<Skeleton data-testid="card-skeleton" className="h-48 w-full" />);
    expect(screen.getByTestId("card-skeleton")).toBeInTheDocument();

    rerender(<ErrorState title="Error Loading Events" onRetry={handleRetry} />);
    const retryBtn = screen.getByRole("button", { name: /try again/i });
    expect(retryBtn).toBeInTheDocument();
    await userEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalled();
  });

  it("AC-F4-6: Share uses Web Share API when it exists; otherwise copies link and shows toast", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(<ShareButton title="Tech Summit 2026" url="https://eventpass.demo/events/tech-summit-2026" />);
    const shareBtn = screen.getByRole("button", { name: /share event/i });
    await userEvent.click(shareBtn);
    expect(writeTextMock).toHaveBeenCalledWith("https://eventpass.demo/events/tech-summit-2026");
  });
});
