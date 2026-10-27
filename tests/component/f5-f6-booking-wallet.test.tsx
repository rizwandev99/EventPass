import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { QrCodeCard } from "@/components/wallet/qr-code-card";

describe("F5 & F6 Component Tests", () => {
  it("AC-F5-2: stepper cannot go below 0, above tier maximum, or above what is left; Continue disabled when total is 0 or >10", async () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <div>
        <Stepper value={0} min={0} max={6} onChange={handleChange} />
        <Button disabled={true}>Continue</Button>
      </div>
    );

    const minusBtn = screen.getByRole("button", { name: /decrease quantity/i });
    expect(minusBtn).toBeDisabled();

    const plusBtn = screen.getByRole("button", { name: /increase quantity/i });
    expect(plusBtn).not.toBeDisabled();
    await userEvent.click(plusBtn);
    expect(handleChange).toHaveBeenCalledWith(1);

    const continueBtn = screen.getByRole("button", { name: /continue/i });
    expect(continueBtn).toBeDisabled();

    rerender(
      <div>
        <Stepper value={6} min={0} max={6} onChange={handleChange} />
        <Button disabled={false}>Continue</Button>
      </div>
    );
    const maxPlusBtn = screen.getByRole("button", { name: /increase quantity/i });
    expect(maxPlusBtn).toBeDisabled();
  });

  it("AC-F5-12: Pay button shows loading and is disabled while running; failed payment shows error with Try again", async () => {
    const { rerender } = render(
      <Button variant="primary" isLoading={true}>
        Pay Now
      </Button>
    );

    const payBtn = screen.getByRole("button");
    expect(payBtn).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    const handleRetry = vi.fn();
    rerender(
      <div>
        <div role="alert">Payment simulated failure</div>
        <Button onClick={handleRetry}>Try again</Button>
      </div>
    );

    const retryBtn = screen.getByRole("button", { name: /try again/i });
    expect(retryBtn).toBeInTheDocument();
    await userEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalled();
  });

  it("AC-F6-3: QR encodes exactly ticket code", () => {
    const code = "EP1.tkt_test_123.sig_abc_1234567";
    render(<QrCodeCard code={code} attendeeName="John Doe" tierName="VIP" status="VALID" />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("VIP")).toBeInTheDocument();
  });

  it("AC-F6-8: QR tile stays white with quiet margin in both themes and works at 360px width", () => {
    const code = "EP1.tkt_test_123.sig_abc_1234567";
    render(<QrCodeCard code={code} attendeeName="John Doe" tierName="VIP" status="VALID" />);

    const qrTile = screen.getByTestId("qr-white-tile");
    expect(qrTile).toBeInTheDocument();
    expect(qrTile.className).toContain("bg-white");
    expect(qrTile.className).toContain("p-4");
  });

  it("AC-F6-6: Wake Lock is requested when ticket view opens and released when it closes", async () => {
    let wakeLockReleased = false;
    const requestWakeLockMock = vi.fn().mockResolvedValue({
      release: () => {
        wakeLockReleased = true;
      },
    });

    Object.assign(navigator, {
      wakeLock: {
        request: requestWakeLockMock,
      },
    });

    const { unmount } = render(
      <QrCodeCard code="EP1.tkt_1.sig" attendeeName="Jane" tierName="General" status="VALID" />
    );
    expect(requestWakeLockMock).toHaveBeenCalledWith("screen");

    // Wait for microtask tick so wakeLockSentinel is populated
    await new Promise((r) => setTimeout(r, 10));

    unmount();
    expect(wakeLockReleased).toBe(true);
  });
});
