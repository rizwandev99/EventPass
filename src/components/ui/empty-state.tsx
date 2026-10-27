import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./button";

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-[var(--border)] bg-[var(--surface)] my-6">
      <div className="w-12 h-12 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center text-[var(--text-faint)] mb-4">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-[var(--text)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--text-muted)] max-w-sm mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
