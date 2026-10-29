"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, ExternalLink, Zap, Smartphone, Sparkles } from "lucide-react";
import { clearAllOfflineData } from "@/lib/offline/wallet-storage";

export default function AboutPage() {
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  async function handleResetIdentity() {
    try {
      await fetch("/api/reset", { method: "POST" });
    } catch {
      // Ignore network errors in test environments
    }

    // Clear cookies
    document.cookie = "eventpass_guest=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // Clear local storage & session storage & IndexedDB
    try {
      await clearAllOfflineData();
      localStorage.removeItem("eventpass-theme");
      sessionStorage.clear();

      if (window.indexedDB) {
        const dbs = ["eventpass_offline", "keyval-store", "eventpass-offline-storage"];
        for (const dbName of dbs) {
          window.indexedDB.deleteDatabase(dbName);
        }
      }
    } catch {
      // Ignore in non-browser env
    }

    setResetMessage("Demo identity reset. Database seeded, cookies, local storage, and IndexedDB caches cleared.");
    setTimeout(() => {
      window.location.href = "/";
    }, 1200);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-soft)] text-[var(--accent)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Showcase Portfolio Project</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text)]">About This Demo</h1>
        <p className="text-[var(--text-muted)] text-base leading-relaxed">
          EventPass is a mobile-first event ticketing application built to demonstrate senior-grade craftsmanship,
          rigorous test-driven development (TDD), offline-first synchronization, and an AI event assistant.
        </p>
      </div>

      {/* The 2-minute demo steps */}
      <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--surface)] space-y-4">
        <h2 className="text-xl font-semibold text-[var(--text)] flex items-center gap-2">
          <Zap className="w-5 h-5 text-[var(--accent)]" />
          <span>The 2-minute demo</span>
        </h2>
        <ol className="space-y-3 text-sm text-[var(--text-muted)] list-decimal list-inside leading-relaxed">
          <li>
            <strong className="text-[var(--text)]">Explore Events:</strong> Browse upcoming events on the Discover page
            with live debounce filtering and search.
          </li>
          <li>
            <strong className="text-[var(--text)]">Book Tickets:</strong> Select an event, choose 2 tickets, and complete
            the instant simulated payment.
          </li>
          <li>
            <strong className="text-[var(--text)]">Digital Wallet:</strong> Open the wallet to inspect high-contrast signed
            QR codes with Screen Wake Lock enabled.
          </li>
          <li>
            <strong className="text-[var(--text)]">Gate Scanner:</strong> Open the Scanner tab or scan from a second device.
            Admissions update the wallet status in real time.
          </li>
          <li>
            <strong className="text-[var(--text)]">Offline Simulation:</strong> Disconnect your network, download the offline
            pack, and scan tickets. Scans queue up and sync automatically on reconnection.
          </li>
          <li>
            <strong className="text-[var(--text)]">AI Assistant:</strong> Chat with the Gemini-powered assistant to search
            events or prepare bookings.
          </li>
        </ol>
      </div>

      {/* Tech Stack */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--text)] flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[var(--accent)]" />
          <span>Tech Stack</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]">
            <span className="font-semibold text-[var(--text)] block">Next.js 15 (App Router)</span>
            <span className="text-[var(--text-muted)] text-xs">React 19, Strict TypeScript, Route Handlers</span>
          </div>
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]">
            <span className="font-semibold text-[var(--text)] block">Linear-Grade Design System</span>
            <span className="text-[var(--text-muted)] text-xs">Tailwind CSS, Semantic CSS Tokens, Dark/Light theme</span>
          </div>
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]">
            <span className="font-semibold text-[var(--text)] block">Prisma & Neon Postgres</span>
            <span className="text-[var(--text-muted)] text-xs">Serverless pooled driver, atomic concurrency transactions</span>
          </div>
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]">
            <span className="font-semibold text-[var(--text)] block">HMAC-SHA256 Ticket Signing</span>
            <span className="text-[var(--text-muted)] text-xs">Constant-time verification, cryptographic randomness</span>
          </div>
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]">
            <span className="font-semibold text-[var(--text)] block">Offline PWA & IndexedDB</span>
            <span className="text-[var(--text-muted)] text-xs">Service Worker, client-side validation, idempotent sync</span>
          </div>
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)]">
            <span className="font-semibold text-[var(--text)] block">Vercel AI SDK</span>
            <span className="text-[var(--text-muted)] text-xs">Gemini free tier, streaming tool calling, resilient fallback</span>
          </div>
        </div>
      </div>

      {/* Reset Demo Identity */}
      <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[var(--accent)]" />
              <span>Reset Demo Identity</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-md">
              Clear your guest session cookie, IndexedDB ticket cache, and scanner data on this device to simulate a
              fresh visitor experience.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleResetIdentity}>
            Reset demo identity
          </Button>
        </div>
        {resetMessage && (
          <div className="p-3 text-xs bg-[var(--surface)] text-[var(--success)] rounded-md border border-[var(--border)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{resetMessage}</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-faint)]">
        <span>EventPass — Showcase Project</span>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-[var(--text)] text-[var(--accent)]"
        >
          <span>View Source on GitHub</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
