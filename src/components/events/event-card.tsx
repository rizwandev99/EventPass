import React from "react";
import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatEventPriceAndBadge, TierSummary } from "../../../tests/unit/f3-event-formatting.test";
import { generateEventCover } from "@/lib/domain/event-cover";

export interface EventCardProps {
  event: {
    id: string;
    slug: string;
    title: string;
    category: string;
    city: string;
    venueName: string;
    startsAt: string;
    status: "PUBLISHED" | "CANCELLED";
    coverSeed: string;
    tiers: TierSummary[];
  };
}

export function EventCard({ event }: EventCardProps) {
  const { priceText, badge } = formatEventPriceAndBadge(event.tiers);
  const cover = generateEventCover(event.coverSeed, event.category);

  const startDate = new Date(event.startsAt);
  const formattedDate = startDate.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group block rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] transition-all overflow-hidden flex flex-col h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      {/* Cover Artwork */}
      <div
        className="h-36 w-full relative p-3 flex flex-col justify-between"
        style={{
          background: cover.gradient,
          backgroundImage: `${cover.patternSvg}, ${cover.gradient}`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-sm border border-white/10">
            {event.category}
          </span>
          {event.status === "CANCELLED" ? (
            <Badge variant="danger">Cancelled</Badge>
          ) : badge ? (
            <Badge variant={badge === "Sold out" ? "muted" : "warning"}>{badge}</Badge>
          ) : null}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs text-[var(--accent)] font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>

          <h3 className="font-semibold text-base text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {event.title}
          </h3>

          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[var(--text-faint)]" />
            <span className="truncate">
              {event.venueName}, {event.city}
            </span>
          </div>
        </div>

        {/* Footer price */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
          <span className="text-[var(--text-faint)]">Price</span>
          <span className="font-semibold text-sm text-[var(--text)]">{priceText}</span>
        </div>
      </div>
    </Link>
  );
}
