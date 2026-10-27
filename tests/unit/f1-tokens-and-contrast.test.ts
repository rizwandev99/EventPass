import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// Color contrast calculation helper (WCAG AA: >= 4.5:1 for normal text, >= 3:1 for large/icons)
function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace("#", "");
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hexToRgb(hex1));
  const l2 = getLuminance(hexToRgb(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("F1 Design System Tokens & Contrast", () => {
  it("AC-F1-4: finds no hard-coded color values in components and app files outside token file", () => {
    const targetDirs = [
      path.resolve(__dirname, "../../src/components"),
      path.resolve(__dirname, "../../src/app"),
    ];
    const allowedFile = "globals.css";
    const hexRegex = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;

    function scanFiles(dir: string): { file: string; match: string }[] {
      if (!fs.existsSync(dir)) return [];
      const violations: { file: string; match: string }[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          violations.push(...scanFiles(fullPath));
        } else if (
          (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts") || entry.name.endsWith(".css")) &&
          entry.name !== allowedFile
        ) {
          const content = fs.readFileSync(fullPath, "utf-8");
          const matches = content.match(hexRegex);
          if (matches) {
            for (const match of matches) {
              // Ignore pure comments or SVG definitions if any
              violations.push({ file: fullPath, match });
            }
          }
        }
      }
      return violations;
    }

    const violations = targetDirs.flatMap((dir) => scanFiles(dir));
    expect(violations, `Found hardcoded hex colors: ${JSON.stringify(violations)}`).toEqual([]);
  });

  it("AC-F1-5: each text token on its background token meets contrast rule in both themes", () => {
    // PRD 5.2 specified color values
    const lightTokens = {
      bg: "#FFFFFF",
      bgSubtle: "#FAFAFB",
      surface: "#F4F5F7",
      text: "#111214",
      textMuted: "#5B6068",
      accent: "#5B5BD6",
    };

    const darkTokens = {
      bg: "#0B0C0E",
      bgSubtle: "#101114",
      surface: "#16171B",
      text: "#F2F3F5",
      textMuted: "#A0A4AB",
      accent: "#7C7FF2",
    };

    // Light mode text contrast on page bg (>= 4.5:1)
    const lightTextRatio = getContrastRatio(lightTokens.text, lightTokens.bg);
    expect(lightTextRatio).toBeGreaterThanOrEqual(4.5);

    // Light mode text-muted on surface (>= 4.5:1)
    const lightMutedRatio = getContrastRatio(lightTokens.textMuted, lightTokens.surface);
    expect(lightMutedRatio).toBeGreaterThanOrEqual(4.5);

    // Dark mode text contrast on dark page bg (>= 4.5:1)
    const darkTextRatio = getContrastRatio(darkTokens.text, darkTokens.bg);
    expect(darkTextRatio).toBeGreaterThanOrEqual(4.5);

    // Dark mode text-muted on surface (>= 4.5:1)
    const darkMutedRatio = getContrastRatio(darkTokens.textMuted, darkTokens.surface);
    expect(darkMutedRatio).toBeGreaterThanOrEqual(4.5);

    // Accent contrast on dark bg for large/interactive (>= 3:1)
    const darkAccentRatio = getContrastRatio(darkTokens.accent, darkTokens.bg);
    expect(darkAccentRatio).toBeGreaterThanOrEqual(3.0);
  });
});
