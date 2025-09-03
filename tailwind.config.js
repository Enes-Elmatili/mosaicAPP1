/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 🌗 dark mode activé via class="dark"
  content: [
    "./index.html",
    "./public/index.html", // ✅ inclut le HTML public pour la pré-prod
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#000000", // Uber Black
          light: "#1a1a1a",
          dark: "#000000",
        },
        secondary: {
          DEFAULT: "#00AEEF", // Revolut Blue
          purple: "#6A5ACD",  // Soft purple
          pink: "#FF2D55",   // Revolut pink accent
        },
        neutral: {
          100: "#F9FAFB",
          200: "#F3F4F6",
          300: "#E5E7EB",
          800: "#1F2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.05)",
        strong: "0 4px 20px rgba(0,0,0,0.1)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      // 🌀 Animations custom
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseOnce: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out forwards",
        pulseOnce: "pulseOnce 1.5s ease-in-out",
        slideUp: "slideUp 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
