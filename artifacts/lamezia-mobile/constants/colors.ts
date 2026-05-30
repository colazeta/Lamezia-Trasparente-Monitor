/**
 * Semantic design tokens for the Lamezia Trasparente mobile app.
 *
 * Mirrors the sibling web artifact (artifacts/lamezia-trasparente/src/index.css)
 * "Sentinella" activist brand identity: Civic Trust Blue base + Activist
 * Vermilion accent. HSL values were converted to hex so both artifacts share
 * one visual identity. Display: Space Grotesk · Body: Inter.
 */

const colors = {
  light: {
    // Legacy aliases
    text: "#0f1729",
    tint: "#0d56de",

    background: "#f8fafc",
    foreground: "#0f1729",

    card: "#ffffff",
    cardForeground: "#0f1729",
    cardBorder: "#dde1e9",

    primary: "#0d56de",
    primaryForeground: "#ffffff",

    secondary: "#ebeff4",
    secondaryForeground: "#121b31",

    muted: "#eff2f6",
    mutedForeground: "#586274",

    accent: "#e3edfd",
    accentForeground: "#0b4bc1",

    // Activist Vermilion — the brand accent used by the Sentinella mark.
    brand: "#e6410f",
    brandForeground: "#ffffff",

    success: "#218c5a",
    successForeground: "#ffffff",

    warning: "#eb8f05",
    warningForeground: "#3a2a05",

    destructive: "#d61f1f",
    destructiveForeground: "#ffffff",

    border: "#dadfe7",
    input: "#cfd4de",
  },

  dark: {
    text: "#f1f5f8",
    tint: "#438cf9",

    background: "#0b101d",
    foreground: "#f1f5f8",

    card: "#12192b",
    cardForeground: "#f1f5f8",
    cardBorder: "#2a3347",

    primary: "#438cf9",
    primaryForeground: "#080f21",

    secondary: "#20283c",
    secondaryForeground: "#f1f5f8",

    muted: "#1d2434",
    mutedForeground: "#a3b0c2",

    accent: "#222c44",
    accentForeground: "#7eb0fb",

    brand: "#f7673b",
    brandForeground: "#080f21",

    success: "#31b97a",
    successForeground: "#08130d",

    warning: "#f9ab24",
    warningForeground: "#2a1d05",

    destructive: "#e03e3e",
    destructiveForeground: "#ffffff",

    border: "#262f40",
    input: "#283248",
  },

  // Web --radius is 0.5rem (8px).
  radius: 8,
};

export default colors;
