// src/design-tokens.ts
// 🎨 Design tokens centralisés — aucune "magic value" dans le code UI
// Inspirés des principes Revolut (consistency, clarity) et Uber Base (scalability)

export const colors = {
  primary: {
    DEFAULT: "#1A73E8", // bleu principal (CTA, highlight)
    foreground: "#FFFFFF",
    hover: "#1669C1",
    active: "#0F4A8A",
  },
  surface: {
    DEFAULT: "#FFFFFF", // surface card / fond clair
    subtle: "#F9FAFB",  // background secondaire
    dark: "#111827",    // fond sombre
  },
  onSurface: {
    primary: "#111827", // texte principal
    secondary: "#4B5563", // texte secondaire
    disabled: "#9CA3AF",
  },
  feedback: {
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#2563EB",
  },
};

export const spacing = {
  xs: "4px",
  s: "8px",
  m: "12px",
  l: "16px",
  xl: "24px",
  "2xl": "32px",
};

export const radius = {
  s: "6px",
  m: "10px",
  l: "14px",
  xl: "20px",
  full: "9999px",
};

export const shadows = {
  s: "0 1px 2px rgba(0,0,0,0.08)",
  m: "0 4px 6px rgba(0,0,0,0.12)",
  l: "0 10px 15px rgba(0,0,0,0.15)",
};

export const typography = {
  label: "clamp(0.75rem, 0.2vw + 0.7rem, 0.875rem)", // 12–14px
  body: "clamp(0.875rem, 0.25vw + 0.8rem, 1rem)", // 14–16px
  title: "clamp(1.25rem, 0.5vw + 1rem, 1.5rem)", // 20–24px
  headline: "clamp(1.5rem, 1vw + 1.25rem, 2rem)", // 24–32px
};

// Tailwind integration helper (si besoin pour theme extension)
export const tokens = {
  colors,
  spacing,
  radius,
  shadows,
  typography,
};

export type Tokens = typeof tokens;
