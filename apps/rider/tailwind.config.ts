import type { Config } from "tailwindcss";

/**
 * MyStreetMenu brand tokens (taken from the brand artwork):
 *  navy   -> logo, headings, bottom bars
 *  brand  -> orange: primary buttons, highlights ("Street" in the logo)
 *  ok     -> green: Online / Available / Completed
 *  danger -> red: SOS and problem reports
 *  gold   -> yellow: bonus and badges
 *  cream  -> off-white page background (readable in bright sunlight)
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#14213D",
          700: "#1D2E52",
          600: "#2A3F6B",
          100: "#E3E8F2",
        },
        brand: {
          DEFAULT: "#F97316",
          50: "#FFF4EA",
          100: "#FFE7D1",
          200: "#FDCDA0",
          500: "#F97316",
          600: "#EA6A0A",
          700: "#C2570A",
        },
        ok: {
          DEFAULT: "#16A34A",
          50: "#E8F8EE",
          700: "#117A38",
        },
        danger: {
          DEFAULT: "#DC2626",
          50: "#FDECEC",
          700: "#B01E1E",
        },
        gold: {
          DEFAULT: "#FBBF24",
          50: "#FFF8E1",
          700: "#B7860B",
        },
        cream: "#FFF8F1",
        line: "#EADFD3",
        muted: "#5B6478",
      },
      fontFamily: {
        sans: [
          "Hind Siliguri",
          "Noto Sans Bengali",
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      minHeight: {
        touch: "3rem", // 48px
        "touch-lg": "3.5rem", // 56px primary action buttons
      },
      minWidth: {
        touch: "3rem",
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top, 0px)",
        "safe-bottom": "env(safe-area-inset-bottom, 0px)",
        nav: "4.5rem", // bottom navigation height
      },
      borderRadius: {
        card: "1rem",
        btn: "0.875rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,33,61,0.06), 0 4px 14px rgba(20,33,61,0.06)",
        cta: "0 6px 16px rgba(249,115,22,0.35)",
        sos: "0 6px 16px rgba(220,38,38,0.4)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
      animation: {
        "pulse-ring": "pulseRing 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
