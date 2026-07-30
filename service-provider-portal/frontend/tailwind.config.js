/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#eef4f3",
          100: "#d7e4e2",
          200: "#aec9c5",
          300: "#7fa9a3",
          400: "#4f847d",
          500: "#2f645d",
          600: "#1d4c46",
          700: "#163d38",
          800: "#123b36",
          900: "#0c2724",
        },
        amber: {
          50: "#fdf6ea",
          100: "#faeaca",
          200: "#f3d191",
          300: "#ecb75c",
          400: "#e8a33d",
          500: "#d6892a",
          600: "#b06c20",
        },
        paper: "#f5f6f3",
        ok: "#3f7d58",
        danger: "#c1483c",
      },
      fontFamily: {
        display: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(12,39,36,0.06), 0 4px 16px rgba(12,39,36,0.06)",
      },
    },
  },
  plugins: [],
}
