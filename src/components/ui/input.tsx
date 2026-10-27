import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={twMerge(
          clsx(
            "w-full rounded-md border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-faint)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:border-transparent transition-colors min-h-[44px]",
            error && "border-[var(--danger)] focus-visible:ring-[var(--danger)]",
            className
          )
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
