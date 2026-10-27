import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff } from "lucide-react";

export default function OfflineFallbackPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[var(--warning)]/10 text-[var(--warning)] flex items-center justify-center border border-[var(--border)] shadow-sm">
        <WifiOff className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">You're Offline</h1>
        <p className="text-sm text-[var(--text-muted)]">
          This page hasn't been cached yet. You can still access your saved tickets in your Digital Wallet or view the Gate Scanner offline pack.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/wallet">
          <Button variant="primary" size="md">
            View Offline Wallet
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="md">
            Retry Connection
          </Button>
        </Link>
      </div>
    </div>
  );
}
