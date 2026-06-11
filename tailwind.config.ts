import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Remapped to premium slate palette
        steel: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
        safety: {
          400: "#FF9500",
          500: "#FF7A00",
          600: "#E06800",
        },
        blueprint: {
          500: "#1A73E8",
          600: "#1565C0",
          700: "#1557B0",
        },
        navy: "#0F1B2B",
        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "ui-sans-serif", "system-ui"],
        body: ["'Inter'", "ui-sans-serif", "system-ui"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      boxShadow: {
        ticket: "0 1px 3px 0 rgba(15,23,42,.06), 0 4px 16px -4px rgba(15,23,42,.10)",
        "ticket-hover": "0 8px 30px -6px rgba(15,23,42,.18), 0 2px 6px 0 rgba(15,23,42,.08)",
      },
    },
  },
  plugins: [],
};
export default config;
