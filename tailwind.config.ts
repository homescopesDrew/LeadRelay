import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Job site" palette: steel, blueprint, safety orange
        steel: {
          50: "#f4f6f7",
          100: "#e3e8ea",
          200: "#c4cfd4",
          300: "#9badb6",
          400: "#6b8392",
          500: "#4f6877",
          600: "#445665",
          700: "#3b4854",
          800: "#353e48",
          900: "#1d242c",
          950: "#12171d"
        },
        safety: {
          400: "#ff8a3d",
          500: "#f96a16",
          600: "#e0540a"
        },
        blueprint: {
          500: "#2f6db5",
          700: "#1f4d85"
        }
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "ui-sans-serif", "system-ui"],
        body: ["'Inter'", "ui-sans-serif", "system-ui"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"]
      },
      boxShadow: {
        ticket: "0 1px 0 0 rgba(18,23,29,.06), 0 6px 16px -8px rgba(18,23,29,.25)"
      }
    },
  },
  plugins: [],
};
export default config;
