"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export interface QrCodeCardProps {
  code: string;
  attendeeName: string;
  tierName: string;
  status: "VALID" | "USED" | "CANCELLED";
  usedAt?: string;
}

export function QrCodeCard({ code, attendeeName, tierName, status, usedAt }: QrCodeCardProps) {
  const [qrSvg, setQrSvg] = useState<string>("");

  useEffect(() => {
    // Generate clean SVG QR code
    QRCode.toString(code, { type: "svg", margin: 1 }, (err, svg) => {
      if (!err && svg) {
        setQrSvg(svg);
      }
    });

    // Screen Wake Lock API (AC-F6-6)
    let isMounted = true;
    let wakeLockSentinel: any = null;

    async function requestWakeLock() {
      if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
        try {
          const s = await (navigator as any).wakeLock.request("screen");
          if (isMounted) {
            wakeLockSentinel = s;
          } else {
            s?.release?.().catch(() => {});
          }
        } catch (e) {
          // Unsupported or denied
        }
      }
    }
    requestWakeLock();

    return () => {
      isMounted = false;
      if (wakeLockSentinel && typeof wakeLockSentinel.release === "function") {
        try {
          Promise.resolve(wakeLockSentinel.release()).catch(() => {});
        } catch (e) {}
      }
    };
  }, [code]);

  const isUsed = status === "USED";
  const isCancelled = status === "CANCELLED";

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] shadow-md overflow-hidden max-w-sm mx-auto transition-all">
      {/* Top Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <span className="text-xs text-[var(--text-faint)] uppercase tracking-wider block">Attendee</span>
          <span className="font-semibold text-sm text-[var(--text)]">{attendeeName}</span>
        </div>
        <div className="text-right">
          <span className="text-xs text-[var(--text-faint)] uppercase tracking-wider block">Tier</span>
          <span className="font-medium text-xs text-[var(--text)]">{tierName}</span>
        </div>
      </div>

      {/* Optical QR Tile Container - STRICTLY WHITE WITH QUIET MARGIN (AC-F6-8) */}
      <div className="p-6 flex flex-col items-center justify-center bg-[var(--surface)]">
        <div
          data-testid="qr-white-tile"
          className="bg-white p-4 rounded-xl shadow-inner border border-neutral-200 flex flex-col items-center justify-center relative w-56 h-56"
        >
          {qrSvg ? (
            <div
              className={`w-full h-full text-black flex items-center justify-center ${
                isUsed ? "opacity-30 grayscale" : ""
              }`}
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : (
            <div className="text-xs text-neutral-400">Loading QR...</div>
          )}

          {isUsed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="px-3 py-1 bg-neutral-900 text-white text-xs font-bold uppercase rounded-md tracking-wider shadow">
                Used
              </span>
            </div>
          )}
        </div>

        {/* Monospace Code text below QR */}
        <div className="mt-4 text-center space-y-1">
          <p className="font-mono text-xs text-[var(--text-muted)] select-all tracking-wider">
            {code}
          </p>
          <span className="text-[10px] text-[var(--text-faint)] block">
            Scan at gate or enter code manually
          </span>
        </div>
      </div>

      {/* Bottom Status Footer */}
      <div className="p-3.5 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[var(--text-faint)]">
          <Shield className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Signed HMAC-SHA256</span>
        </div>
        <Badge
          variant={
            isCancelled ? "danger" : isUsed ? "muted" : "success"
          }
        >
          {isCancelled ? "Cancelled" : isUsed ? (usedAt ? `Used at ${new Date(usedAt).toLocaleTimeString()}` : "Used") : "Valid"}
        </Badge>
      </div>
    </div>
  );
}
