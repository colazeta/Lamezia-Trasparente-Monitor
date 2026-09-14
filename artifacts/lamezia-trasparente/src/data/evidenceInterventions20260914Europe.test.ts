import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_14_EUROPE } from "./evidenceInterventions20260914Europe";

describe("evidence interventions 2026-09-14 Europe", () => {
  it("contains a sourced, publishable and taxonomically valid Mini-Holland record", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_14_EUROPE).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_09_14_EUROPE[0];

    expect(item.id).toBe("london-mini-hollands-active-travel");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
    for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.evidenceStrength).toBe("forte");
    expect(item.primarySource.url.startsWith("https://")).toBe(true);
    expect(item.evaluationStudies.every((study) => study.url.startsWith("https://"))).toBe(true);
    expect(item.lastVerifiedAt).toBe("2026-09-14");
  });

  it("preserves the longitudinal counterfactual, observed effects and modelled benefit caveat", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_14_EUROPE[0];
    expect(item.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(item.comparator.toLowerCase()).toContain("altri borough esterni");
    expect(item.effectSize).toContain("+41,0");
    expect(item.effectSize).toContain("+44,0");
    expect(item.effectSize).toContain("+41,5");
    expect(item.effectSize).toContain("£724");
    expect(item.effectSize.toLowerCase()).toContain("proiezione");
    expect(item.limitations.join(" ").toLowerCase()).toContain("modellato");
  });
});
