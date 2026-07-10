import { describe, expect, it } from "vitest";

import { SOURCE_HEALTH } from "@/data/sourceHealth";

describe("SOURCE_HEALTH", () => {
  it("derives the public register from versioned evidence", () => {
    expect(SOURCE_HEALTH.sources).toHaveLength(5);
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
      expect(source.route).toMatch(/^\//);
      expect(source.sourceUrl).toMatch(/^https:\/\//);
      expect(source.lastCheckedAt).toBeTruthy();
      expect(source.traceabilityScore).toBeGreaterThanOrEqual(0);
      expect(source.traceabilityScore).toBeLessThanOrEqual(100);
      expect(source.freshnessScore).toBeGreaterThanOrEqual(0);
      expect(source.freshnessScore).toBeLessThanOrEqual(100);
    }
  });

  it("does not expose synthetic runtime sources", () => {
    const serialized = JSON.stringify(SOURCE_HEALTH).toLowerCase();

    expect(serialized).not.toContain("mock");
    expect(serialized).not.toContain("ai-briefs");
    expect(serialized).not.toContain("futuro payload");
  });
});
