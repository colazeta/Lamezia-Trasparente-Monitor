import { describe, expect, it } from "vitest";

import {
  performanceObjectiveCdrSummaries,
  performanceObjectiveCheckpoints,
  validatePerformanceObjectiveTimeline,
  type PerformanceObjectiveCdrSummary,
  type PerformanceObjectiveCheckpoint,
} from "@/data/performanceObjectiveTimeline";

describe("performance objective timeline", () => {
  it("builds only the three directly verified final phase checkpoints", () => {
    expect(validatePerformanceObjectiveTimeline()).toEqual([]);
    expect(performanceObjectiveCheckpoints).toHaveLength(3);
    expect(
      performanceObjectiveCheckpoints.map((checkpoint) => [
        checkpoint.objectiveId,
        checkpoint.date,
        checkpoint.progressPercent,
      ]),
    ).toEqual([
      ["2024-013", "2024-12-31", 90],
      ["2024-054", "2024-12-31", 100],
      ["2024-093", "2024-12-31", 100],
    ]);

    for (const checkpoint of performanceObjectiveCheckpoints) {
      expect(checkpoint.kind).toBe("phase-detail");
      expect(checkpoint.provenance).toBe("lt-derived-from-phases");
      expect(checkpoint.reconciliationStatus).toBe(
        "single-verified-observation",
      );
      expect(checkpoint.note).toMatch(/non equivale.*CDR.*OIV/i);
    }
  });

  it("does not turn indexed search values into CDR summary records", () => {
    expect(performanceObjectiveCdrSummaries).toEqual([]);
  });

  it("rejects a CDR summary backed only by metadata", () => {
    const invalid: PerformanceObjectiveCdrSummary = {
      id: "invalid-cdr-source",
      objectiveId: "2024-013",
      cdrLabel: "Settore Servizi alla Persona",
      objectiveWeightPercent: 3,
      reportedProgressPercent: 100,
      weightedContributionPercent: 3,
      checkpointDate: null,
      sourceDocumentId: "peg-2024-2026-performance",
      sourceLocator: "p. 89",
      note: null,
    };

    expect(validatePerformanceObjectiveTimeline(undefined, [invalid])).toContain(
      "CDR source lacks page verification: invalid-cdr-source",
    );
  });

  it("rejects an incoherent weighted CDR contribution", () => {
    const invalid: PerformanceObjectiveCdrSummary = {
      id: "invalid-cdr-math",
      objectiveId: "2024-013",
      cdrLabel: "Settore Servizi alla Persona",
      objectiveWeightPercent: 3,
      reportedProgressPercent: 100,
      weightedContributionPercent: 2,
      checkpointDate: "2024-09-30",
      sourceDocumentId: "performance-2024-monitoraggio-finale-13-54-93",
      sourceLocator: "p. 89",
      note: null,
    };

    expect(validatePerformanceObjectiveTimeline(undefined, [invalid])).toContain(
      "CDR weighted contribution mismatch: invalid-cdr-math",
    );
  });

  it("rejects checkpoint values outside the percentage range", () => {
    const invalid: PerformanceObjectiveCheckpoint = {
      ...performanceObjectiveCheckpoints[0],
      id: "invalid-checkpoint-progress",
      progressPercent: 101,
    };

    expect(validatePerformanceObjectiveTimeline([invalid], [])).toContain(
      "invalid checkpoint progress: invalid-checkpoint-progress",
    );
  });
});
