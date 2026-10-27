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

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
      >
        {label}
      </Button>

      <BookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        event={event}
      />
    </>
  );
}
