import { describe, expect, it } from "vitest";
import { decideDoclingEnrichment } from "./doclingEnrichmentPolicy";

const base = {
  enabled: true,
  contentType: "application/pdf",
  baselineStatus: "ok" as const,
  baselineCharacters: 1000,
  pages: 1,
};

describe("decideDoclingEnrichment", () => {
  it("fails closed when the feature is disabled", () => {
    expect(decideDoclingEnrichment({ ...base, enabled: false })).toMatchObject({
      requestStructuredExtraction: false,
      reason: "feature-disabled",
    });
  });

  it("does not request Docling for a healthy ordinary PDF", () => {
    expect(decideDoclingEnrichment(base)).toMatchObject({
      requestStructuredExtraction: false,
      reason: "baseline-adequate-skip",
    });
  });

  it("requests enrichment for an embedded PDF when the baseline is sparse", () => {
    expect(
      decideDoclingEnrichment({
        ...base,
        baselineCharacters: 16,
        hasEmbeddedPdf: true,
      }),
    ).toMatchObject({
      requestStructuredExtraction: true,
      reason: "embedded-pdf-sparse-baseline",
    });
  });

  it("requests enrichment when the baseline extractor failed", () => {
    expect(
      decideDoclingEnrichment({
        ...base,
        baselineStatus: "failed",
        baselineCharacters: null,
      }),
    ).toMatchObject({
      requestStructuredExtraction: true,
      reason: "baseline-failed",
    });
  });

  it("requests enrichment for scan-like PDFs only when the baseline is sparse", () => {
    expect(
      decideDoclingEnrichment({
        ...base,
        baselineCharacters: 150,
        pages: 2,
        scanLike: true,
      }),
    ).toMatchObject({
      requestStructuredExtraction: true,
      reason: "scan-like-sparse-baseline",
    });

    expect(
      decideDoclingEnrichment({
        ...base,
        baselineCharacters: 8000,
        pages: 2,
        scanLike: true,
      }),
    ).toMatchObject({
      requestStructuredExtraction: false,
      reason: "baseline-adequate-skip",
    });
  });

  it("allows reviewed layout classes but not unreviewed class guesses", () => {
    expect(
      decideDoclingEnrichment({ ...base, reviewedLayoutClass: true }),
    ).toMatchObject({
      requestStructuredExtraction: true,
      reason: "reviewed-layout-class",
    });

    expect(
      decideDoclingEnrichment({
        ...base,
        baselineStatus: "not-run",
        baselineCharacters: null,
      }),
    ).toMatchObject({
      requestStructuredExtraction: false,
      reason: "insufficient-evidence-skip",
    });
  });

  it("rejects unsupported content types before any enrichment request", () => {
    expect(
      decideDoclingEnrichment({
        ...base,
        contentType: "text/html",
        baselineStatus: "failed",
      }),
    ).toMatchObject({
      requestStructuredExtraction: false,
      reason: "unsupported-content-type",
    });
  });

  it("enforces the page resource bound before fallback rules", () => {
    expect(
      decideDoclingEnrichment({
        ...base,
        baselineStatus: "failed",
        pages: 21,
        maxPages: 20,
      }),
    ).toMatchObject({
      requestStructuredExtraction: false,
      reason: "resource-bound",
    });
  });
});
