import { describe, expect, it } from "vitest";

import {
  civicDemoDatasetManifest,
  filterCivicDemoManifestByStatus,
  hasUniqueCivicDemoModuleIds,
  isCivicDemoManifestDemoOnly,
  summarizeCivicDemoDatasetManifest,
} from "../data/civicDemoDatasetManifest";

const manifestText = JSON.stringify(civicDemoDatasetManifest);

const forbiddenIdentifiablePatterns = [
  /https?:\/\//i,
  /www\./i,
  /[\w.-]+@[\w.-]+\.[a-z]{2,}/i,
  /\b\d{5}\b/,
  /\b[A-Z]{2}\d{4,}\b/,
  /\bprotocollo\s+n[.°]?\s*\d+/i,
  /\bprocedimento\s+n[.°]?\s*\d+/i,
  /\bvia\s+[A-ZÀ-Ú][\p{L}'-]+/iu,
  /\bpiazza\s+[A-ZÀ-Ú][\p{L}'-]+/iu,
];

describe("civic demo dataset manifest", () => {
  it("keeps module ids unique", () => {
    expect(hasUniqueCivicDemoModuleIds()).toBe(true);
  });

  it("marks every entry as demo-only", () => {
    expect(isCivicDemoManifestDemoOnly()).toBe(true);
    expect(civicDemoDatasetManifest.every((entry) => entry.demoOnly)).toBe(true);
  });

  it("filters entries by demo status", () => {
    const demoSeeds = filterCivicDemoManifestByStatus("demo-seed");

    expect(demoSeeds).toHaveLength(2);
    expect(demoSeeds.map((entry) => entry.id)).toEqual([
      "promessometro",
      "beni-confiscati",
    ]);
  });

  it("summarizes counts by area and status", () => {
    const summary = summarizeCivicDemoDatasetManifest();

    expect(summary.total).toBe(5);
    expect(summary.byArea).toEqual({
      "programmazione-civica": 1,
      "incarichi-e-organizzazione": 1,
      "accesso-civico": 1,
      "legalita-e-monitoraggio": 1,
      "patrimonio-monitorato": 1,
    });
    expect(summary.byStatus).toEqual({
      "schema-only": 1,
      "demo-seed": 2,
      "methodology-draft": 2,
    });
  });

  it("keeps records descriptive and free from identifiable operational references", () => {
    for (const entry of civicDemoDatasetManifest) {
      expect(entry.technicalName).toBeTruthy();
      expect(entry.cautionNotes.length).toBeGreaterThan(0);
      expect(entry.linkedDatasetNotes.length).toBeGreaterThan(0);
      expect(entry.exposureLevel).not.toBe("public-runtime" as never);
    }

    for (const forbiddenPattern of forbiddenIdentifiablePatterns) {
      expect(manifestText).not.toMatch(forbiddenPattern);
    }
  });
});
