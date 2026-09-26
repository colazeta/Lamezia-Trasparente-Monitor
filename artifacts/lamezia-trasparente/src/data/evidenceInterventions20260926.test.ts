import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_26 } from "./evidenceInterventions20260926";

describe("evidence interventions 2026-09-26", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_26).toHaveLength(3);
    for (const item of EVIDENCE_INTERVENTIONS_2026_09_26) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-09-26");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps Fresno conservation effects together with the backlash", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_26.find((x) => x.id === "fresno-smart-meter-water-enforcement-rct");
    expect(item?.evidenceStrength).toBe("molto_forte");
    expect(item?.effectSize).toContain("−17%");
    expect(item?.effectSize).toContain("+1.102%");
    expect(item?.unintendedEffects.toLowerCase()).toContain("contestazioni");
  });

  it("keeps Lisbon price effects separate from anticipation and quantity results", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_26.find((x) => x.id === "lisbon-short-term-rental-containment-zones-2018");
    expect(item?.evidenceStrength).toBe("forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(item?.effectSize).toContain("−8%");
    expect(item?.effectSize).toContain("−20%");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("anticip");
  });

  it("keeps Philadelphia's short-run collection gain separate from persistence", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_26.find((x) => x.id === "philadelphia-property-tax-delinquency-letters-rct");
    expect(item?.evidenceStrength).toBe("molto_forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("randomized controlled");
    expect(item?.effectSize).toContain("+3,7");
    expect(item?.effectSize).toContain("+9,2");
    expect(item?.effectSize).toContain("36,27 USD");
    expect(item?.results.toLowerCase()).toContain("non emerge");
  });
});
