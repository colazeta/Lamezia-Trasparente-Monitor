import { describe, expect, it } from "vitest";

import {
  deriveWeightedPhaseProgress,
  getPerformanceRegistryStats,
  performanceObjectiveRecords,
  performanceSourceDocuments,
  validatePerformanceObjectiveRegistry,
  type PerformanceObjectiveRecord,
} from "@/data/performanceObjectiveRegistry";

describe("performance objective registry", () => {
  it("contains only official, structurally valid sources", () => {
    expect(performanceSourceDocuments.length).toBeGreaterThanOrEqual(5);
    expect(validatePerformanceObjectiveRegistry()).toEqual([]);

    const finalMonitoring = performanceSourceDocuments.find(
      (source) => source.id === "performance-2024-monitoraggio-finale-13-54-93",
    );
    expect(finalMonitoring).toMatchObject({
      type: "MONITORAGGIO",
      acquisitionStatus: "indexed-page-verified",
      objectiveExtractionStatus: "verified",
    });
    expect(finalMonitoring?.officialUrl).toContain("municipiumapp.it");
  });

  it("materialises the first three page-verified 2024 objective records", () => {
    expect(performanceObjectiveRecords.map((objective) => objective.id)).toEqual([
      "2024-013",
      "2024-054",
      "2024-093",
    ]);

    expect(
      performanceObjectiveRecords.map((objective) =>
        deriveWeightedPhaseProgress(objective),
      ),
    ).toEqual([90, 100, 100]);

    for (const objective of performanceObjectiveRecords) {
      expect(objective.validationStatus).toBe("monitored");
      expect(objective.resultProvenance).toBe("lt-derived-from-phases");
      expect(objective.target).toBeNull();
      expect(objective.indicatorTitle).toBeNull();
      expect(objective.evidenceUrl).toContain("municipiumapp.it");
      expect(objective.phases.length).toBeGreaterThan(0);
      expect(
        objective.phases.reduce(
          (sum, phase) => sum + (phase.weightPercent ?? 0),
          0,
        ),
      ).toBe(100);
    }

    const stats = getPerformanceRegistryStats();
    expect(stats.objectiveRecords).toBe(3);
    expect(stats.withPhases).toBe(3);
    expect(stats.withResult).toBe(3);
    expect(stats.withEvidence).toBe(3);
    expect(stats.withTarget).toBe(0);
    expect(stats.withOivValidation).toBe(0);
  });

  it("keeps the non-completed third phase of objective 13 explicit", () => {
    const objective13 = performanceObjectiveRecords.find(
      (objective) => objective.id === "2024-013",
    );
    expect(objective13?.phases).toHaveLength(3);
    expect(objective13?.phases[2]).toMatchObject({
      id: "F03",
      title: "Conferimento incarico",
      weightPercent: 10,
      expectedResult: "Disciplinare / Contratto",
      finalProgressPercent: 0,
      finalStatus: "not-completed",
      sourceLocator: "p. 92",
    });
    expect(deriveWeightedPhaseProgress(objective13!)).toBe(90);
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
      objectiveType: null,
      indicatorTitle: null,
      baseline: null,
      target: "100%",
      result: null,
      resultProvenance: null,
      phases: [],
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
      objectiveType: null,
      indicatorTitle: "Indicatore",
      baseline: null,
      target: "100%",
      result: null,
      resultProvenance: null,
      phases: [],
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

  it("rejects a derived result that does not match the phase weights", () => {
    const valid = performanceObjectiveRecords[0];
    const invalidObjective: PerformanceObjectiveRecord = {
      ...valid,
      id: "invalid-derived-result",
      result: "100%",
    };

    expect(
      validatePerformanceObjectiveRegistry(performanceSourceDocuments, [invalidObjective]),
    ).toContain("derived result mismatch: invalid-derived-result");
  });
});
