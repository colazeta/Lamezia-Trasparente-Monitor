import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_29 } from "./evidenceInterventions20260929";

describe("evidence interventions 2026-09-29", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_29).toHaveLength(3);
    for (const item of EVIDENCE_INTERVENTIONS_2026_09_29) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-29");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps the conservative spillover-adjusted NYC lighting estimate", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_29.find(
      (x) => x.id === "nyc-public-housing-temporary-street-lighting-rct",
    );
    expect(item?.evidenceStrength).toBe("molto_forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("randomized controlled trial");
    expect(item?.effectSize).toContain("−36%");
    expect(item?.effectSize).toContain("−4%");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("temporaneo");
  });

  it("preserves Boston's long-run gains and null test-score finding", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_29.find(
      (x) => x.id === "boston-public-preschool-admissions-lottery-long-term",
    );
    expect(item?.evidenceStrength).toBe("molto_forte");
    expect(item?.effectSize).toContain("+8,3 p.p.");
    expect(item?.effectSize).toContain("+6,0 p.p.");
    expect(item?.effectSize).toContain("−0,8 p.p.");
    expect(item?.results.toLowerCase()).toContain("nessun effetto rilevabile");
  });

  it("does not overstate causal certainty for Brazilian participatory budgeting", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_29.find(
      (x) => x.id === "brazil-municipal-participatory-budgeting-health-sanitation",
    );
    expect(item?.evidenceStrength).toBe("moderata");
    expect(item?.evaluationMethod.toLowerCase()).toContain("fixed effects");
    expect(item?.effectSize).toContain("+2–3 p.p.");
    expect(item?.effectSize).toContain("−1/−2");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("endogena");
  });
});
