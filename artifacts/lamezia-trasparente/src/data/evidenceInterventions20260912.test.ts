import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_12 } from "./evidenceInterventions20260912";

describe("evidence interventions 2026-09-12", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_12).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_12) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.evaluationStudies.every((study) => study.url.startsWith("https://"))).toBe(true);
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-09-12");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("keeps causal estimates separate from descriptive or version-specific evidence", () => {
    const auditor = EVIDENCE_INTERVENTIONS_2026_09_12.find(
      (item) => item.id === "italy-random-municipal-auditor-assignment",
    );
    expect(auditor?.limitations.join(" ").toLowerCase()).toContain("working paper");
    expect(auditor?.effectSize.toLowerCase()).toContain("versioni pubbliche precedenti");

    const benchmarking = EVIDENCE_INTERVENTIONS_2026_09_12.find(
      (item) => item.id === "nyc-building-energy-benchmarking-disclosure",
    );
    expect(benchmarking?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(benchmarking?.effectSize).toContain("6%");
    expect(benchmarking?.effectSize).toContain("14%");

    const vacancyTax = EVIDENCE_INTERVENTIONS_2026_09_12.find(
      (item) => item.id === "vancouver-empty-homes-tax",
    );
    expect(vacancyTax?.effectSize).toContain("1,5 punti percentuali");
    expect(vacancyTax?.results.toLowerCase()).toContain("dati amministrativi");
    expect(vacancyTax?.limitations.join(" ").toLowerCase()).toContain("affitto medio");
  });
});
