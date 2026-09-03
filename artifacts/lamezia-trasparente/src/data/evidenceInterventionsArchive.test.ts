import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_DAILY } from "./evidenceInterventionsDaily";

describe("combined evidence interventions archive", () => {
  it("keeps ids unique across base and daily records", () => {
    const ids = EVIDENCE_INTERVENTIONS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^[a-z0-9-]+$/.test(id))).toBe(true);
  });

  it("adds only fully sourced daily records to the public archive", () => {
    expect(EVIDENCE_INTERVENTIONS_DAILY.length).toBeGreaterThan(0);

    for (const item of EVIDENCE_INTERVENTIONS_DAILY) {
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.evaluationStudies.every((study) => study.url.startsWith("https://"))).toBe(true);
      expect(item.evaluationMethod.trim().length).toBeGreaterThan(20);
      expect(item.comparator.trim().length).toBeGreaterThan(10);
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("keeps daily classifications inside canonical taxonomies", () => {
    for (const item of EVIDENCE_INTERVENTIONS_DAILY) {
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    }
  });
});
