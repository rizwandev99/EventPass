"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "./button";

export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function Stepper({ value, min = 0, max = 10, onChange, disabled = false }: StepperProps) {
  function handleDecrement() {
    if (value > min) {
      onChange(value - 1);
    }
  }

  function handleIncrement() {
    if (value < max) {
      onChange(value + 1);
    }
  }

  return (
    <div className="inline-flex items-center gap-2 border border-[var(--border)] rounded-lg p-1 bg-[var(--surface-raised)]">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="w-8 h-8 p-0 min-h-[36px] min-w-[36px] flex items-center justify-center rounded"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="w-8 text-center text-sm font-semibold font-mono text-[var(--text)] select-none">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="w-8 h-8 p-0 min-h-[36px] min-w-[36px] flex items-center justify-center rounded"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
