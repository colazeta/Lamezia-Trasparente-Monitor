import { describe, expect, it } from "vitest";

import {
  getPerformanceRegistryStats,
  performanceObjectiveRecords,
  performanceSourceDocuments,
  validatePerformanceObjectiveRegistry,
  type PerformanceObjectiveRecord,
} from "@/data/performanceObjectiveRegistry";

describe("performance objective registry", () => {
  it("contains only official, structurally valid sources", () => {
    expect(performanceSourceDocuments.length).toBeGreaterThanOrEqual(4);
    expect(validatePerformanceObjectiveRegistry()).toEqual([]);

    for (const source of performanceSourceDocuments) {
      expect(source.officialUrl.startsWith("https://")).toBe(true);
      expect(source.acquisitionStatus).toBe("metadata-verified");
      expect(source.objectiveExtractionStatus).toBe("pending");
    }
  });

  it("does not convert unverified PDF/search snippets into objective records", () => {
    expect(performanceObjectiveRecords).toEqual([]);

    const stats = getPerformanceRegistryStats();
    expect(stats.sourceDocuments).toBe(performanceSourceDocuments.length);
    expect(stats.objectiveDefinitionSources).toBeGreaterThan(0);
    expect(stats.validationSources).toBeGreaterThan(0);
    expect(stats.objectiveRecords).toBe(0);
  });

  it("rejects a target without an indicator", () => {
    const invalidObjective: PerformanceObjectiveRecord = {
      id: "invalid-target",
      cycle: "2025",
      title: "Obiettivo di test",
      sourceDocumentId: performanceSourceDocuments[0].id,
      sourceLocator: "p. 1",
      strategicArea: null,
      office: null,
      responsible: null,
      indicatorTitle: null,
      baseline: null,
      target: "100%",
      result: null,
      evidenceUrl: null,
      validationSourceUrl: null,
      validationStatus: "planned",
      note: null,
    };

    expect(
      validatePerformanceObjectiveRegistry(performanceSourceDocuments, [invalidObjective]),
    ).toContain("target without indicator: invalid-target");
  });

  it("rejects a validated objective without a validation source", () => {
    const invalidObjective: PerformanceObjectiveRecord = {
      id: "invalid-validation",
      cycle: "2025",
      title: "Obiettivo di test",
      sourceDocumentId: performanceSourceDocuments[0].id,
      sourceLocator: "p. 1",
      strategicArea: null,
      office: null,
      responsible: null,
      indicatorTitle: "Indicatore",
      baseline: null,
      target: "100%",
      result: null,
      evidenceUrl: null,
      validationSourceUrl: null,
      validationStatus: "validated",
      note: null,
    };

    expect(
      validatePerformanceObjectiveRegistry(performanceSourceDocuments, [invalidObjective]),
    ).toContain(
      "validated objective without validation source: invalid-validation",
    );
  });
});
