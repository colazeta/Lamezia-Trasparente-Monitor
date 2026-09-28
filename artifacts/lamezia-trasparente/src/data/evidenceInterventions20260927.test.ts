import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_27 } from "./evidenceInterventions20260927";

describe("evidence interventions 2026-09-27", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_27).toHaveLength(3);
    for (const item of EVIDENCE_INTERVENTIONS_2026_09_27) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-27");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps Stockholm traffic, pollution and health outcomes distinct", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_27.find((x) => x.id === "stockholm-congestion-tax-health-traffic");
    expect(item?.evidenceStrength).toBe("forte");
    expect(item?.effectSize).toContain("−20/−25%");
    expect(item?.effectSize).toContain("−5/−15%");
    expect(item?.effectSize).toContain("−47%");
    expect(item?.results.toLowerCase()).toContain("non emergono");
  });

  it("uses the final Mendoza paper and preserves persistence and cost effectiveness", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_27.find((x) => x.id === "mendoza-fiscal-exchange-tax-bill-rct");
    expect(item?.evidenceStrength).toBe("molto_forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("cluster-randomized");
    expect(item?.effectSize).toContain("+20%");
    expect(item?.effectSize).toContain("+40%");
    expect(item?.effectSize).toContain("≈18");
    expect(item?.results.toLowerCase()).toContain("due anni");
  });

  it("preserves the Mie final-versus-working-paper effect-size discrepancy", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_27.find((x) => x.id === "mie-transparent-bidder-qualification-public-works");
    expect(item?.evidenceStrength).toBe("forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(item?.effectSize).toContain("−8%");
    expect(item?.effectSize).toContain("3%");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("working paper");
  });
});
