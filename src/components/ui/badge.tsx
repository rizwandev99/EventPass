import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "muted" | "accent";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tracking-tight border transition-colors";

  const variantStyles = {
    default: "bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]",
    success: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
    warning: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
    danger: "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20",
    muted: "bg-[var(--surface)] text-[var(--text-faint)] border-[var(--border)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/20",
  };

  return (
    <span className={twMerge(clsx(baseStyles, variantStyles[variant], className))} {...props}>
      {children}
    </span>
  );
}
