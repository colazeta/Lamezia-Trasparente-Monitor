import { describe, expect, it } from "vitest";

import {
  buildOpenDataCatalogStatistics,
  OPEN_DATA_DATASET_REGISTRY,
  OPEN_DATA_SOURCE_REGISTRY,
  OPEN_DATA_THEME_LIBRARY,
} from "../data/openDataDatasetRegistry";

describe("OpenData canonical dataset registry", () => {
  it("keeps one structural registration for every curated dataset", () => {
    const ids = OPEN_DATA_DATASET_REGISTRY.map((dataset) => dataset.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(OPEN_DATA_DATASET_REGISTRY).toHaveLength(6);
    expect(
      OPEN_DATA_DATASET_REGISTRY.every(
        (dataset) => dataset.layer === "canonical",
      ),
    ).toBe(true);
  });

  it("links every dataset to a known theme, source and family", () => {
    const themeIds = new Set(OPEN_DATA_THEME_LIBRARY.map((theme) => theme.id));
    const sourceIds = new Set(
      OPEN_DATA_SOURCE_REGISTRY.map((source) => source.id),
    );

    for (const dataset of OPEN_DATA_DATASET_REGISTRY) {
      expect(themeIds.has(dataset.themeId)).toBe(true);
      expect(sourceIds.has(dataset.sourceId)).toBe(true);
      expect(dataset.familyId).toBeTruthy();
      expect(dataset.familyLabel).toBeTruthy();
      expect(dataset.formats.length).toBeGreaterThan(0);
      expect(dataset.geographicCoverage).toBeTruthy();
    }
  });

  it("groups related household views into the same dataset family", () => {
    const householdDatasets = OPEN_DATA_DATASET_REGISTRY.filter(
      (dataset) => dataset.familyId === "households",
    );

    expect(householdDatasets.map((dataset) => dataset.id)).toEqual(
      expect.arrayContaining([
        "lamezia-household-composition-2023",
        "lamezia-families-children",
      ]),
    );
    expect(householdDatasets).toHaveLength(2);
  });

  it("derives catalogue statistics without hard-coded counters", () => {
    const stats = buildOpenDataCatalogStatistics(
      new Date("2026-09-02T12:00:00.000Z"),
    );

    expect(stats.totalDatasets).toBe(OPEN_DATA_DATASET_REGISTRY.length);
    expect(stats.totalFamilies).toBe(5);
    expect(stats.publishedThemes).toBe(3);
    expect(stats.totalSources).toBe(4);
    expect(stats.totalFormats).toBe(2);
    expect(stats.documentedStatusDatasets).toBe(6);
    expect(stats.automatedDatasets).toBe(5);
    expect(stats.temporalCoverage).toMatchObject({
      from: "1991",
      to: "2026",
      label: "1991–2026",
    });
    expect(stats.recentlyUpdated).toHaveLength(5);
    expect(stats.byTheme.find((item) => item.id === "population-society"))
      .toMatchObject({ count: 4 });
    expect(stats.bySource.find((item) => item.id === "istat")).toMatchObject({
      count: 2,
    });
    expect(stats.byFormat.find((item) => item.id === "json")).toMatchObject({
      count: 6,
    });
  });

  it("makes missing metadata visible in the completeness statistic", () => {
    const stats = buildOpenDataCatalogStatistics(
      new Date("2026-09-02T12:00:00.000Z"),
    );

    expect(stats.metadataCompletenessPct).toBeGreaterThan(0);
    expect(stats.metadataCompletenessPct).toBeLessThan(100);
    expect(stats.missingMetadataFields).toBeGreaterThan(0);
  });
});
