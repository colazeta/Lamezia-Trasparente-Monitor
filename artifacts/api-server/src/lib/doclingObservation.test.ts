import { describe, expect, it } from "vitest";
import {
  createDoclingObservationSummary,
  hasEmbeddedPdfMarker,
  isConservativelyScanLike,
  observeDoclingCandidate,
  recordDoclingObservation,
} from "./doclingObservation";

describe("hasEmbeddedPdfMarker", () => {
  it("detects a PDF name inside an EmbeddedFiles dictionary window", () => {
    const bytes = Buffer.from(
      "%PDF-1.4\n/Names << /EmbeddedFiles << /Names [(convocazione 2.pdf) 12 0 R] >> >>",
      "latin1",
    );
    expect(hasEmbeddedPdfMarker(bytes)).toBe(true);
  });

  it("does not treat a generic embedded non-PDF file as an embedded PDF", () => {
    const bytes = Buffer.from(
      "%PDF-1.4\n/Names << /EmbeddedFiles << /Names [(dati.csv) 12 0 R] >> >>",
      "latin1",
    );
    expect(hasEmbeddedPdfMarker(bytes)).toBe(false);
  });
});

describe("isConservativelyScanLike", () => {
  it("requires extremely sparse text density", () => {
    expect(isConservativelyScanLike(16, 1)).toBe(true);
    expect(isConservativelyScanLike(63, 2)).toBe(true);
    expect(isConservativelyScanLike(200, 2)).toBe(false);
    expect(isConservativelyScanLike(null, 2)).toBe(false);
  });
});

describe("shadow Docling observation", () => {
  it("selects an image-like PDF without executing anything", () => {
    expect(
      observeDoclingCandidate({
        baselineStatus: "ok",
        baselineCharacters: 16,
        pages: 1,
      }),
    ).toMatchObject({
      requestStructuredExtraction: true,
      reason: "scan-like-sparse-baseline",
    });
  });

  it("does not select an ordinary healthy PDF", () => {
    expect(
      observeDoclingCandidate({
        baselineStatus: "ok",
        baselineCharacters: 5000,
        pages: 2,
      }),
    ).toMatchObject({
      requestStructuredExtraction: false,
      reason: "baseline-adequate-skip",
    });
  });

  it("aggregates only counts and reason codes", () => {
    const summary = createDoclingObservationSummary();
    recordDoclingObservation(
      summary,
      observeDoclingCandidate({
        baselineStatus: "ok",
        baselineCharacters: 16,
        pages: 1,
      }),
    );
    recordDoclingObservation(
      summary,
      observeDoclingCandidate({
        baselineStatus: "ok",
        baselineCharacters: 5000,
        pages: 2,
      }),
    );

    expect(summary).toEqual({
      evaluated: 2,
      candidates: 1,
      reasons: {
        "scan-like-sparse-baseline": 1,
        "baseline-adequate-skip": 1,
      },
    });
  });
});
