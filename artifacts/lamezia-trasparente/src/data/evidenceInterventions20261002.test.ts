import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_02 } from "./evidenceInterventions20261002";

describe("evidence interventions 2026-10-02", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_02).toHaveLength(3);
    for (const item of EVIDENCE_INTERVENTIONS_2026_10_02) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-10-02");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps Geneva normalized demand distinct from total passenger trips and fare revenue", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_02.find((x) => x.id === "geneva-public-transport-fare-reduction-synthetic-control");
    expect(item?.effectSize).toContain("+10,6%");
    expect(item?.effectSize).toContain("+3,7%");
    expect(item?.results.toLowerCase()).toContain("ricavi");
  });

  it("preserves the temporary nature and null outcomes of the Swedish BID evidence", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_02.find((x) => x.id === "sweden-small-town-bid-programme-did");
    expect(item?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(item?.effectSize).toContain("circa +7%");
    expect(item?.results.toLowerCase()).toContain("attenua");
    expect(item?.results.toLowerCase()).toContain("non significativi");
  });

  it("does not overstate causal health effects from the Ayrshire observational study", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_02.find((x) => x.id === "ayrshire-external-wall-insulation-health");
    expect(item?.evidenceStrength).toBe("moderata");
    expect(item?.evaluationMethod.toLowerCase()).toContain("osservazionale");
    expect(item?.effectSize).toContain("24%→9%");
    expect(item?.effectSize).toContain("+12,2%");
    expect(item?.effectSize.toLowerCase()).toContain("non viene materializzato un unico effect size causale");
  });
});
