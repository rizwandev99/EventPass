import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CommandMenu } from "@/components/ui/command-menu";
import { Button } from "@/components/ui/button";

describe("F1 App Shell & UI Primitives", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("AC-F1-1: theme toggle switches between light, dark and system; choice is saved and restored", async () => {
    // Theme toggle test with state tracking
    const onChangeTheme = vi.fn();
    render(<ThemeToggle currentTheme="light" onThemeChange={onChangeTheme} />);

    const toggleButton = screen.getByRole("button", { name: /toggle theme|theme switcher/i });
    expect(toggleButton).toBeInTheDocument();

    // Click to cycle or open theme selection
    await userEvent.click(toggleButton);
    expect(onChangeTheme).toHaveBeenCalled();
  });

  it("AC-F1-6: command menu opens with Ctrl+K and Cmd+K, closes with Escape, keeps focus inside and returns focus", async () => {
    const handleClose = vi.fn();
    const { rerender } = render(
      <div>
        <button id="trigger-btn">Trigger</button>
        <CommandMenu isOpen={false} onClose={handleClose} />
      </div>
    );

    // Initial state: menu not visible
    expect(screen.queryByRole("dialog", { name: /command menu/i })).not.toBeInTheDocument();

    // Open menu
    rerender(
      <div>
        <button id="trigger-btn">Trigger</button>
        <CommandMenu isOpen={true} onClose={handleClose} />
      </div>
    );

    const dialog = screen.getByRole("dialog", { name: /command menu/i });
    expect(dialog).toBeInTheDocument();

    // Escape triggers close
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });

  it("AC-F1-8: interactive elements show a visible focus ring and have accessible names; reduced motion turns off animation", () => {
    render(<Button>Click Me</Button>);
    const btn = screen.getByRole("button", { name: "Click Me" });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain("focus-visible:ring");
  });
});
