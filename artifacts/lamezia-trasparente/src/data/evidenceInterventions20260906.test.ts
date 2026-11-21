import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_06 } from "./evidenceInterventions20260906";

describe("evidence interventions 2026-09-06", () => {
  it("contains only publishable, sourced and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_06).toHaveLength(4);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_06) {
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
      expect(item.lastVerifiedAt).toBe(item.id === "italy-emilia-romagna-municipal-unions-efficiency" ? "2026-11-08" : "2026-09-06");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("updates the existing Italian union case with independently verified 2025 service-level evidence, not a duplicate", () => {
    const unions = EVIDENCE_INTERVENTIONS_2026_09_06.filter(
      (item) => item.id === "italy-emilia-romagna-municipal-unions-efficiency",
    );
    expect(unions).toHaveLength(1);
    const record = unions[0];
    expect(record.lastVerifiedAt).toBe("2026-11-08");
    expect(record.revisionHistory.map((entry) => entry.date)).toContain("2026-09-06");
    expect(record.revisionHistory.map((entry) => entry.date)).toContain("2026-11-08");
    expect(record.evaluationStudies.filter((study) => study.doi === "10.1080/00343404.2025.2577917")).toHaveLength(1);
    expect(record.results).toContain("Gori");
    expect(record.results).toContain("NON equivale");
    expect(record.effectSize).toContain("−5,114 euro");
    expect(record.effectSize).toContain("−7,111%");
    expect(record.limitations.join(" ")).toContain("non sono repliche indipendenti");
    expect(record.evidenceStrength).toBe("moderata");
  });

  it("keeps mixed or non-causal evidence explicit", () => {
    const unions = EVIDENCE_INTERVENTIONS_2026_09_06.find(
      (item) => item.id === "italy-emilia-romagna-municipal-unions-efficiency",
    );
    expect(unions?.evidenceStrength).toBe("moderata");
    expect(unions?.results.toLowerCase()).toContain("non rileva un effetto statisticamente significativo");

    const sfpark = EVIDENCE_INTERVENTIONS_2026_09_06.find(
      (item) => item.id === "san-francisco-sfpark-demand-responsive-parking",
    );
    expect(sfpark?.effectSize).toContain("−43%");
    expect(sfpark?.effectSize).toContain("−30%");

    const laGrades = EVIDENCE_INTERVENTIONS_2026_09_06.find(
      (item) => item.id === "los-angeles-restaurant-hygiene-grade-cards",
    );
    expect(laGrades?.effectSize).toContain("−13,1%");
  });
});
