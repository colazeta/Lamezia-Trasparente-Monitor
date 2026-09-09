import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_09 } from "./evidenceInterventions20260909";

describe("evidence interventions 2026-09-09", () => {
  it("contains only sourced and taxonomically valid public records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_09).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_09) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-09");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("keeps Yokohama take-up effects separate from tax compliance", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_09.find(
      (entry) => entry.id === "yokohama-property-tax-automatic-debit-nudge",
    );
    expect(item?.results.toLowerCase()).toContain("non emerge alcun miglioramento");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("on-time payment");
  });

  it("keeps NYC causal estimates separate from descriptive DOT trends", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_09.find(
      (entry) => entry.id === "nyc-automated-speed-cameras-road-safety",
    );
    expect(item?.effectSize).toContain("−30%");
    expect(item?.effectSize.toLowerCase()).toContain("dato descrittivo");
  });

  it("keeps New Orleans cost saving explicitly modelled", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_09.find(
      (entry) => entry.id === "new-orleans-code-enforcement-early-courtesy-letter-rct",
    );
    expect(item?.effectSize.toLowerCase()).toContain("stima modellata");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("risparmio");
  });
});
