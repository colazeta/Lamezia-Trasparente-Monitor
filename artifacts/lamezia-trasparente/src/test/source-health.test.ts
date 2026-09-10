import { MUNICIPAL_FIXTURES } from "./fixtures/municipalDemographics";
import { validateMunicipalSnapshot } from "@/data/municipalDemographics";
import { describe, expect, it } from "vitest";

import {
  assessSourceHealth,
  buildSourceHealth,
  SOURCE_HEALTH,
} from "@/data/sourceHealth";

const hydrated = buildSourceHealth(
  {
    population: validateMunicipalSnapshot(
      MUNICIPAL_FIXTURES.population,
      "population",
    ),
    "foreign-age-sex": validateMunicipalSnapshot(
      MUNICIPAL_FIXTURES["foreign-age-sex"],
      "foreign-age-sex",
    ),
    "families-children": validateMunicipalSnapshot(
      MUNICIPAL_FIXTURES["families-children"],
      "families-children",
    ),
  },
  {
    series: {
      seriesKey: "population-resident-jan1",
      source: "ISTAT",
      sourceUrl: "https://esploradati.istat.it",
    },
    current: [{ period: "2025", acquiredAt: "2026-09-01T00:00:00Z" }],
    releases: [{ acquiredAt: "2026-09-01T00:00:00Z", releaseDate: null }],
  },
);

describe("SOURCE_HEALTH", () => {
  it("derives the public register from versioned evidence", () => {
    expect(SOURCE_HEALTH.sources).toHaveLength(11);
    expect(SOURCE_HEALTH.generatedAt).toBeTruthy();
    expect(SOURCE_HEALTH.traceabilityScore).toBeGreaterThan(0);
    expect(SOURCE_HEALTH.freshnessScore).toBeGreaterThanOrEqual(0);
    expect(SOURCE_HEALTH.freshnessScore).toBeLessThanOrEqual(100);
  });

  it("keeps every integrated source traceable", () => {
    const ids = new Set(SOURCE_HEALTH.sources.map((source) => source.id));

    expect(ids.size).toBe(SOURCE_HEALTH.sources.length);
    for (const source of hydrated.sources) {
      expect(source.name).toBeTruthy();
      expect(source.evidenceLabel).toBeTruthy();
      expect(source.metricLabel).toBeTruthy();
      expect(source.cautionNote).toBeTruthy();
      expect(source.statusReason).toBeTruthy();
      expect(source.history.length).toBeGreaterThan(0);
      expect(source.route).toMatch(/^\//);
      expect(source.sourceUrl).toMatch(/^https:\/\//);
      expect(source.lastCheckedAt).toBeTruthy();
      expect(source.traceabilityScore).toBeGreaterThanOrEqual(0);
      expect(source.traceabilityScore).toBeLessThanOrEqual(100);
      expect(source.freshnessScore).toBeGreaterThanOrEqual(0);
      expect(source.freshnessScore).toBeLessThanOrEqual(100);
    }
  });

  it("covers every dataset published in the Open Data archive", () => {
    expect(SOURCE_HEALTH.openDataCoverage).toEqual({
      published: 9,
      monitored: 9,
      percentage: 100,
      missingDatasetIds: [],
    });

    const datasetIds = SOURCE_HEALTH.sources
      .map((source) => source.openDataDatasetId)
      .filter(Boolean);
    expect(new Set(datasetIds).size).toBe(9);
  });

  it("keeps household verification separate from the ISTAT source update", () => {
    const household = SOURCE_HEALTH.sources.find(
      (source) => source.id === "opendata-famiglie-componenti-2023",
    );

    expect(household).toMatchObject({
      lastCheckedAt: "2026-09-01T18:11:15.000Z",
      lastUpdatedAt: "2026-06-09",
    });
    expect(household?.lastCheckedAt).not.toBe(household?.lastUpdatedAt);
  });

  it("explains missing, stale and warning states without substantive claims", () => {
    expect(
      assessSourceHealth({ value: null, expectedDays: 1, traceability: 100 }),
    ).toMatchObject({
      status: "missing",
      reason: expect.stringMatching(/timestamp/i),
    });

    expect(
      assessSourceHealth({
        value: "2020-01-01T00:00:00.000Z",
        expectedDays: 1,
        traceability: 100,
      }),
    ).toMatchObject({
      status: "stale",
      reason: expect.stringMatching(/soglia tecnica/i),
    });

    expect(
      assessSourceHealth({
        value: new Date().toISOString(),
        expectedDays: 30,
        traceability: 100,
        hasWarnings: true,
      }),
    ).toMatchObject({
      status: "warning",
      reason: expect.stringMatching(/controllo manuale/i),
    });
  });

  it("does not substitute static counts when the canonical data is unavailable", () => {
    for (const id of [
      "opendata-popolazione-comunale",
      "opendata-residenti-stranieri",
      "opendata-famiglie-figli",
      "opendata-trend-demografico",
    ]) {
      const row = SOURCE_HEALTH.sources.find((s) => s.id === id)!;
      expect(row.status).toBe("missing");
      expect(row.lastCheckedAt).toBeNull();
      expect(row.metricLabel).not.toMatch(/\b(25|19|6|6616|13358)\b/);
    }
  });
  it("keeps municipal and ISTAT identity and source/import timestamps separate", () => {
    const municipal = hydrated.sources.find(
      (s) => s.id === "opendata-popolazione-comunale",
    )!;
    const istat = hydrated.sources.find(
      (s) => s.id === "opendata-trend-demografico",
    )!;
    expect(municipal.lastCheckedAt).toBe(
      MUNICIPAL_FIXTURES.population.provenance.source_generated_at,
    );
    expect(municipal.lastCheckedAt).not.toBe(
      MUNICIPAL_FIXTURES.population.provenance.acquired_at,
    );
    expect(municipal.openDataDatasetId).toBeUndefined();
    expect(istat.openDataDatasetId).toBe("lamezia-demographic-trend");
    expect(istat.sourceUrl).toContain("istat.it");
  });
  it("does not expose synthetic runtime sources", () => {
    const serialized = JSON.stringify(SOURCE_HEALTH).toLowerCase();

    expect(serialized).not.toContain("mock");
    expect(serialized).not.toContain("ai-briefs");
    expect(serialized).not.toContain("futuro payload");
  });
});
