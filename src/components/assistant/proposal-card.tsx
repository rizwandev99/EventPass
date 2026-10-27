import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProposalCardProps {
  eventTitle: string;
  tierName: string;
  quantity: number;
  total: string;
  onConfirm: () => void;
}

export function ProposalCard({
  eventTitle,
  tierName,
  quantity,
  total,
  onConfirm,
}: ProposalCardProps) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-[var(--accent)]/30 bg-[var(--surface-raised)] shadow-md space-y-4 my-2 max-w-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)]">
        <Sparkles className="w-4 h-4" />
        <span>Booking Proposal</span>
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-base text-[var(--text)]">{eventTitle}</h4>
        <p className="text-xs text-[var(--text-muted)]">
          {quantity} × {tierName} Pass
        </p>
      </div>

      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
        <span className="font-semibold text-sm text-[var(--text)]">Total: {total}</span>
        <Button variant="primary" size="sm" onClick={onConfirm} className="gap-1.5">
          <span>Confirm Booking</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
