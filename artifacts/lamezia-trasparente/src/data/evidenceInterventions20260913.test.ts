import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_13 } from "./evidenceInterventions20260913";

describe("evidence interventions 2026-09-13", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_13).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_13) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-13");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("preserves the main methodological caveats and effect-size distinctions", () => {
    const philadelphia = EVIDENCE_INTERVENTIONS_2026_09_13.find(
      (item) => item.id === "philadelphia-property-tax-delinquency-reminder-rct",
    );
    expect(philadelphia?.evaluationMethod.toLowerCase()).toContain("randomized");
    expect(philadelphia?.effectSize).toContain("37 dollari");
    expect(philadelphia?.effectSize).toContain("65 dollari");
    expect(philadelphia?.effectSize.toLowerCase()).toContain("non emerge un effetto persistente");

    const stockholm = EVIDENCE_INTERVENTIONS_2026_09_13.find(
      (item) => item.id === "stockholm-congestion-tax-child-asthma",
    );
    expect(stockholm?.evaluationMethod.toLowerCase()).toContain("natural experiment");
    expect(stockholm?.effectSize).toContain("20–25%");
    expect(stockholm?.effectSize).toContain("8,7");
    expect(stockholm?.limitations.join(" ").toLowerCase()).toContain("trasporto pubblico");

    const rotterdam = EVIDENCE_INTERVENTIONS_2026_09_13.find(
      (item) => item.id === "rotterdam-oude-westen-garbage-commitment-nudge",
    );
    expect(rotterdam?.evidenceStrength).toBe("moderata");
    expect(rotterdam?.evaluationMethod.toLowerCase()).toContain("non assegnate casualmente");
    expect(rotterdam?.effectSize.toLowerCase()).toContain("due terzi");
    expect(rotterdam?.limitations.join(" ").toLowerCase()).toContain("contaminazione");
  });
});
