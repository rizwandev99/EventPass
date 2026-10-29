import React from "react";
import Link from "next/link";
import { prisma } from "@/server/db";
import { QrCode, ArrowRight, ShieldCheck, Sparkles, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ScanIndexPage() {
  let events: any[] = [];
  try {
    events = await prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        endsAt: { gte: new Date() },
      },
      include: {
        tiers: true,
      },
      orderBy: { startsAt: "asc" },
      take: 10,
    });
  } catch (e) {
    events = [];
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--accent)]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demo Staff Mode • No Login Required</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
          Gate Scanner
        </h1>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          Select an active event to initiate gate admission. Features camera QR scanning, manual code entry, offline pack caching, and background sync.
        </p>
      </div>

      {/* Demo Tip Banner */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
        <div className="text-xs text-[var(--text-muted)] space-y-1">
          <strong className="text-[var(--text)] block font-semibold">2-Minute Demo Flow</strong>
          <span>Book a ticket on another browser tab or device, then select the event below and scan or paste the code. Watch the attendee wallet mark "Used" in real time.</span>
        </div>
      </div>

      {/* Event Selection List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-faint)]">
          Active Events
        </h2>

        {events.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-muted)]">
            No active events ready for scanning. Visit Discover to seed or browse events.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const totalSold = event.tiers.reduce((acc: number, t: any) => acc + t.sold, 0);
              const totalCap = event.tiers.reduce((acc: number, t: any) => acc + t.capacity, 0);

              return (
                <Link
                  key={event.id}
                  href={`/scan/${event.id}`}
                  className="group block p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)] transition-all"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[var(--surface-raised)] text-[var(--accent)] border border-[var(--border)]">
                          {event.category}
                        </span>
                        <span className="text-xs text-[var(--text-faint)]">
                          {totalSold} / {totalCap} tickets issued
                        </span>
                      </div>

                      <h3 className="font-semibold text-base text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                        {event.title}
                      </h3>

                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                          {event.venueName}, {event.city}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                          {new Date(event.startsAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Button variant="secondary" size="sm" className="group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
                        <span>Launch Scanner</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
