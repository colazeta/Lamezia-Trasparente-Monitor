import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_07 } from "./evidenceInterventions20261007";

describe("evidence interventions 2026-10-07", () => {
  it("keeps daily records publishable, taxonomically valid and unique", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_07).toHaveLength(2);
    for (const item of EVIDENCE_INTERVENTIONS_2026_10_07) {
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
      item.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(item.lastVerifiedAt).toBe("2026-10-07");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("preserves the New Taipei estimates and spillover caveat", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_07.find(
      (x) => x.id === "new-taipei-unit-based-garbage-bag-pricing",
    );
    expect(item?.effectSize).toContain("−40%");
    expect(item?.effectSize).toContain("+15%");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("illegal dumping");
  });

  it("preserves the Berkeley effect estimates and legal-transferability caveat", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_07.find(
      (x) => x.id === "berkeley-sugar-sweetened-beverage-distributor-tax",
    );
    expect(item?.effectSize).toContain("−21%");
    expect(item?.effectSize).toContain("−0,55");
    expect(item?.evaluationStudies.map((study) => study.doi)).toContain(
      "10.2105/AJPH.2016.303362",
    );
    expect(item?.limitations.join(" ").toLowerCase()).toContain("potestà");
  });
});
