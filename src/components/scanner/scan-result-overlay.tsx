import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, XCircle, Ban } from "lucide-react";
import { clsx } from "clsx";

export interface ScanResultOverlayProps {
  result: "ADMITTED" | "ALREADY_USED" | "WRONG_EVENT" | "INVALID" | "TICKET_CANCELLED";
  attendeeName?: string;
  tierName?: string;
  usedAt?: string;
  wrongEventTitle?: string;
  onDismiss?: () => void;
}

export function ScanResultOverlay({
  result,
  attendeeName,
  tierName,
  usedAt,
  wrongEventTitle,
  onDismiss,
}: ScanResultOverlayProps) {
  const configs = {
    ADMITTED: {
      bg: "bg-[var(--success)] text-white",
      icon: CheckCircle2,
      title: "ADMITTED",
      subtitle: `${attendeeName || "Attendee"} • ${tierName || "General"}`,
    },
    ALREADY_USED: {
      bg: "bg-[var(--danger)] text-white",
      icon: AlertCircle,
      title: "ALREADY USED",
      subtitle: usedAt ? `First admitted at ${new Date(usedAt).toLocaleTimeString()}` : "Ticket was already scanned",
    },
    WRONG_EVENT: {
      bg: "bg-[var(--warning)] text-neutral-900",
      icon: AlertTriangle,
      title: "WRONG EVENT",
      subtitle: wrongEventTitle ? `Valid for: ${wrongEventTitle}` : "Ticket belongs to a different event",
    },
    INVALID: {
      bg: "bg-[var(--danger)] text-white",
      icon: XCircle,
      title: "INVALID CODE",
      subtitle: "Unrecognized ticket code or bad signature",
    },
    TICKET_CANCELLED: {
      bg: "bg-[var(--danger)] text-white",
      icon: Ban,
      title: "TICKET CANCELLED",
      subtitle: "This ticket has been cancelled and cannot be admitted",
    },
  };

  const config = configs[result];
  const Icon = config.icon;

  return (
    <div
      data-testid="scan-result-overlay"
      role="dialog"
      aria-label="Scan Result"
      onClick={onDismiss}
      className={clsx(
        "fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-150 select-none",
        config.bg
      )}
    >
      <Icon className="w-24 h-24 mb-4 stroke-[2.5]" />
      <h2 className="text-3xl font-black tracking-tight uppercase mb-2">{config.title}</h2>
      <p className="text-base font-medium opacity-90 max-w-sm">{config.subtitle}</p>
      {onDismiss && (
        <span className="mt-8 text-xs opacity-75 underline">Tap anywhere to dismiss</span>
      )}
    </div>
  );
}
