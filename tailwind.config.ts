
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Custom dark theme colors
        background: "#000000",
        foreground: "#FFFFFF",
        muted: {
          DEFAULT: "#222222",
          foreground: "#A1A1A1"
        },
        card: {
          DEFAULT: "rgba(32, 32, 32, 0.5)",
          foreground: "#FFFFFF"
        },
        border: "#333333",
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom, rgba(32, 32, 32, 0.4), rgba(0, 0, 0, 0.8))',
      },
      keyframes: {
        "fade-up": {
          "0%": { 
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
