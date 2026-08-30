// Compatibility entry point for ingestion scripts and existing tests. The
// taxonomy itself lives in the shared package so every public surface uses the
// same stable ids, labels and deterministic rules.
export {
  ALBO_PUBLIC_AREA_THEME_DESCRIPTOR,
  ALBO_PUBLIC_AREA_THEME_KNOWN_LIMIT,
  ALBO_PUBLIC_AREA_THEME_TAXONOMY,
  classifyAlboPublicAreaTheme,
} from "@workspace/publication-standardisation/albo-area-theme";
