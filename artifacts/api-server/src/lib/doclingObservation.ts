import {
  decideDoclingEnrichment,
  type DoclingEnrichmentDecision,
  type DoclingEnrichmentReason,
} from "./doclingEnrichmentPolicy";

const EMBEDDED_FILES_MARKER = Buffer.from("/EmbeddedFiles", "ascii");
const EMBEDDED_PDF_SCAN_WINDOW_BYTES = 256 * 1024;
const SCAN_LIKE_MAX_CHARACTERS_PER_PAGE = 32;

export type DoclingShadowInput = {
  baselineStatus: "ok" | "failed" | "not-run";
  baselineCharacters?: number | null;
  pages?: number | null;
  hasEmbeddedPdf?: boolean;
  reviewedLayoutClass?: boolean;
};

export type DoclingObservationSummary = {
  evaluated: number;
  candidates: number;
  reasons: Partial<Record<DoclingEnrichmentReason, number>>;
};

export function hasEmbeddedPdfMarker(data: Uint8Array): boolean {
  const bytes = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  const markerIndex = bytes.indexOf(EMBEDDED_FILES_MARKER);
  if (markerIndex < 0) return false;

  const end = Math.min(
    bytes.length,
    markerIndex + EMBEDDED_PDF_SCAN_WINDOW_BYTES,
  );
  const embeddedDictionaryWindow = bytes
    .subarray(markerIndex, end)
    .toString("latin1")
    .toLowerCase();
  return embeddedDictionaryWindow.includes(".pdf");
}

export function isConservativelyScanLike(
  baselineCharacters: number | null | undefined,
  pages: number | null | undefined,
): boolean {
  if (
    !Number.isFinite(baselineCharacters) ||
    !Number.isFinite(pages) ||
    !pages ||
    pages <= 0
  ) {
    return false;
  }
  return (
    (baselineCharacters as number) / pages <=
    SCAN_LIKE_MAX_CHARACTERS_PER_PAGE
  );
}

/**
 * Shadow-only evaluation. It deliberately evaluates the selection policy as if
 * enrichment were enabled, but it never invokes Docling or changes publication
 * state. Real execution remains independently fail-closed behind
 * DOCLING_ENRICHMENT_ENABLED.
 */
export function observeDoclingCandidate(
  input: DoclingShadowInput,
): DoclingEnrichmentDecision {
  return decideDoclingEnrichment({
    enabled: true,
    contentType: "application/pdf",
    baselineStatus: input.baselineStatus,
    baselineCharacters: input.baselineCharacters,
    pages: input.pages,
    hasEmbeddedPdf: input.hasEmbeddedPdf,
    scanLike: isConservativelyScanLike(
      input.baselineCharacters,
      input.pages,
    ),
    reviewedLayoutClass: input.reviewedLayoutClass ?? false,
  });
}

export function createDoclingObservationSummary(): DoclingObservationSummary {
  return { evaluated: 0, candidates: 0, reasons: {} };
}

export function recordDoclingObservation(
  summary: DoclingObservationSummary,
  decision: DoclingEnrichmentDecision,
): void {
  summary.evaluated += 1;
  if (decision.requestStructuredExtraction) summary.candidates += 1;
  summary.reasons[decision.reason] = (summary.reasons[decision.reason] ?? 0) + 1;
}
