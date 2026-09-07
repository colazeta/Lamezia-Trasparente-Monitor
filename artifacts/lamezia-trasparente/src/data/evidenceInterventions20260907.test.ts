import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_07 } from "./evidenceInterventions20260907";

describe("evidence interventions 2026-09-07", () => {
  it("contains only publishable, sourced and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_07).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_07) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-07");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("keeps the identification strategy and causal scale explicit", () => {
    const santaClara = EVIDENCE_INTERVENTIONS_2026_09_07.find(
      (item) => item.id === "santa-clara-homelessness-prevention-cash-rct",
    );
    expect(santaClara?.evidenceStrength).toBe("molto_forte");
    expect(santaClara?.effectSize).toContain("−3,8");
    expect(santaClara?.evaluationMethod.toLowerCase()).toContain("randomized controlled trial");

    const participatoryBudgeting = EVIDENCE_INTERVENTIONS_2026_09_07.find(
      (item) => item.id === "brazil-municipal-participatory-budgeting-health",
    );
    expect(participatoryBudgeting?.evidenceStrength).toBe("moderata");
    expect(participatoryBudgeting?.limitations.join(" ").toLowerCase()).toContain("non è randomizzata");

    const rightToCounsel = EVIDENCE_INTERVENTIONS_2026_09_07.find(
      (item) => item.id === "nyc-right-to-counsel-eviction",
    );
    expect(rightToCounsel?.evidenceStrength).toBe("forte");
    expect(rightToCounsel?.effectSize).toContain("−32,1");
    expect(rightToCounsel?.effectSize.toLowerCase()).toContain("reduced form");
  });
});
