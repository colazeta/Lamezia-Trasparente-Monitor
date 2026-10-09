import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_09 } from "./evidenceInterventions20261009";

describe("municipal evidence batch 2026-10-09", () => {
  it("adds one verified intervention without duplicates", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_09).toHaveLength(1);
    for (const item of EVIDENCE_INTERVENTIONS_2026_10_09) {
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
      item.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-10-09");
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((other) => other.id === item.id)).toHaveLength(1);
    }
  });

  it("separates the lottery's recognition effect from the physical works LATE", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_09[0];
    expect(item.effectSize).toContain("IV/LATE");
    expect(item.effectSize).toContain("+7,1 p.p.");
    expect(item.results).toContain("+5,4");
    expect(item.limitations.join(" ")).toContain("IV/LATE");
  });

  it("does not duplicate the Barcelona B-MINCOME intervention recorded in September", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_09.some((item) => item.id.includes("b-mincome"))).toBe(false);
    expect(EVIDENCE_INTERVENTIONS.filter((item) => item.id === "barcelona-bmincome-guaranteed-income-pilot")).toHaveLength(1);
  });
});
