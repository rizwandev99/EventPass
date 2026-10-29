"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingModal } from "./booking-modal";

export interface BookingButtonProps {
  event: any;
  disabled?: boolean;
  label?: string;
}

export function BookingButton({ event, disabled = false, label = "Get tickets" }: BookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOfflineNotice, setIsOfflineNotice] = useState(false);

  function handleClick() {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOfflineNotice(true);
      return;
    }
    setIsOfflineNotice(false);
    setIsOpen(true);
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        variant="primary"
        size="lg"
        disabled={disabled}
        onClick={handleClick}
      >
        {label}
      </Button>

      {isOfflineNotice && (
        <span role="alert" className="text-xs text-[var(--warning)] font-medium">
          You're offline. Booking requires an active connection.
        </span>
      )}

      <BookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        event={event}
      />
    </div>
  );
}
