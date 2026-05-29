/**
 * Semantic design tokens for the Lamezia Trasparente mobile app.
 *
 * Derived from the sibling web artifact (artifacts/lamezia-trasparente/src/index.css)
 * "Calabrian Terracotta & Deep Slate" theme. HSL values were converted to hex so
 * both artifacts share one visual identity.
 */

const colors = {
  light: {
    // Legacy aliases
    text: "#1B2333",
    tint: "#C93E1C",

    background: "#FDFCF8",
    foreground: "#1B2333",

    card: "#FFFFFF",
    cardForeground: "#1B2333",
    cardBorder: "#DEE1E7",

    primary: "#C93E1C",
    primaryForeground: "#FFFFFF",

    secondary: "#EEF0F3",
    secondaryForeground: "#1B2333",

    muted: "#EEF0F3",
    mutedForeground: "#626D84",

    accent: "#F5F1EB",
    accentForeground: "#B43718",

    destructive: "#E04A2B",
    destructiveForeground: "#FFFFFF",

    border: "#DEE1E7",
    input: "#D2D6DE",
  },

  dark: {
    text: "#FDFCF8",
    tint: "#DD5836",

    background: "#151C28",
    foreground: "#FDFCF8",

    card: "#1B2232",
    cardForeground: "#FDFCF8",
    cardBorder: "#242E42",

    primary: "#DD5836",
    primaryForeground: "#FFFFFF",

    secondary: "#2D3953",
    secondaryForeground: "#FDFCF8",

    muted: "#242E42",
    mutedForeground: "#98A1B3",

    accent: "#2D3953",
    accentForeground: "#E76B4B",

    destructive: "#C9402A",
    destructiveForeground: "#FFFFFF",

    border: "#242E42",
    input: "#2D3953",
  },

  // Web --radius is 0.25rem (4px). Cards/buttons stay crisp like the web app.
  radius: 6,
};

export default colors;
