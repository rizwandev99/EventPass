"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stepper } from "@/components/ui/stepper";
import { X, CheckCircle2, AlertTriangle, ShieldCheck, CreditCard } from "lucide-react";
import { calculateOrderTotal } from "@/lib/domain/booking";

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    tiers: {
      id: string;
      name: string;
      pricePaise: number;
      capacity: number;
      sold: number;
      maxPerOrder: number;
    }[];
  };
}

export function BookingModal({ isOpen, onClose, event }: BookingModalProps) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [attendeeName, setAttendeeName] = useState("");
  const [simulateFail, setSimulateFail] = useState(false);
  const [step, setStep] = useState<"tickets" | "name" | "pay" | "success">("tickets");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const items = event.tiers
    .map((t) => ({
      tierId: t.id,
      pricePaise: t.pricePaise,
      quantity: quantities[t.id] || 0,
    }))
    .filter((i) => i.quantity > 0);

  const { totalPaise, formattedRupees } = calculateOrderTotal(items);
  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0);
  const isFree = totalPaise === 0;

  function handleQuantityChange(tierId: string, val: number) {
    setQuantities((prev) => ({
      ...prev,
      [tierId]: val,
    }));
  }

  function handleContinueFromTickets() {
    if (totalQuantity > 0 && totalQuantity <= 10) {
      setStep("name");
    }
  }

  function handleContinueFromName() {
    if (attendeeName.trim().length > 0) {
      if (isFree) {
        // Free tickets bypass payment (AC-F5-11)
        executeBooking();
      } else {
        setStep("pay");
      }
    }
  }

  async function executeBooking() {
    setIsLoading(true);
    setErrorMessage(null);

    const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          eventId: event.id,
          attendeeName,
          items: items.map((i) => ({ tierId: i.tierId, quantity: i.quantity })),
          simulate: simulateFail ? "fail" : "success",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to complete booking");
      }

      setStep("success");
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during booking.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      data-testid="booking-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg bg-[var(--surface-raised)] border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div>
            <span className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider block">
              Ticket Booking
            </span>
            <h2 className="text-lg font-bold text-[var(--text)]">{event.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 text-xs bg-[var(--danger)]/10 text-[var(--danger)] rounded-lg border border-[var(--danger)]/20 flex items-center justify-between gap-2">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="font-semibold underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Step 1: Choose tickets */}
        {step === "tickets" && (
          <div className="space-y-4">
            <div className="space-y-3">
              {event.tiers.map((tier) => {
                const remaining = Math.max(0, tier.capacity - tier.sold);
                const currentQty = quantities[tier.id] || 0;
                const maxAllowed = Math.min(tier.maxPerOrder, remaining);

                return (
                  <div
                    key={tier.id}
                    className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <span className="text-sm font-semibold text-[var(--text)] block">{tier.name}</span>
                      <span className="text-xs text-[var(--text-muted)] block">
                        {tier.pricePaise === 0 ? "Free" : `₹${(tier.pricePaise / 100).toLocaleString("en-IN")}`} •{" "}
                        {remaining <= 20 ? `${remaining} left` : "Available"}
                      </span>
                    </div>

                    <Stepper
                      value={currentQty}
                      min={0}
                      max={maxAllowed}
                      onChange={(val) => handleQuantityChange(tier.id, val)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-xs text-[var(--text-faint)] block">Total Amount</span>
                <span className="text-lg font-bold font-mono text-[var(--text)]">{formattedRupees}</span>
              </div>
              <Button
                variant="primary"
                size="md"
                disabled={totalQuantity === 0 || totalQuantity > 10}
                onClick={handleContinueFromTickets}
              >
                Continue ({totalQuantity})
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Attendee Name */}
        {step === "name" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider block">
                Primary Attendee Full Name
              </label>
              <Input
                type="text"
                maxLength={60}
                placeholder="e.g. Rahul Sharma"
                value={attendeeName}
                onChange={(e) => setAttendeeName(e.target.value)}
                autoFocus
              />
              <span className="text-[11px] text-[var(--text-faint)] block">
                This name will be displayed on all {totalQuantity} tickets and at the check-in gate.
              </span>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep("tickets")}>
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={attendeeName.trim().length === 0}
                onClick={handleContinueFromName}
              >
                {isFree ? "Confirm Booking" : "Proceed to Payment"}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Demo Payment */}
        {step === "pay" && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <CreditCard className="w-4 h-4 text-[var(--accent)]" />
                <span>Simulated Demo Payment</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Demo payment. No money is taken. Razorpay/Stripe are omitted in accordance with the PRD zero-cost rule.
              </p>
              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-faint)]">Total Payable</span>
                <span className="font-bold text-base font-mono text-[var(--text)]">{formattedRupees}</span>
              </div>
            </div>

            {/* Simulate failure toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
                <span>Simulate payment failure</span>
              </div>
              <input
                type="checkbox"
                checked={simulateFail}
                onChange={(e) => setSimulateFail(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--accent)] focus:ring-[var(--accent)]"
              />
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep("name")}>
                Back
              </Button>
              <Button variant="primary" size="lg" isLoading={isLoading} onClick={executeBooking}>
                Pay {formattedRupees}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success confirmation */}
        {step === "success" && (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-[var(--success)]/10 text-[var(--success)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-[var(--text)]">Booking Confirmed!</h3>
              <p className="text-xs text-[var(--text-muted)]">
                {totalQuantity} tickets have been added to your digital wallet.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  router.push("/wallet");
                }}
              >
                View Tickets in Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
