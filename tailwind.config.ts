import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--bg)",
          subtle: "var(--bg-subtle)",
        },
        "bg-subtle": "var(--bg-subtle)",
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
        },
        "surface-raised": "var(--surface-raised)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        "border-strong": "var(--border-strong)",
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
          faint: "var(--text-faint)",
        },
        "text-muted": "var(--text-muted)",
        "text-faint": "var(--text-faint)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
        },
        "accent-hover": "var(--accent-hover)",
        "accent-soft": "var(--accent-soft)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      screens: {
        xs: "360px",
      },
    },
  },
  plugins: [],
};

export default config;
