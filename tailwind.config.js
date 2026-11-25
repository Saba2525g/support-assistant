/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['"Vazirmatn"', "Tahoma", "sans-serif"] },
      colors: {
        sa: {
          background: "rgb(var(--background) / <alpha-value>)",
          surface: "rgb(var(--surface) / <alpha-value>)",
          "surface-secondary": "rgb(var(--surface-secondary) / <alpha-value>)",
          foreground: "rgb(var(--foreground) / <alpha-value>)",
          muted: "rgb(var(--muted) / <alpha-value>)",
          border: "rgb(var(--border) / <alpha-value>)",
          primary: "rgb(var(--primary) / <alpha-value>)",
        },
      },
      boxShadow: {
        soft: "0 2px 8px rgb(var(--shadow-color) / 0.035)",
        panel: "0 8px 30px rgb(var(--shadow-color) / 0.06)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: { "fade-in": "fade-in 350ms ease-out both" },
    },
  },
  plugins: [],
};