/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces + brand come from CSS variables (src/index.css).
        ink: "rgb(var(--ink) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        edge: "rgb(var(--edge) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--ac-500) / <alpha-value>)",
          400: "rgb(var(--ac-400) / <alpha-value>)",
          500: "rgb(var(--ac-500) / <alpha-value>)",
          600: "rgb(var(--ac-600) / <alpha-value>)",
          700: "rgb(var(--ac-700) / <alpha-value>)",
          deep: "rgb(var(--ac-deep) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ['"Space Grotesk Variable"', "system-ui", "sans-serif"],
        // Tall condensed scoreboard numerals for the counters.
        score: ['"Teko Variable"', '"Space Grotesk Variable"', "sans-serif"],
      },
      backgroundImage: {
        "hero-brand":
          "linear-gradient(135deg, rgb(var(--ac-hero-from)) 0%, rgb(var(--ac-deep)) 55%, rgb(var(--ac-500)) 100%)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        // Cards get a hairline top highlight so they read as lit surfaces.
        card: "0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        hero: "0 12px 32px -12px rgb(var(--ac-500) / 0.45)",
      },
      keyframes: {
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(.85)" },
          "60%": { opacity: "1", transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "page-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-150%)" },
          "100%": { transform: "translateX(350%)" },
        },
        "flame-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.18)" },
        },
        "confetti-fall": {
          "0%": { opacity: "1", transform: "translateY(-8vh) rotate(0deg)" },
          "85%": { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(72vh) rotate(680deg)" },
        },
        "coin-flip": {
          "0%": { transform: "translateY(0) rotateY(0deg) scale(.7)" },
          "45%": { transform: "translateY(-56px) rotateY(900deg) scale(1.08)" },
          "100%": { transform: "translateY(0) rotateY(1800deg) scale(1)" },
        },
      },
      animation: {
        "pop-in": "pop-in .32s cubic-bezier(.2,1.4,.4,1) both",
        "page-in": "page-in .34s cubic-bezier(.16,1,.3,1) both",
        shimmer: "shimmer 2.4s ease-in-out infinite",
        "flame-pulse": "flame-pulse 1.6s ease-in-out infinite",
        "confetti-fall": "confetti-fall var(--confetti-duration,1.5s) ease-in both",
        "coin-flip": "coin-flip 1.4s cubic-bezier(.32,.7,.35,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
