import { describe, expect, it } from "vitest";

import {
  civicDemoDatasetManifest,
  hasUniqueCivicDemoModuleIds,
  summarizeCivicDemoDatasetManifest,
} from "../data/civicDemoDatasetManifest";

const allowedNonOperationalExposureLevels = new Set([
  "not-integrated",
  "internal-preview",
  "documentation-only",
]);

describe("civic demo dataset manifest invariants", () => {
  it("keeps every manifest entry explicitly demo-only", () => {
    expect(civicDemoDatasetManifest.length).toBeGreaterThan(0);

    for (const entry of civicDemoDatasetManifest) {
      expect(entry.demoOnly).toBe(true);
    }
  });

  it("keeps caution and linked dataset notes present and non-blank", () => {
    for (const entry of civicDemoDatasetManifest) {
      expect(entry.cautionNotes.length).toBeGreaterThan(0);
      expect(entry.linkedDatasetNotes.length).toBeGreaterThan(0);

      for (const note of entry.cautionNotes) {
        expect(typeof note).toBe("string");
        expect(note.trim().length).toBeGreaterThan(0);
      }

      for (const note of entry.linkedDatasetNotes) {
        expect(typeof note).toBe("string");
        expect(note.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps module ids unique through the existing manifest helper", () => {
    expect(hasUniqueCivicDemoModuleIds()).toBe(true);
  });

  it("keeps exposure levels limited to the non-operational taxonomy", () => {
    for (const entry of civicDemoDatasetManifest) {
      expect(allowedNonOperationalExposureLevels.has(entry.exposureLevel)).toBe(true);
    }
  });

  it("keeps manifest summary totals aligned with the manifest entries", () => {
    const summary = summarizeCivicDemoDatasetManifest();
    const firstEntry = civicDemoDatasetManifest[0];

    expect(firstEntry).toBeDefined();
    if (!firstEntry) {
      throw new Error("Expected at least one civic demo manifest entry");
    }

    const firstAreaCount = civicDemoDatasetManifest.filter(
      (entry) => entry.civicArea === firstEntry.civicArea,
    ).length;
    const firstStatusCount = civicDemoDatasetManifest.filter(
      (entry) => entry.demoStatus === firstEntry.demoStatus,
    ).length;

    expect(summary.total).toBe(civicDemoDatasetManifest.length);
    expect(summary.byArea[firstEntry.civicArea]).toBe(firstAreaCount);
    expect(summary.byStatus[firstEntry.demoStatus]).toBe(firstStatusCount);
    expect(summary.byArea[firstEntry.civicArea]).toBeGreaterThan(0);
    expect(summary.byStatus[firstEntry.demoStatus]).toBeGreaterThan(0);
  });
});
