import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_05_SPECIAL } from "./evidenceInterventions20260905Special";

describe("special evidence interventions 2026-09-05", () => {
  it("contains only publishable, sourced and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_05_SPECIAL).toHaveLength(2);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_05_SPECIAL) {
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
    }
  });

  it("preserves the adverse and null findings that constrain transfer", () => {
    const baoshan = EVIDENCE_INTERVENTIONS_2026_09_05_SPECIAL.find(
      (item) => item.id === "baoshan-weekly-property-tax-reminders-rct",
    );
    expect(baoshan?.results.toLowerCase()).toContain("rendimenti decrescenti");
    expect(baoshan?.effectSize).toContain("non statisticamente significativo");

    const lambeth = EVIDENCE_INTERVENTIONS_2026_09_05_SPECIAL.find(
      (item) => item.id === "lambeth-simplified-council-tax-bill-rct",
    );
    expect(lambeth?.results.toLowerCase()).toContain("ridotto il tasso di pagamento");
    expect(lambeth?.unintendedEffects.toLowerCase()).toContain("norma sociale");
  });
});
