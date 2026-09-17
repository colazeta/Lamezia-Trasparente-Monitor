import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_16 } from "./evidenceInterventions20260916";

describe("evidence interventions 2026-09-16", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_16).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_16) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-16");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps Denver's Housing First effect separate from the SIB financing mechanism", () => {
    const denver = EVIDENCE_INTERVENTIONS_2026_09_16.find(
      (item) => item.id === "denver-supportive-housing-housing-first-sib",
    );
    expect(denver?.evaluationMethod.toLowerCase()).toContain("randomized controlled trial");
    expect(denver?.evaluationMethod).toContain("724");
    expect(denver?.evaluationMethod.toLowerCase()).toContain("non l'effetto causale del meccanismo finanziario");
    expect(denver?.effectSize).toContain("−27%");
    expect(denver?.effectSize).toContain("6.876 USD");
    expect(denver?.limitations.join(" ").toLowerCase()).toContain("social impact bond");
  });

  it("preserves Boston's long-term lottery evidence and the null test-score result", () => {
    const boston = EVIDENCE_INTERVENTIONS_2026_09_16.find(
      (item) => item.id === "boston-public-preschool-lottery-long-term",
    );
    expect(boston?.evaluationMethod.toLowerCase()).toContain("lotterie");
    expect(boston?.effectSize).toContain("+8,3");
    expect(boston?.effectSize).toContain("+6,0");
    expect(boston?.effectSize.toLowerCase()).toContain("nessun effetto rilevabile");
    expect(boston?.limitations.join(" ").toLowerCase()).toContain("1997–2003");
    expect(boston?.evaluationStudies.some((study) => study.doi === "10.1093/qje/qjac036")).toBe(true);
  });

  it("keeps Buenos Aires at moderate strength and does not equate price gaps with corruption", () => {
    const buenosAires = EVIDENCE_INTERVENTIONS_2026_09_16.find(
      (item) => item.id === "buenos-aires-hospital-procurement-price-monitoring",
    );
    expect(buenosAires?.evidenceStrength).toBe("moderata");
    expect(buenosAires?.evaluationMethod.toLowerCase()).toContain("before-after");
    expect(buenosAires?.effectSize).toContain("−14,6%");
    expect(buenosAires?.effectSize).toContain("−9,7%");
    expect(buenosAires?.limitations.join(" ").toLowerCase()).toContain("proxy imperfetto");
    expect(buenosAires?.results.toLowerCase()).toContain("non dimostra");
  });
});
