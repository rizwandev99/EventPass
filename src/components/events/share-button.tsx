"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ShareButtonProps {
  title: string;
  url: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        // Fallback failed
      }
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleShare}
      aria-label="Share event"
      className="gap-2"
    >
      {copied ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Share2 className="w-4 h-4" />}
      <span>{copied ? "Link Copied" : "Share"}</span>
    </Button>
  );
}
