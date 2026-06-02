/**
 * Semantic design tokens for the Lamezia Trasparente mobile app.
 *
 * Mirrors the sibling web artifact (artifacts/lamezia-trasparente/src/index.css)
 * "Sentinella" activist brand identity: Civic Trust Blue base + Activist
 * Vermilion accent. HSL values were converted to hex so both artifacts share
 * one visual identity. Display: Space Grotesk · Body: Inter.
 *
 * Direction: modern, clean and minimal — neutral surfaces in the foreground,
 * one dominant blue accent, the vermilion brand reserved for key CTAs, light
 * borders and discrete shadows over heavy fills.
 */

const colors = {
  light: {
    // Legacy aliases
    text: "#0f1729",
    tint: "#0d56de",

    background: "#f7f9fc",
    foreground: "#0f1729",

    card: "#ffffff",
    cardForeground: "#0f1729",
    cardBorder: "#e8ebf1",

    primary: "#0d56de",
    primaryForeground: "#ffffff",

    secondary: "#eef1f6",
    secondaryForeground: "#121b31",

    muted: "#f1f4f8",
    mutedForeground: "#5a6478",

    accent: "#e6effd",
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

    border: "#e8ebf1",
    input: "#d7dce5",
  },

  dark: {
    text: "#f1f5f8",
    tint: "#438cf9",

    background: "#0a0f1a",
    foreground: "#f1f5f8",

    card: "#121a2c",
    cardForeground: "#f1f5f8",
    cardBorder: "#283247",

    primary: "#438cf9",
    primaryForeground: "#080f21",

    secondary: "#1f2840",
    secondaryForeground: "#f1f5f8",

    muted: "#1b2334",
    mutedForeground: "#a6b2c4",

    accent: "#1e2a44",
    accentForeground: "#84b3fb",

    brand: "#f7673b",
    brandForeground: "#080f21",

    success: "#31b97a",
    successForeground: "#08130d",

    warning: "#f9ab24",
    warningForeground: "#2a1d05",

    destructive: "#e03e3e",
    destructiveForeground: "#ffffff",

    border: "#232c3e",
    input: "#283248",
  },

  // Uniform corner rounding. A larger base radius reads more modern; sibling
  // offsets (radius ± n) used across screens scale coherently from here.
  radius: 12,
};

export default colors;
