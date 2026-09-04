import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_04 } from "./evidenceInterventions20260904";

describe("evidence interventions 2026-09-04", () => {
  it("contains only publishable, sourced and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_04).toHaveLength(5);
    for (const item of EVIDENCE_INTERVENTIONS_2026_09_04) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-04");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("keeps material null or adverse findings visible", () => {
    const milan = EVIDENCE_INTERVENTIONS_2026_09_04.find(
      (item) => item.id === "milan-area-c-congestion-charge-air-quality",
    );
    const boston = EVIDENCE_INTERVENTIONS_2026_09_04.find(
      (item) => item.id === "boston-public-preschool-lottery-long-term",
    );
    expect(`${milan?.results} ${milan?.effectSize}`.toLowerCase()).toContain("nox");
    expect(`${boston?.results} ${boston?.effectSize}`.toLowerCase()).toContain("test");
  });

  it("records spillover checks for place-based interventions", () => {
    const london = EVIDENCE_INTERVENTIONS_2026_09_04.find(
      (item) => item.id === "london-low-traffic-neighbourhoods-road-injuries",
    );
    expect(`${london?.results} ${london?.effectSize} ${london?.unintendedEffects}`.toLowerCase()).toContain(
      "boundary",
    );
  });
});
