import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_17 } from "./evidenceInterventions20260917";

describe("evidence interventions 2026-09-17", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_17).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_17) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-17");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps the NYC tactical-lighting RCT separate from permanent MAP installations", () => {
    const nyc = EVIDENCE_INTERVENTIONS_2026_09_17.find(
      (item) => item.id === "nyc-public-housing-street-lighting-rct",
    );
    expect(nyc?.evaluationMethod.toLowerCase()).toContain("randomized controlled field experiment");
    expect(nyc?.evaluationMethod).toContain("77");
    expect(nyc?.evaluationMethod).toContain("39 treatment");
    expect(nyc?.evaluationMethod).toContain("38 control");
    expect(nyc?.effectSize).toContain("−60%");
    expect(nyc?.effectSize).toContain("−36%");
    expect(nyc?.limitations.join(" ").toLowerCase()).toContain("temporanea");
    expect(nyc?.limitations.join(" ").toLowerCase()).toContain("displacement");
  });

  it("preserves Auckland's synthetic-control identification and counterfactual interpretation", () => {
    const auckland = EVIDENCE_INTERVENTIONS_2026_09_17.find(
      (item) => item.id === "auckland-unitary-plan-upzoning-housing",
    );
    expect(auckland?.evidenceStrength).toBe("forte");
    expect(auckland?.evaluationMethod.toLowerCase()).toContain("synthetic control");
    expect(auckland?.effectSize).toContain("×2");
    expect(auckland?.effectSize).toContain("52.200");
    expect(auckland?.effectSize).toContain("46%");
    expect(auckland?.effectSize).toContain("−23,0%");
    expect(auckland?.limitations.join(" ").toLowerCase()).toContain("controfattuale modellato");
    expect(
      auckland?.evaluationStudies.some((study) => study.doi === "10.1016/j.econmod.2026.107592"),
    ).toBe(true);
    expect(auckland?.evaluationStudies.some((study) => study.doi === "10.1111/ecin.70075")).toBe(
      true,
    );
  });

  it("keeps Acayucan's randomized assignment separate from actual paving and preserves the tax follow-up", () => {
    const acayucan = EVIDENCE_INTERVENTIONS_2026_09_17.find(
      (item) => item.id === "acayucan-street-paving-rct-tax-compliance",
    );
    expect(acayucan?.evidenceStrength).toBe("molto_forte");
    expect(acayucan?.evaluationMethod).toContain("56");
    expect(acayucan?.evaluationMethod).toContain("28");
    expect(acayucan?.evaluationMethod).toContain("1.231");
    expect(acayucan?.evaluationMethod.toLowerCase()).toContain("intent-to-treat");
    expect(acayucan?.effectSize).toContain("+16%");
    expect(acayucan?.effectSize).toContain("+54%");
    expect(acayucan?.effectSize).toContain("+1,5 p.p.");
    expect(acayucan?.effectSize).toContain("+2,6 p.p.");
    expect(acayucan?.limitations.join(" ").toLowerCase()).toContain("non tutti i progetti assegnati");
  });
});
