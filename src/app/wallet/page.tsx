"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, Ticket as TicketIcon, Calendar, MapPin, QrCode, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { QrCodeCard } from "@/components/wallet/qr-code-card";
import { groupWalletTickets, WalletTicketItem } from "@/lib/domain/wallet";
import {
  saveOfflineTickets,
  getOfflineTickets,
  getOfflineLastUpdated,
} from "@/lib/offline/wallet-storage";

export default function WalletPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<WalletTicketItem[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  async function fetchTickets() {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        const freshTickets = data.tickets || [];
        if (freshTickets.length > 0) {
          setTickets(freshTickets);
          setLastUpdated(null);
          await saveOfflineTickets(freshTickets);
        } else {
          // If server returned 0 tickets (e.g. fresh guest session or server restart), check offline storage
          const cached = await getOfflineTickets();
          if (cached && cached.length > 0) {
            setTickets(cached);
            const updated = await getOfflineLastUpdated();
            setLastUpdated(updated || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          } else {
            setTickets([]);
            setLastUpdated(null);
          }
        }
      } else {
        const cached = await getOfflineTickets();
        if (cached && cached.length > 0) {
          setTickets(cached);
          const updated = await getOfflineLastUpdated();
          setLastUpdated(updated || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      }
    } catch (e) {
      // offline fallback or network sleep
      const cached = await getOfflineTickets();
      if (cached && cached.length > 0) {
        setTickets(cached);
        const updated = await getOfflineLastUpdated();
        setLastUpdated(updated || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();

    // 10-second polling for real-time status update to "Used" (AC-F6-5)
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchTickets();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const grouped = groupWalletTickets(tickets);
  const currentList = grouped[activeTab];

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
            Digital Wallet
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Access your admission passes and gate scan QR codes
          </p>
          {lastUpdated && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--accent)] bg-[var(--surface-raised)] border border-[var(--border)] px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              <span>Last updated: {lastUpdated} (offline cache)</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        data-testid="wallet-tabs"
        className="flex items-center gap-2 p-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs font-medium"
      >
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-2 rounded-lg transition-colors min-h-[36px] ${
            activeTab === "upcoming"
              ? "bg-[var(--surface-raised)] text-[var(--text)] shadow-sm font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          Upcoming ({grouped.upcoming.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-2 rounded-lg transition-colors min-h-[36px] ${
            activeTab === "past"
              ? "bg-[var(--surface-raised)] text-[var(--text)] shadow-sm font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          Past ({grouped.past.length})
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`flex-1 py-2 rounded-lg transition-colors min-h-[36px] ${
            activeTab === "cancelled"
              ? "bg-[var(--surface-raised)] text-[var(--text)] shadow-sm font-semibold"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          Cancelled ({grouped.cancelled.length})
        </button>
      </div>

      {/* Ticket List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="You haven't booked any event tickets on this device yet. Explore upcoming events to get started."
          actionLabel="Discover Events"
          onAction={() => router.push("/")}
        />
      ) : currentList.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-muted)]">
          No {activeTab} tickets found.
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((ticket: any) => {
            const isUsed = ticket.status === "USED";
            const isCancelled = ticket.status === "CANCELLED";

            return (
              <div
                key={ticket.id}
                className="p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] hover:border-[var(--border-strong)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--accent)]">
                      {ticket.event?.category || "EVENT"}
                    </span>
                    <Badge variant={isCancelled ? "danger" : isUsed ? "muted" : "success"}>
                      {ticket.status}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-base text-[var(--text)]">
                    {ticket.event?.title || "Event Ticket"}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {ticket.event?.startsAt
                        ? new Date(ticket.event.startsAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Upcoming"}
                    </span>
                    <span>•</span>
                    <span>Attendee: {ticket.attendeeName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedTicket(ticket)}
                    className="gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View QR Pass</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Pass Modal */}
      {selectedTicket && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm space-y-4">
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(null)}>
                Close
              </Button>
            </div>
            <QrCodeCard
              code={selectedTicket.code}
              attendeeName={selectedTicket.attendeeName}
              tierName={selectedTicket.tierId || "General"}
              status={selectedTicket.status}
              usedAt={selectedTicket.usedAt}
            />
          </div>
        </div>
      )}
    </div>
  );
}
