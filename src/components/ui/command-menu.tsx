"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, X, Calendar, MapPin, Loader2, Compass, Wallet, QrCode, Sparkles, Info, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";

export interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent?: (slug: string) => void;
  onResetAndSeed?: () => void;
}

interface EventSearchResult {
  id: string;
  slug: string;
  title: string;
  category: string;
  city: string;
  venueName: string;
  startsAt: string;
  status: "PUBLISHED" | "CANCELLED";
}

interface NavItem {
  id: string;
  label: string;
  href: string;
  shortcut: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAVIGATION_ITEMS: NavItem[] = [
  { id: "nav-discover", label: "Discover Events", href: "/", shortcut: "G D", icon: Compass },
  { id: "nav-wallet", label: "Digital Wallet", href: "/wallet", shortcut: "G W", icon: Wallet },
  { id: "nav-scan", label: "Gate Scanner", href: "/scan", shortcut: "G S", icon: QrCode },
  { id: "nav-assistant", label: "AI Assistant", href: "/assistant", shortcut: "G A", icon: Sparkles },
  { id: "nav-about", label: "About Demo", href: "/about", shortcut: "G ?", icon: Info },
  { id: "nav-reset", label: "Reset & Seed Demo Data", href: "#reset", shortcut: "G R", icon: RotateCcw },
];

export function CommandMenu({ isOpen, onClose, onSelectEvent, onResetAndSeed }: CommandMenuProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<EventSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter navigation items
  const normalizedQuery = query.trim().toLowerCase();
  const filteredNav = NAVIGATION_ITEMS.filter((item) => {
    if (!normalizedQuery) return true;
    return (
      item.label.toLowerCase().includes(normalizedQuery) ||
      item.href.toLowerCase().includes(normalizedQuery)
    );
  });

  // Calculate flat items for keyboard arrow navigation
  const flatItems: Array<
    | { type: "nav"; item: NavItem }
    | { type: "event"; item: EventSearchResult }
  > = [
    ...filteredNav.map((item) => ({ type: "nav" as const, item })),
    ...events.map((item) => ({ type: "event" as const, item })),
  ];

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setEvents([]);
      setIsSearching(false);
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keep selected index within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, events.length]);

  // Search events via /api/events?q=...
  useEffect(() => {
    if (!normalizedQuery) {
      setEvents([]);
      setIsSearching(false);
      return;
    }

    const abortController = new AbortController();
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/events?q=${encodeURIComponent(normalizedQuery)}&limit=6`, {
          signal: abortController.signal,
        });
        if (!res.ok) {
          throw new Error("Failed to search events");
        }
        const data = await res.json();
        setEvents(data.items || []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setEvents([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 180);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [normalizedQuery]);

  // Global keyboard shortcuts (Ctrl+K / Cmd+K, Escape)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (isOpen && e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function navigateTo(path: string) {
    onClose();
    if (path === "#reset") {
      onResetAndSeed?.();
      return;
    }
    router.push(path);
  }

  function handleSelectEvent(slug: string) {
    onClose();
    if (onSelectEvent) {
      onSelectEvent(slug);
    } else {
      router.push(`/events/${slug}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flatItems.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flatItems.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = flatItems[selectedIndex];
      if (current) {
        if (current.type === "nav") {
          navigateTo(current.item.href);
        } else {
          handleSelectEvent(current.item.slug);
        }
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[var(--border)] gap-2">
          <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search events..."
            className="w-full bg-transparent text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none text-sm min-h-[44px]"
            aria-label="Search events and pages"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close command menu"
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            <kbd className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-[var(--border)] text-[var(--text-faint)] bg-[var(--surface)] mr-1">
              ESC
            </kbd>
            <X className="w-4 h-4 sm:hidden" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-3 text-sm">
          {/* Searching loader */}
          {isSearching && (
            <div className="px-3 py-2 text-xs text-[var(--text-muted)] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent)]" />
              <span>Searching events for &ldquo;{query}&rdquo;...</span>
            </div>
          )}

          {/* Navigation Section */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-[var(--text-faint)] uppercase tracking-wider">
                Navigation
              </div>
              <div className="space-y-0.5">
                {filteredNav.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={clsx(
                        "w-full text-left px-3 py-2 rounded-lg flex items-center justify-between min-h-[44px] transition-colors",
                        isSelected
                          ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={clsx("w-4 h-4", isSelected ? "text-[var(--accent)]" : "text-[var(--text-faint)]")} />
                        <span className="font-medium text-sm text-[var(--text)]">{item.label}</span>
                      </div>
                      <kbd className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-faint)]">
                        {item.shortcut}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Events Section */}
          {events.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-[var(--text-faint)] uppercase tracking-wider">
                Events
              </div>
              <div className="space-y-0.5">
                {events.map((event, idx) => {
                  const globalIdx = filteredNav.length + idx;
                  const isSelected = selectedIndex === globalIdx;
                  const eventDate = new Date(event.startsAt);
                  const formattedDate = isNaN(eventDate.getTime())
                    ? ""
                    : eventDate.toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      });

                  return (
                    <button
                      key={event.id}
                      onClick={() => handleSelectEvent(event.slug)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={clsx(
                        "w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between min-h-[44px] transition-colors gap-3",
                        isSelected
                          ? "bg-[var(--surface)] text-[var(--text)] shadow-sm border border-[var(--border)]"
                          : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-[var(--text)] truncate">
                            {event.title}
                          </span>
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-muted)] shrink-0">
                            {event.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-faint)] mt-0.5">
                          {event.city && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              {event.city}
                              {event.venueName ? ` • ${event.venueName}` : ""}
                            </span>
                          )}
                          {formattedDate && (
                            <span className="flex items-center gap-1 shrink-0">
                              <Calendar className="w-3 h-3" />
                              {formattedDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-[var(--accent)] font-medium shrink-0">
                        View &rarr;
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isSearching && normalizedQuery && filteredNav.length === 0 && events.length === 0 && (
            <div className="py-8 px-4 text-center">
              <p className="text-sm font-medium text-[var(--text)]">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-[var(--text-faint)] mt-1">
                Try searching for a different city, category, or event title.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface)]/50 text-[11px] text-[var(--text-faint)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-[var(--surface-raised)] px-1 py-0.5 rounded border border-[var(--border)]">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-[var(--surface-raised)] px-1 py-0.5 rounded border border-[var(--border)]">↵</kbd> Select</span>
            <span><kbd className="font-mono bg-[var(--surface-raised)] px-1 py-0.5 rounded border border-[var(--border)]">esc</kbd> Close</span>
          </div>
          <span className="hidden sm:inline text-[10px] text-[var(--text-muted)]">
            EventPass Command Center
          </span>
        </div>
      </div>
    </div>
  );
}
