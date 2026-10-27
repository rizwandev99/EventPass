"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export interface OfflineBannerProps {
  isOffline?: boolean;
}

export function OfflineBanner({ isOffline: manualOffline }: OfflineBannerProps) {
  const [offline, setOffline] = useState(false);
  const [showBackOnlineToast, setShowBackOnlineToast] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setOffline(false);
      setShowBackOnlineToast(true);
      setTimeout(() => setShowBackOnlineToast(false), 3000);
    }

    function handleOffline() {
      setOffline(true);
    }

    if (typeof window !== "undefined") {
      setOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, []);

  const isCurrentOffline = manualOffline !== undefined ? manualOffline : offline;

  return (
    <>
      {isCurrentOffline && (
        <div
          role="status"
          className="bg-[var(--warning)] text-neutral-900 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <WifiOff className="w-3.5 h-3.5" />
          <span>You're offline. Changes will sync automatically when reconnected.</span>
        </div>
      )}

      {showBackOnlineToast && (
        <div
          role="status"
          className="fixed bottom-20 sm:bottom-6 right-4 z-50 bg-[var(--success)] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg animate-in slide-in-from-bottom duration-200"
        >
          <Wifi className="w-4 h-4" />
          <span>Back online. Syncing data...</span>
        </div>
      )}
    </>
  );
}
