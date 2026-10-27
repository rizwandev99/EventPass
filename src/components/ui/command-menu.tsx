"use client";

import React, { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

export interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent?: (slug: string) => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open menu via external handler or toggle
        }
      }
      if (isOpen && e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function navigateTo(path: string) {
    onClose();
    router.push(path);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[var(--border)] gap-2">
          <Search className="w-5 h-5 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search events..."
            className="w-full bg-transparent text-[var(--text)] placeholder-[var(--text-faint)] focus:outline-none text-sm min-h-[44px]"
            aria-label="Search events and pages"
          />
          <button
            onClick={onClose}
            aria-label="Close command menu"
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-72 overflow-y-auto divide-y divide-[var(--border)] text-sm">
          <div className="py-2">
            <div className="px-3 py-1 text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider">
              Navigation
            </div>
            <button
              onClick={() => navigateTo("/")}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--surface)] text-[var(--text)] flex items-center justify-between min-h-[44px]"
            >
              <span>Discover Events</span>
              <kbd className="text-xs text-[var(--text-faint)]">G D</kbd>
            </button>
            <button
              onClick={() => navigateTo("/wallet")}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--surface)] text-[var(--text)] flex items-center justify-between min-h-[44px]"
            >
              <span>Digital Wallet</span>
              <kbd className="text-xs text-[var(--text-faint)]">G W</kbd>
            </button>
            <button
              onClick={() => navigateTo("/scan")}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--surface)] text-[var(--text)] flex items-center justify-between min-h-[44px]"
            >
              <span>Gate Scanner</span>
              <kbd className="text-xs text-[var(--text-faint)]">G S</kbd>
            </button>
            <button
              onClick={() => navigateTo("/assistant")}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--surface)] text-[var(--text)] flex items-center justify-between min-h-[44px]"
            >
              <span>AI Assistant</span>
              <kbd className="text-xs text-[var(--text-faint)]">G A</kbd>
            </button>
            <button
              onClick={() => navigateTo("/about")}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-[var(--surface)] text-[var(--text)] flex items-center justify-between min-h-[44px]"
            >
              <span>About Demo</span>
              <kbd className="text-xs text-[var(--text-faint)]">G ?</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
