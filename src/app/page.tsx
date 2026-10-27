"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, RotateCcw } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { clsx } from "clsx";

function DiscoverPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams?.get("q") || "";
  const currentCategory = searchParams?.get("category") || "";
  const currentCity = searchParams?.get("city") || "";
  const currentDate = searchParams?.get("date") || "any";
  const currentMaxPrice = searchParams?.get("maxPrice") || "";

  const [searchQuery, setSearchQuery] = useState(currentQ);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const categories = ["ALL", "MUSIC", "TECH", "SPORTS", "COMEDY", "FOOD", "ART"];
  const cities = ["All Cities", "Bengaluru", "Mumbai", "Delhi", "Pune", "Hyderabad", "Noida", "Gurugram"];

  // Debounce search update (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams?.toString() || "");
      if (searchQuery) {
        params.set("q", searchQuery);
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.replace(`/?${params.toString()}`);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, router]);

  // Load events
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        const queryStr = searchParams?.toString() || "";
        const res = await fetch(`/api/events?${queryStr}`);
        if (!res.ok) {
          throw new Error("Failed to load events");
        }
        const data = await res.json();
        setEvents(data.items || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [searchParams]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (!value || value === "ALL" || value === "All Cities" || value === "any") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`/?${params.toString()}`);
  }

  function clearAllFilters() {
    setSearchQuery("");
    router.replace("/");
  }

  const hasActiveFilters = Boolean(currentQ || currentCategory || currentCity || (currentDate && currentDate !== "any") || currentMaxPrice);

  return (
    <div className="space-y-6">
      {/* Search Bar & Primary Filter Controls */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events, venues, cities..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] min-h-[44px] transition-all"
          />
        </div>

        {/* Category Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = (!currentCategory && cat === "ALL") || currentCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => updateFilter("category", cat === "ALL" ? "" : cat)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px]",
                  isSelected
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]"
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* City and Date filters */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[var(--text-muted)] pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={currentCity || "All Cities"}
              onChange={(e) => updateFilter("city", e.target.value)}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--text)] focus:ring-1 focus:ring-[var(--accent)] min-h-[36px]"
              aria-label="Filter by city"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={currentDate}
              onChange={(e) => updateFilter("date", e.target.value)}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-xs text-[var(--text)] focus:ring-1 focus:ring-[var(--accent)] min-h-[36px]"
              aria-label="Filter by date range"
            >
              <option value="any">Any Date</option>
              <option value="today">Today</option>
              <option value="this_weekend">This Weekend</option>
              <option value="next_7_days">Next 7 Days</option>
              <option value="next_30_days">Next 30 Days</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline min-h-[36px] px-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {error ? (
        <ErrorState message={error} onRetry={() => router.refresh()} />
      ) : loading ? (
        <div data-testid="event-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] p-4 space-y-3 bg-[var(--surface)]">
              <Skeleton className="h-36 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          title="No events found"
          description="We couldn't find any events matching your current search or filter criteria."
          actionLabel="Clear filters"
          onAction={clearAllFilters}
        />
      ) : (
        <div data-testid="event-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-10 w-full max-w-md bg-[var(--surface-raised)] rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[var(--border)] p-4 space-y-3 bg-[var(--surface)]">
                <Skeleton className="h-36 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <DiscoverPageContent />
    </Suspense>
  );
}
