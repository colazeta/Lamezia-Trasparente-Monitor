import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_14 } from "./evidenceInterventions20260914";

describe("evidence interventions 2026-09-14", () => {
  it("contains only sourced, publishable and taxonomically valid new records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_14).toHaveLength(2);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_14) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-14");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("preserves the PAYT design and the distinction between tariffing and measurement", () => {
    const payt = EVIDENCE_INTERVENTIONS_2026_09_14.find(
      (item) => item.id === "emilia-romagna-payt-tariffa-puntuale",
    );
    expect(payt?.evaluationMethod).toContain("Synthetic DiD");
    expect(payt?.effectSize).toContain("+10 punti percentuali");
    expect(payt?.interventionStatus).toContain("134 applicano TTP/TCP");
    expect(payt?.limitations.join(" ").toLowerCase()).toContain("sola misurazione");
    expect(payt?.unintendedEffects.toLowerCase()).toContain("abbandono");
  });

  it("keeps Chicago violence effects separate from null employment and schooling outcomes", () => {
    const chicago = EVIDENCE_INTERVENTIONS_2026_09_14.find(
      (item) => item.id === "chicago-one-summer-plus-youth-jobs-rct",
    );
    expect(chicago?.evaluationMethod.toLowerCase()).toContain("randomized controlled trial");
    expect(chicago?.effectSize).toContain("−43%");
    expect(chicago?.effectSize).toContain("3,95");
    expect(chicago?.results.toLowerCase()).toContain("non emergono effetti statisticamente significativi");
    expect(chicago?.limitations.join(" ").toLowerCase()).toContain("external validity");
  });

  it("updates Philadelphia in place with the mental-health RCT evidence", () => {
    const philadelphia = EVIDENCE_INTERVENTIONS.filter(
      (item) => item.id === "philadelphia-vacant-lot-greening",
    );
    expect(philadelphia).toHaveLength(1);
    expect(philadelphia[0]?.lastVerifiedAt).toBe("2026-09-14");
    expect(philadelphia[0]?.effectSize).toContain("−41,5%");
    expect(philadelphia[0]?.effectSize).toContain("p=0,051");
    expect(philadelphia[0]?.evaluationStudies.some((study) => study.doi === "10.1001/jamanetworkopen.2018.0298")).toBe(true);
    expect(philadelphia[0]?.revisionHistory.at(-1)?.date).toBe("2026-09-14");
  });
});
