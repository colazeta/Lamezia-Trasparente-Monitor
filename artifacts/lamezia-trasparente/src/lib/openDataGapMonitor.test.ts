import { describe, expect, it } from "vitest";

import {
  OPEN_DATA_DATASET_CANDIDATES,
  createOpenDataGapReport,
  type OpenDataCatalogSnapshot,
} from "./openDataGapMonitor";

describe("open data gap monitor", () => {
  it("creates a cautious report for an empty catalog snapshot", () => {
    const report = createOpenDataGapReport(emptySnapshot());

    expect(report.readiness).toBe("catalog_empty");
    expect(report.counts).toEqual({
      published: 0,
      external_export: 0,
      absent: OPEN_DATA_DATASET_CANDIDATES.length,
      not_evaluable: 0,
    });
    expect(report.items).toHaveLength(8);
    expect(report.items.every((item) => item.availability === "absent")).toBe(
      true,
    );
    expect(report.methodologicalNote).toContain(
      "non misura qualità amministrativa",
    );
  });

  it("preserves published dataset source, format, update and license metadata", () => {
    const report = createOpenDataGapReport({
      catalogName: "Catalogo fixture",
      capturedAt: "2026-06-01",
      evidence: [
        {
          candidateId: "albo_pretorio_export",
          availability: "published",
          sourceName: "Catalogo comunale fixture",
          sourceUrl: "https://example.test/catalog/albo",
          format: "CSV",
          lastUpdated: "2026-05-31",
          license: "CC BY 4.0",
          metadataUrl: "https://example.test/catalog/albo/metadata",
        },
        {
          candidateId: "pnrr_progetti",
          availability: "published",
          sourceName: "Catalogo comunale fixture",
          format: "JSON",
          lastUpdated: "2026-05-20",
          license: "CC BY 4.0",
          metadataUrl: "https://example.test/catalog/pnrr/metadata",
        },
      ],
    });

    const albo = report.items.find(
      (item) => item.candidate.id === "albo_pretorio_export",
    );

    expect(report.readiness).toBe("partially_ready");
    expect(report.counts.published).toBe(2);
    expect(albo).toMatchObject({
      availability: "published",
      sourceName: "Catalogo comunale fixture",
      format: "CSV",
      lastUpdated: "2026-05-31",
      license: "CC BY 4.0",
      metadataComplete: true,
    });
  });

  it("distinguishes external exports from catalog publications", () => {
    const report = createOpenDataGapReport({
      catalogName: "Catalogo fixture",
      evidence: [
        {
          candidateId: "consiglio_sedute_odg_verbali",
          availability: "external_export",
          sourceName: "Sezione amministrativa fixture",
          sourceUrl: "https://example.test/export/consiglio",
          format: "XLSX",
          lastUpdated: "2026-04-15",
          license: "Licenza indicata nella pagina fonte",
          metadataUrl: "https://example.test/export/consiglio/metadati",
          notes: "Export indicato fuori dal catalogo principale nella fixture.",
        },
      ],
    });

    const item = report.items.find(
      (entry) => entry.candidate.id === "consiglio_sedute_odg_verbali",
    );

    expect(report.readiness).toBe("external_exports_only");
    expect(report.counts.external_export).toBe(1);
    expect(item?.availability).toBe("external_export");
    expect(item?.description).toContain("fuori dal catalogo principale");
    expect(item?.notes).toEqual([
      "Export indicato fuori dal catalogo principale nella fixture.",
    ]);
  });

  it("flags incomplete metadata without inferring dataset completeness", () => {
    const report = createOpenDataGapReport({
      catalogName: "Catalogo fixture",
      evidence: [
        {
          candidateId: "affidamenti_incarichi",
          availability: "published",
          sourceName: "Catalogo comunale fixture",
          format: "CSV",
        },
        {
          candidateId: "verde_manutenzioni",
          availability: "not_evaluable",
          notes:
            "La fixture non contiene campi sufficienti per valutare disponibilità.",
        },
      ],
      limitations: ["Fixture sintetica senza verifica live."],
    });

    const incomplete = report.items.find(
      (item) => item.candidate.id === "affidamenti_incarichi",
    );
    const notEvaluable = report.items.find(
      (item) => item.candidate.id === "verde_manutenzioni",
    );

    expect(incomplete?.metadataComplete).toBe(false);
    expect(incomplete?.proposal).toContain("completare metadati minimi");
    expect(notEvaluable?.availability).toBe("not_evaluable");
    expect(report.limitations).toEqual([
      "Fixture sintetica senza verifica live.",
    ]);
    expect(JSON.stringify(report)).not.toMatch(
      /corruzione|favoritismo|responsabilità individuali/i,
    );
  });

  it("does not mutate snapshot evidence or custom candidates", () => {
    const snapshot = emptySnapshot();
    const beforeSnapshot = structuredClone(snapshot);
    const candidates = [OPEN_DATA_DATASET_CANDIDATES[0]!];
    const beforeCandidates = structuredClone(candidates);

    createOpenDataGapReport(snapshot, candidates);

    expect(snapshot).toEqual(beforeSnapshot);
    expect(candidates).toEqual(beforeCandidates);
  });
});

function emptySnapshot(): OpenDataCatalogSnapshot {
  return {
    catalogName: "Catalogo fixture vuoto",
    evidence: [],
  };
}
