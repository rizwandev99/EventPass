"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "./button";

export interface ThemeToggleProps {
  currentTheme?: "light" | "dark" | "system";
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
}

export function ThemeToggle({ currentTheme, onThemeChange }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const stored = localStorage.getItem("eventpass-theme") as "light" | "dark" | "system" | null;
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  function applyTheme(target: "light" | "dark" | "system") {
    const root = document.documentElement;
    if (target === "dark") {
      root.classList.add("dark");
    } else if (target === "light") {
      root.classList.remove("dark");
    } else {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (systemDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }

  function handleToggle() {
    const nextTheme: "light" | "dark" | "system" =
      theme === "system" ? "dark" : theme === "dark" ? "light" : "system";

    setTheme(nextTheme);
    localStorage.setItem("eventpass-theme", nextTheme);
    applyTheme(nextTheme);
    onThemeChange?.(nextTheme);
  }

  const activeTheme = currentTheme || theme;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      aria-label="Toggle theme"
      title={`Theme: ${activeTheme}`}
      className="p-2 min-h-[44px] min-w-[44px] text-[var(--text-muted)] hover:text-[var(--text)]"
    >
      {activeTheme === "dark" ? (
        <Moon className="w-5 h-5 text-[var(--text)]" />
      ) : activeTheme === "light" ? (
        <Sun className="w-5 h-5 text-[var(--text)]" />
      ) : (
        <Laptop className="w-5 h-5 text-[var(--text)]" />
      )}
      <span className="sr-only">Toggle theme (currently {activeTheme})</span>
    </Button>
  );
}
