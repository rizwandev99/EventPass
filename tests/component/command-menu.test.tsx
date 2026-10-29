import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandMenu } from "@/components/ui/command-menu";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("CommandMenu Search & Navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filters navigation items when typing", async () => {
    render(<CommandMenu isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByRole("textbox", { name: /search events and pages/i });
    expect(screen.getByText("Discover Events")).toBeInTheDocument();
    expect(screen.getByText("Digital Wallet")).toBeInTheDocument();

    await userEvent.type(input, "wallet");

    // "Digital Wallet" should match, "Discover Events" should be filtered out
    expect(screen.getByText("Digital Wallet")).toBeInTheDocument();
    expect(screen.queryByText("Discover Events")).not.toBeInTheDocument();
  });

  it("searches events and displays matching results", async () => {
    const mockEvents = [
      {
        id: "evt-1",
        slug: "delhi-live-indie-music",
        title: "Delhi Live: Indie Music & Acoustic Nights",
        category: "MUSIC",
        city: "Delhi",
        venueName: "The Piano Man",
        startsAt: "2026-11-15T18:00:00Z",
        status: "PUBLISHED",
      },
    ];

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: mockEvents }),
    } as Response);

    const onSelectEvent = vi.fn();
    render(<CommandMenu isOpen={true} onClose={vi.fn()} onSelectEvent={onSelectEvent} />);

    const input = screen.getByRole("textbox", { name: /search events and pages/i });
    await userEvent.type(input, "del");

    // Wait for debounced fetch
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    // Event title should be displayed
    await waitFor(() => {
      expect(screen.getByText("Delhi Live: Indie Music & Acoustic Nights")).toBeInTheDocument();
    });
    expect(screen.getByText(/The Piano Man/)).toBeInTheDocument();

    // Clicking the event
    const eventItem = screen.getByText("Delhi Live: Indie Music & Acoustic Nights");
    await userEvent.click(eventItem);

    expect(onSelectEvent).toHaveBeenCalledWith("delhi-live-indie-music");
    fetchSpy.mockRestore();
  });

  it("shows empty state when no results match", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    } as Response);

    render(<CommandMenu isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByRole("textbox", { name: /search events and pages/i });
    await userEvent.type(input, "zzzzzzzz");

    await waitFor(() => {
      expect(screen.getByText(/no results found for/i)).toBeInTheDocument();
      expect(screen.getByText(/zzzzzzzz/)).toBeInTheDocument();
    });

    fetchSpy.mockRestore();
  });
});
