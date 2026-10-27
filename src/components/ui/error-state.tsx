import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Failed to load content. Please check your connection and retry.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-[var(--danger)]/20 bg-[var(--danger)]/5 my-6">
      <div className="w-12 h-12 rounded-xl bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
