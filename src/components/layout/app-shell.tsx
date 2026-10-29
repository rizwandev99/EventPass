"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Wallet, QrCode, Sparkles, Command, Info, RotateCcw } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandMenu } from "@/components/ui/command-menu";
import { clearAllOfflineData } from "@/lib/offline/wallet-storage";
import { clsx } from "clsx";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  async function handleResetAndSeed() {
    if (isResetting) return;
    setIsResetting(true);
    setIsResetSuccess(false);
    setResetError(null);

    try {
      const res = await fetch("/api/reset", {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to reset database");
      }

      // Clear all offline storage (IndexedDB & localStorage)
      try {
        await clearAllOfflineData();
      } catch (storageErr) {
        console.warn("Storage clear warning:", storageErr);
      }

      setIsResetSuccess(true);
      if (typeof window !== "undefined") {
        setTimeout(() => {
          if (typeof window.location?.reload === "function") {
            window.location.reload();
          }
        }, 500);
      }
    } catch (err: any) {
      console.error("Reset error:", err);
      setIsResetting(false);
      setResetError(err.message || "Reset failed");
      setTimeout(() => setResetError(null), 4000);
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { label: "Discover", href: "/", icon: Compass },
    { label: "Wallet", href: "/wallet", icon: Wallet },
    { label: "Scan", href: "/scan", icon: QrCode },
    { label: "Assistant", href: "/assistant", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col lg:flex-row antialiased">
      {/* Desktop Sidebar (visible on lg: >=1024px) */}
      <aside
        data-testid="desktop-sidebar"
        className="hidden lg:flex flex-col w-64 border-r border-[var(--border)] bg-[var(--bg-subtle)] p-4 shrink-0 h-screen sticky top-0"
      >
        <div className="flex items-center justify-between px-2 py-4 mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              EP
            </div>
            <span className="font-semibold text-lg tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
              EventPass
            </span>
          </Link>
          <span className="text-[10px] font-mono uppercase bg-[var(--accent-soft)] text-[var(--accent)] px-2 py-0.5 rounded-full font-medium">
            Demo
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px]",
                  isActive
                    ? "bg-[var(--surface-raised)] text-[var(--text)] shadow-sm border border-[var(--border)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
                )}
              >
                <Icon className={clsx("w-5 h-5", isActive ? "text-[var(--accent)]" : "text-[var(--text-faint)]")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-[var(--border)] space-y-2">
          <button
            onClick={() => setIsCommandOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--text-muted)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] rounded-md border border-[var(--border)] min-h-[44px]"
          >
            <span className="flex items-center gap-2">
              <Command className="w-3.5 h-3.5" /> Quick search
            </span>
            <kbd className="px-1.5 py-0.5 bg-[var(--bg)] border border-[var(--border)] rounded text-[10px]">Ctrl K</kbd>
          </button>

          <button
            type="button"
            onClick={handleResetAndSeed}
            disabled={isResetting}
            data-testid="reset-seed-button"
            aria-label="Reset and seed demo database"
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] rounded-md border border-[var(--border)] transition-colors min-h-[44px] disabled:opacity-50"
          >
            <span className="flex items-center gap-2 font-medium">
              <RotateCcw className={clsx("w-3.5 h-3.5 text-[var(--accent)]", isResetting && "animate-spin")} />
              <span>
                {isResetting
                  ? "Resetting..."
                  : isResetSuccess
                  ? "Reset & Seeded!"
                  : resetError
                  ? "Reset failed (retry)"
                  : "Reset & Seed"}
              </span>
            </span>
            <span className="text-[10px] text-[var(--text-faint)] font-mono">Demo</span>
          </button>

          <div className="flex items-center justify-between pt-2 px-1">
            <Link
              href="/about"
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] min-h-[44px] px-2"
            >
              <Info className="w-4 h-4" /> About Demo
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Top Header */}
        <header className="h-14 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">
                EP
              </div>
              <span className="font-semibold text-base tracking-tight">EventPass</span>
            </Link>
          </div>

          <div className="hidden lg:block">
            {/* Top breadcrumb or page label */}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCommandOpen(true)}
              aria-label="Search events"
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Command className="w-4 h-4" />
            </button>
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile Bottom Navigation (visible under 1024px) */}
      <nav
        data-testid="mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg)]/95 backdrop-blur border-t border-[var(--border)] safe-area-bottom"
      >
        <div className="grid grid-cols-4 h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]",
                  isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Global Command Menu */}
      <CommandMenu
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onResetAndSeed={handleResetAndSeed}
      />
    </div>
  );
}
