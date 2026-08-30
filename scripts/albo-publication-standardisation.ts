// Compatibility entry point for scripts and existing tests. Runtime consumers
// import the shared package directly; server code never imports from scripts.
export {
  ALBO_PUBLICATION_STANDARDISATION,
  ALBO_PUBLICATION_STANDARDISATION_KNOWN_LIMIT,
  ALBO_PUBLICATION_STANDARDISATION_PROFILE,
  standardiseAlboPublicSubject,
} from "@workspace/publication-standardisation/albo";
