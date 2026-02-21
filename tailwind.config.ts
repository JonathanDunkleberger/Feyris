import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy shadcn/ui variables
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        // ─── Feyris Design System ───
        fey: {
          black: "#0a0a0f",
          surface: "#0e0e14",
          elevated: "#12121a",
          hover: "#16161f",
        },
        gold: {
          DEFAULT: "#c8a44e",
          light: "#e8d5a0",
          dark: "#8a7235",
          muted: "rgba(200,164,78,0.1)",
        },
        cream: "#f0ebe0",
        // Media type colors
        type: {
          anime: "#7b9ec9",
          game: "#c8a44e",
          book: "#a0c4a8",
          tv: "#c97b9e",
          film: "#d4a574",
          manga: "#b088c9",
        },
        match: "#5cb85c",
        border: {
          DEFAULT: "hsl(var(--border))",
          subtle: "rgba(255,255,255,0.04)",
          light: "rgba(255,255,255,0.08)",
          gold: "rgba(200,164,78,0.15)",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "12px",
        modal: "20px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease",
        fadeIn: "fadeIn 0.3s ease",
        "slide-up":
          "slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        "scale-in": "scaleIn 0.2s ease",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
