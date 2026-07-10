import { describe, expect, it } from "vitest";

import { assessSourceHealth, SOURCE_HEALTH } from "@/data/sourceHealth";

describe("SOURCE_HEALTH", () => {
  it("derives the public register from versioned evidence", () => {
    expect(SOURCE_HEALTH.sources).toHaveLength(7);
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

  it("covers every dataset published in the Open Data archive", () => {
    expect(SOURCE_HEALTH.openDataCoverage).toEqual({
      published: 5,
      monitored: 5,
      percentage: 100,
      missingDatasetIds: [],
    });

    const datasetIds = SOURCE_HEALTH.sources
      .map((source) => source.openDataDatasetId)
      .filter(Boolean);
    expect(new Set(datasetIds).size).toBe(5);
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
