/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        arc: {
          900: "#0a0e1a",
          800: "#111827",
          700: "#1c2537",
          600: "#243045",
        },
        usdc: {
          blue: "#2775CA",
          light: "#5b9bd5",
          soft: "#7ba7d4",
        },
        steel: {
          400: "#8ba3c7",
          500: "#6b83a8",
          600: "#4f6484",
        },
        accent: {
          DEFAULT: "#4a90d9",
          soft: "#6ba3dd",
          muted: "#3a6ea5",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "Consolas", "monospace"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "typing": "typing 1s steps(1) infinite",
      },
      keyframes: {
        glow: {
          "0%": { textShadow: "0 0 2px rgba(74,144,217,0.3)" },
          "100%": { textShadow: "0 0 8px rgba(74,144,217,0.5), 0 0 20px rgba(74,144,217,0.25)" },
        },
        typing: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
