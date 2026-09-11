import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_11 } from "./evidenceInterventions20260911";

describe("evidence interventions 2026-09-11", () => {
  it("contains only sourced and taxonomically valid public records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_11).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_11) {
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
      expect(item.evaluationMethod.trim().length).toBeGreaterThan(20);
      expect(item.comparator.trim().length).toBeGreaterThan(10);
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-09-11");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("keeps Rochester GBI as a temporary randomized pilot and not an automatically transferable municipal entitlement", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_11.find(
      (entry) => entry.id === "rochester-guaranteed-basic-income-pilot",
    );
    expect(item?.evaluationMethod.toLowerCase()).toContain("randomized");
    expect(item?.effectSize).toContain("183%");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("temporaneo");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("base normativa");
    expect(item?.lameziaAdaptation.toLowerCase()).toContain("non istituire un nuovo reddito comunale");
  });

  it("keeps Seattle LEAD below strong because allocation was nonrandomized and outcomes are recorded justice events", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_11.find(
      (entry) => entry.id === "seattle-lead-prebooking-diversion",
    );
    expect(item?.evidenceStrength).toBe("moderata");
    expect(item?.evaluationMethod.toLowerCase()).toContain("non randomizzata");
    expect(item?.effectSize).toContain("60%");
    expect(item?.effectSize).toContain("39%");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("arresti e accuse registrate");
  });

  it("keeps Rochester Lead Law health trends explicitly observational while preserving dust-wipe detection evidence", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_11.find(
      (entry) => entry.id === "rochester-lead-law-rental-inspections",
    );
    expect(item?.evidenceStrength).toBe("moderata");
    expect(item?.evaluationMethod.toLowerCase()).toContain("pre/post");
    expect(item?.effectSize).toContain("7,5%");
    expect(item?.effectSize).toContain("5,0%");
    expect(item?.effectSize.toLowerCase()).toContain("non un effect size causale");
    expect(item?.effectSize.toLowerCase()).toContain("un terzo");
  });
});
