import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_03 } from "./evidenceInterventions20261003";

describe("evidence interventions 2026-10-03", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_03).toHaveLength(1);
    for (const item of EVIDENCE_INTERVENTIONS_2026_10_03) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-10-03");
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("preserves the Water Smart Landscapes identification and transfer caveats", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_03[0];
    expect(item.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(item.effectSize).toContain("−20%");
    expect(item.effectSize).toContain("1,88");
    expect(item.evaluationStudies.some((s) => s.doi === "10.1016/j.jeem.2020.102402")).toBe(true);
    expect(item.limitations.join(" ").toLowerCase()).toContain("las vegas");
    expect(item.unintendedEffects.toLowerCase()).toContain("ombra");
  });
});
