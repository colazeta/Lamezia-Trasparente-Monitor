import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_15 } from "./evidenceInterventions20260915";

describe("evidence interventions 2026-09-15", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_15).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_15) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-15");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps Milan's PM10 finding distinct from the null/inconsistent NOx result", () => {
    const milan = EVIDENCE_INTERVENTIONS_2026_09_15.find((item) => item.id === "milan-area-c-congestion-charge-pm10");
    expect(milan?.evaluationMethod.toLowerCase()).toContain("matrix completion");
    expect(milan?.results).toContain("PM10");
    expect(milan?.results).toContain("NOx");
    expect(milan?.effectSize.toLowerCase()).toContain("non inventa");
    expect(milan?.limitations.join(" ").toLowerCase()).toContain("pacchetto");
  });

  it("separates Seattle beverage effects from health claims and records substitution", () => {
    const seattle = EVIDENCE_INTERVENTIONS_2026_09_15.find((item) => item.id === "seattle-sweetened-beverage-tax");
    expect(seattle?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(seattle?.effectSize).toContain("−22%");
    expect(seattle?.effectSize).toContain("−19%");
    expect(seattle?.limitations.join(" ").toLowerCase()).toContain("non dimostrano direttamente");
    expect(seattle?.unintendedEffects.toLowerCase()).toContain("sostituzione");
    expect(seattle?.transferabilityItaly.toLowerCase()).toContain("base legislativa");
  });

  it("keeps Ahmedabad at moderate evidence strength and exposes before-after uncertainty", () => {
    const ahmedabad = EVIDENCE_INTERVENTIONS_2026_09_15.find((item) => item.id === "ahmedabad-heat-action-plan");
    expect(ahmedabad?.evidenceStrength).toBe("moderata");
    expect(ahmedabad?.evaluationMethod.toLowerCase()).toContain("before-after");
    expect(ahmedabad?.effectSize).toContain("1.190");
    expect(ahmedabad?.limitations.join(" ").toLowerCase()).toContain("senza città di controllo");
    expect(ahmedabad?.results.toLowerCase()).toContain("non deve essere presentato come un rct");
  });
});
