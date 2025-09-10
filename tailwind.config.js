const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          active: "var(--color-primary-active)",
        },
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "on-surface": "var(--color-on-surface)",
        "on-primary": "var(--color-on-primary)",

        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
      borderRadius: {
        s: "var(--radius-s)",
        m: "var(--radius-m)",
        l: "var(--radius-l)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        s: "var(--shadow-s)",
        m: "var(--shadow-m)",
        l: "var(--shadow-l)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
