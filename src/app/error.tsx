"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring if configured
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center border border-[var(--border)]">
        <AlertCircle className="w-7 h-7" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Something went wrong</h1>
        <p className="text-sm text-[var(--text-muted)]">
          An unexpected error occurred while rendering this page. You can try reloading or returning home.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="md" onClick={() => reset()}>
          Try Again
        </Button>
        <Button variant="primary" size="md" onClick={() => (window.location.href = "/")}>
          Go to Discover
        </Button>
      </div>
    </div>
  );
}
