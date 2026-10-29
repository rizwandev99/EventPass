import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { Calendar, MapPin, ExternalLink, Ticket, Ban, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingButton } from "@/components/booking/booking-button";
import { ShareButton } from "@/components/events/share-button";
import { generateEventCover } from "@/lib/domain/event-cover";
import { getTierRemainingLabel, generateMapsUrl, buildEventMetadata } from "@/lib/domain/events";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event) return { title: "Event Not Found — EventPass" };
    return buildEventMetadata(event);
  } catch (e) {
    return { title: "Event Details — EventPass" };
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let event: any = null;
  try {
    event = await prisma.event.findUnique({
      where: { slug },
      include: {
        tiers: {
          orderBy: { pricePaise: "asc" },
        },
      },
    });
  } catch (e) {
    event = null;
  }

  if (!event) {
    notFound();
  }

  const cover = generateEventCover(event.coverSeed, event.category);
  const now = new Date();
  const startsAt = new Date(event.startsAt);
  const endsAt = new Date(event.endsAt);

  const isCancelled = event.status === "CANCELLED";
  const hasEnded = endsAt < now;
  const totalRemaining = event.tiers.reduce(
    (acc: number, t: any) => acc + Math.max(0, t.capacity - t.sold),
    0
  );
  const isSoldOut = totalRemaining === 0;

  const formattedDateTime = startsAt.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const mapsUrl = generateMapsUrl(event.venueName, event.city);
  const shareUrl = `https://eventpass.demo/events/${event.slug}`;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-2">
      {/* Cover Hero */}
      <div
        className="h-56 sm:h-72 w-full rounded-2xl relative p-6 flex flex-col justify-between overflow-hidden shadow-sm border border-[var(--border)]"
        style={{
          background: cover.gradient,
          backgroundImage: `${cover.patternSvg}, ${cover.gradient}`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded bg-black/40 text-white backdrop-blur-sm border border-white/10">
            {event.category}
          </span>
          <ShareButton title={event.title} url={shareUrl} />
        </div>
      </div>

      {/* Status Warning Banners */}
      {isCancelled ? (
        <div className="p-4 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] flex items-center gap-3">
          <Ban className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <strong className="block font-semibold">This event has been cancelled</strong>
            <span>Ticket booking is unavailable for this event.</span>
          </div>
        </div>
      ) : hasEnded ? (
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] flex items-center gap-3">
          <Clock className="w-5 h-5 shrink-0" />
          <div className="text-sm">
            <strong className="block font-semibold text-[var(--text)]">This event has ended</strong>
            <span>Sales for this event are closed.</span>
          </div>
        </div>
      ) : null}

      {/* Main Content */}
      <div className="space-y-6">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
            {event.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-[var(--text-muted)] pt-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent)]" />
              <span>{formattedDateTime}</span>
            </div>
            <span className="hidden sm:inline text-[var(--border-strong)]">•</span>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--accent)]" />
              <span>
                {event.venueName}, {event.city}
              </span>
            </div>
          </div>

          <div className="pt-1">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline font-medium min-h-[36px]"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text)]">About this event</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {/* Ticket Tiers */}
        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text)] flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[var(--accent)]" />
            <span>Ticket Tiers</span>
          </h2>

          <div className="space-y-3">
            {event.tiers.map((tier: any) => {
              const remaining = Math.max(0, tier.capacity - tier.sold);
              const label = getTierRemainingLabel(remaining);
              const isFree = tier.pricePaise === 0;
              const formattedPrice = isFree
                ? "Free"
                : `₹${(tier.pricePaise / 100).toLocaleString("en-IN")}`;

              return (
                <div
                  key={tier.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--text)]">{tier.name}</span>
                      <Badge variant={remaining === 0 ? "muted" : remaining <= 20 ? "warning" : "default"}>
                        {label}
                      </Badge>
                    </div>
                    {tier.description && (
                      <p className="text-xs text-[var(--text-muted)]">{tier.description}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-base font-semibold font-mono text-[var(--text)]">
                      {formattedPrice}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking CTA Bar */}
        <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-xs text-[var(--text-faint)] block">Total Remaining</span>
            <span className="text-sm font-semibold text-[var(--text)]">
              {isSoldOut ? "Sold Out" : `${totalRemaining} tickets available`}
            </span>
          </div>

          <div>
            {isCancelled || hasEnded ? (
              <Button disabled variant="secondary" size="lg">
                Booking Closed
              </Button>
            ) : isSoldOut ? (
              <Button disabled variant="secondary" size="lg">
                Sold Out
              </Button>
            ) : (
              <BookingButton event={event} label="Get tickets" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
