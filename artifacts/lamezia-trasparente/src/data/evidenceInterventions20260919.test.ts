import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_19 } from "./evidenceInterventions20260919";

describe("evidence interventions 2026-09-19", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_19).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_19) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-19");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps B-MINCOME's material gains separate from labour and health trade-offs", () => {
    const bmincome = EVIDENCE_INTERVENTIONS_2026_09_19.find(
      (item) => item.id === "barcelona-bmincome-guaranteed-income-active-policies",
    );
    expect(bmincome?.evidenceStrength).toBe("molto_forte");
    expect(bmincome?.evaluationMethod.toLowerCase()).toContain("stratified lottery");
    expect(bmincome?.evaluationMethod).toContain("1.524");
    expect(bmincome?.effectSize).toContain("−0,080");
    expect(bmincome?.effectSize).toContain("−0,213");
    expect(bmincome?.effectSize).toContain("−0,130");
    expect(bmincome?.results.toLowerCase()).toContain("partecipazione al lavoro");
    expect(bmincome?.limitations.join(" ").toLowerCase()).toContain("esiti di salute");
    expect(bmincome?.evaluationStudies.some((study) => study.doi === "10.1515/bis-2021-0047")).toBe(true);
  });

  it("does not overstate the stroke result in the New York trans-fat evaluation", () => {
    const transFat = EVIDENCE_INTERVENTIONS_2026_09_19.find(
      (item) => item.id === "new-york-local-trans-fat-restrictions-cardiovascular",
    );
    expect(transFat?.evidenceStrength).toBe("forte");
    expect(transFat?.evaluationMethod).toContain("undici");
    expect(transFat?.evaluationMethod).toContain("venticinque");
    expect(transFat?.effectSize).toContain("−6,2%");
    expect(transFat?.effectSize).toContain("−7,8%");
    expect(transFat?.effectSize).toContain("−3,6%");
    expect(transFat?.effectSize.toLowerCase()).toContain("non statisticamente significativo");
    expect(transFat?.limitations.join(" ").toLowerCase()).toContain("confondimento residuo");
    expect(
      transFat?.evaluationStudies.some((study) => study.doi === "10.1001/jamacardio.2017.0491"),
    ).toBe(true);
  });

  it("keeps Chicago's operational validation distinct from health-outcome causality", () => {
    const chicago = EVIDENCE_INTERVENTIONS_2026_09_19.find(
      (item) => item.id === "chicago-predictive-food-inspection-prioritization",
    );
    expect(chicago?.evidenceStrength).toBe("moderata");
    expect(chicago?.evaluationMethod.toLowerCase()).toContain("out-of-sample");
    expect(chicago?.evaluationMethod).toContain("60 giorni");
    expect(chicago?.effectSize).toContain("Circa 7 giorni");
    expect(chicago?.effectSize).toContain("69%");
    expect(chicago?.limitations.join(" ").toLowerCase()).toContain("non è un trial randomizzato");
    expect(chicago?.limitations.join(" ").toLowerCase()).toContain("non una riduzione direttamente misurata");
  });
});
