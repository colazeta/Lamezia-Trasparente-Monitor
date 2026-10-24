import { describe, expect, it } from "vitest";

import {
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_THEMATIC_AREAS,
  EVIDENCE_STRENGTHS,
  EVIDENCE_IMPLEMENTABILITY,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_24 } from "./evidenceInterventions20261024";

const studyDoi = "10.1016/S2468-2667(26)00023-X";

describe("24 October 2026 evidence intervention — Dutch social housing", () => {
  it("has exactly one stable, sourced, searchable record", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_24).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_10_24[0];
    expect(item.id).toBe("netherlands-social-housing-energy-retrofits-child-respiratory-health");
    expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    expect(item.lastVerifiedAt).toBe("2026-10-24");
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.evaluationStudies.some((study) => study.doi === studyDoi)).toBe(true);
    expect(item.revisionHistory.length).toBeGreaterThan(0);
  });

  it("preserves the fixed taxonomies and publication quality gate", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_24[0];
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
    for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.evidenceStrength).not.toBe("da_verificare");
    expect(item.evaluationMethod).toMatch(/difference-in-differences/i);
    expect(item.comparator.length).toBeGreaterThan(50);
    expect(item.limitations.length).toBeGreaterThanOrEqual(4);
  });

  it("does not misclassify borderline asthma or non-significant healthcare effects", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_24[0];
    expect(item.results).toMatch(/p=0,051/);
    expect(item.results).toMatch(/Nessun effetto statisticamente significativo/);
    expect(item.effectSize).toMatch(/3,76%/);
    expect(item.effectSize).toMatch(/1,87%/);
    expect(item.effectSize).toMatch(/−6,91%/);
  });
});
