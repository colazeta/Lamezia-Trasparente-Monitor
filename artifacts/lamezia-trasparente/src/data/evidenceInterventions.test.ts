import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTIONS,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";

describe("evidence interventions archive", () => {
  it("uses stable unique ids", () => {
    const ids = EVIDENCE_INTERVENTIONS.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^[a-z0-9-]+$/.test(id))).toBe(true);
  });

  it("keeps classifications inside the canonical taxonomies", () => {
    for (const item of EVIDENCE_INTERVENTIONS) {
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      for (const area of item.secondaryAreas) {
        expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      }
      for (const type of item.interventionTypes) {
        expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      }
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    }
  });

  it("requires traceable sources and explicit methodological limitations", () => {
    for (const item of EVIDENCE_INTERVENTIONS) {
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

  it("does not label unresolved records as verified evidence", () => {
    const unresolved = EVIDENCE_INTERVENTIONS.filter(
      (item) => item.evidenceStrength === "da_verificare",
    );

    expect(
      unresolved.every((item) =>
        item.results.toLocaleLowerCase("it").includes("da verificare"),
      ),
    ).toBe(true);
  });
});
