import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_05 } from "./evidenceInterventions20260905";

describe("evidence interventions 2026-09-05", () => {
  it("contains only publishable, sourced and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_05).toHaveLength(4);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_05) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-05");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("keeps material null or adverse findings visible", () => {
    const thimphu = EVIDENCE_INTERVENTIONS_2026_09_05.find(
      (item) => item.id === "thimphu-household-waste-segregation-rct",
    );
    expect(thimphu?.results.toLowerCase()).toContain("non emerge");
    expect(thimphu?.unintendedEffects.toLowerCase()).toContain("rifiuto pericoloso");

    const sare = EVIDENCE_INTERVENTIONS_2026_09_05.find(
      (item) => item.id === "mexico-sare-rapid-business-registration",
    );
    expect(sare?.effectSize).toContain("−3%");

    const audit = EVIDENCE_INTERVENTIONS_2026_09_05.find(
      (item) => item.id === "indonesia-village-road-audit-rct",
    );
    expect(audit?.results.toLowerCase()).toContain("non significativi");
  });
});
