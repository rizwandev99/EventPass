import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export function Card({ className, elevated = false, children, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-xl border border-[var(--border)] p-4 sm:p-5 transition-all",
          elevated
            ? "bg-[var(--surface-raised)] shadow-sm hover:border-[var(--border-strong)]"
            : "bg-[var(--surface)]",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
