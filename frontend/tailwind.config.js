/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#070a13",
          card: "#0d1326",
          cardHover: "#141c36",
          blue: "#0ea5e9",
          cyan: "#22d3ee",
          purple: "#a855f7",
          border: "#16223f",
          textMuted: "#94a3b8",
        }
      }
    },
  },
  plugins: [],
}
