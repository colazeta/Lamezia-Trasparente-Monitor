import { describe, expect, it } from "vitest";

import { OPEN_DATA_DATASET_REGISTRY } from "@/data/openDataDatasetRegistry";
import { assessSourceHealth, SOURCE_HEALTH } from "@/data/sourceHealth";

describe("SOURCE_HEALTH", () => {
  it("derives the public register from versioned evidence", () => {
    expect(SOURCE_HEALTH.sources).toHaveLength(8);
    expect(SOURCE_HEALTH.generatedAt).toBeTruthy();
    expect(SOURCE_HEALTH.traceabilityScore).toBeGreaterThan(0);
    expect(SOURCE_HEALTH.freshnessScore).toBeGreaterThanOrEqual(0);
    expect(SOURCE_HEALTH.freshnessScore).toBeLessThanOrEqual(100);
  });

  it("keeps every integrated source traceable", () => {
    const ids = new Set(SOURCE_HEALTH.sources.map((source) => source.id));

    expect(ids.size).toBe(SOURCE_HEALTH.sources.length);
    for (const source of SOURCE_HEALTH.sources) {
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

  it("reports exact Open Data coverage without hiding unmonitored datasets", () => {
    const monitoredDatasetIds = new Set(
      SOURCE_HEALTH.sources
        .map((source) => source.openDataDatasetId)
        .filter((id): id is string => Boolean(id)),
    );
    const missingDatasetIds = OPEN_DATA_DATASET_REGISTRY.filter(
      (dataset) => !monitoredDatasetIds.has(dataset.id),
    ).map((dataset) => dataset.id);
    const published = OPEN_DATA_DATASET_REGISTRY.length;
    const monitored = published - missingDatasetIds.length;
    const percentage =
      published === 0 ? 100 : Math.round((monitored / published) * 100);

    expect(SOURCE_HEALTH.openDataCoverage).toMatchObject({
      published,
      monitored,
      percentage,
    });
    expect(SOURCE_HEALTH.openDataCoverage.missingDatasetIds).toHaveLength(
      missingDatasetIds.length,
    );
    expect(SOURCE_HEALTH.openDataCoverage.missingDatasetIds).toEqual(
      expect.arrayContaining(missingDatasetIds),
    );
    expect(monitoredDatasetIds.size).toBe(monitored);
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

  it("does not expose synthetic runtime sources", () => {
    const serialized = JSON.stringify(SOURCE_HEALTH).toLowerCase();

    expect(serialized).not.toContain("mock");
    expect(serialized).not.toContain("ai-briefs");
    expect(serialized).not.toContain("futuro payload");
  });
});
