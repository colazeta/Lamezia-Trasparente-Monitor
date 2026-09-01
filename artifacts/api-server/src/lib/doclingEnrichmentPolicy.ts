export type DoclingEnrichmentReason =
  | "feature-disabled"
  | "unsupported-content-type"
  | "resource-bound"
  | "embedded-pdf-sparse-baseline"
  | "baseline-failed"
  | "scan-like-sparse-baseline"
  | "reviewed-layout-class"
  | "baseline-adequate-skip"
  | "insufficient-evidence-skip";

export type DoclingEnrichmentInput = {
  enabled: boolean;
  contentType: string | null | undefined;
  baselineStatus: "ok" | "failed" | "not-run";
  baselineCharacters?: number | null;
  pages?: number | null;
  hasEmbeddedPdf?: boolean;
  scanLike?: boolean;
  reviewedLayoutClass?: boolean;
  maxPages?: number;
};

export type DoclingEnrichmentDecision = {
  requestStructuredExtraction: boolean;
  reason: DoclingEnrichmentReason;
  baselineCharactersPerPage: number | null;
};

const DEFAULT_MAX_PAGES = 20;
const SPARSE_CHARACTERS_PER_PAGE = 100;

function isPdfContentType(contentType: string | null | undefined): boolean {
  if (!contentType) return false;
  return contentType.split(";", 1)[0]?.trim().toLowerCase() === "application/pdf";
}

function charactersPerPage(
  characters: number | null | undefined,
  pages: number | null | undefined,
): number | null {
  if (!Number.isFinite(characters) || !Number.isFinite(pages) || !pages || pages <= 0) {
    return null;
  }
  return (characters as number) / pages;
}

/**
 * Pure decision policy for requesting a future Docling enrichment job.
 *
 * This function never invokes Docling and has no side effects. The official source remains
 * canonical; a positive decision is only permission for a separate worker/processor to attempt
 * a derived extraction. The feature flag is fail-closed and defaults must be supplied explicitly
 * by the caller.
 */
export function decideDoclingEnrichment(
  input: DoclingEnrichmentInput,
): DoclingEnrichmentDecision {
  const density = charactersPerPage(input.baselineCharacters, input.pages);

  if (!input.enabled) {
    return {
      requestStructuredExtraction: false,
      reason: "feature-disabled",
      baselineCharactersPerPage: density,
    };
  }

  if (!isPdfContentType(input.contentType)) {
    return {
      requestStructuredExtraction: false,
      reason: "unsupported-content-type",
      baselineCharactersPerPage: density,
    };
  }

  const maxPages = input.maxPages ?? DEFAULT_MAX_PAGES;
  if (Number.isFinite(input.pages) && (input.pages as number) > maxPages) {
    return {
      requestStructuredExtraction: false,
      reason: "resource-bound",
      baselineCharactersPerPage: density,
    };
  }

  const sparseBaseline = density !== null && density < SPARSE_CHARACTERS_PER_PAGE;

  if (input.hasEmbeddedPdf && (input.baselineStatus !== "ok" || sparseBaseline)) {
    return {
      requestStructuredExtraction: true,
      reason: "embedded-pdf-sparse-baseline",
      baselineCharactersPerPage: density,
    };
  }

  if (input.baselineStatus === "failed") {
    return {
      requestStructuredExtraction: true,
      reason: "baseline-failed",
      baselineCharactersPerPage: density,
    };
  }

  if (input.scanLike && sparseBaseline) {
    return {
      requestStructuredExtraction: true,
      reason: "scan-like-sparse-baseline",
      baselineCharactersPerPage: density,
    };
  }

  if (input.reviewedLayoutClass) {
    return {
      requestStructuredExtraction: true,
      reason: "reviewed-layout-class",
      baselineCharactersPerPage: density,
    };
  }

  if (input.baselineStatus === "ok" && density !== null && !sparseBaseline) {
    return {
      requestStructuredExtraction: false,
      reason: "baseline-adequate-skip",
      baselineCharactersPerPage: density,
    };
  }

  return {
    requestStructuredExtraction: false,
    reason: "insufficient-evidence-skip",
    baselineCharactersPerPage: density,
  };
}
