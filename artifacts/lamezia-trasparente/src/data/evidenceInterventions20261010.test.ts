import { describe, expect, it } from "vitest";
import {
  EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY,
} from "./evidenceInterventions";
import {
  EVIDENCE_INTERVENTIONS,
  findEvidenceIntervention, getEvidenceAreas, getEvidenceCountries,
  getEvidenceInterventionTypes,
} from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_10 } from "./evidenceInterventions20261010";
import { EVIDENCE_INTERVENTIONS_2026_10_10_UGANDA } from "./evidenceInterventions20261010Uganda";

const daily = [...EVIDENCE_INTERVENTIONS_2026_10_10, ...EVIDENCE_INTERVENTIONS_2026_10_10_UGANDA];

describe("municipal evidence 2026-10-10", () => {
  it("publishes two source-verified cases exactly once with complete stable metadata", () => {
    expect(daily).toHaveLength(2);
    for (const r of daily) {
      expect(r.id.length).toBeGreaterThan(12);
      expect(r.primaryArea).toBeTruthy();
      expect(EVIDENCE_THEMATIC_AREAS).toContain(r.primaryArea);
      for (const area of r.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const kind of r.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(kind);
      expect(EVIDENCE_STRENGTHS).toContain(r.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(r.implementability);
      expect(r.primarySource.url.startsWith("https://")).toBe(true);
      expect(r.evaluationStudies.length).toBeGreaterThan(0);
      expect(r.evaluationStudies[0].doi).toBeTruthy();
      expect(r.lastVerifiedAt).toBe("2026-10-10");
      expect(r.limitations.length).toBeGreaterThan(2);
      expect(r.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((item) => item.id === r.id)).toHaveLength(1);
      expect(findEvidenceIntervention(r.id)?.title).toBe(r.title);
    }
  });
  it("preserves the published archive's indices and adds new countries and thematic categories", () => {
    expect(getEvidenceCountries()).toContain("Perù");
    expect(getEvidenceCountries()).toContain("Uganda");
    expect(getEvidenceAreas()).toContain("rifiuti_pulizia_urbana");
    expect(getEvidenceAreas()).toContain("partecipazione_democrazia_locale");
    expect(getEvidenceInterventionTypes()).toContain("nudging_comunicazione");
  });
  it("retains caveats, avoids treating recycling as tonnage or health RCT as an Italian effect estimate", () => {
    const recycling = EVIDENCE_INTERVENTIONS_2026_10_10[0];
    expect(recycling.effectSize).toContain("+8,3");
    expect(recycling.limitations.join(" ")).toMatch(/qualità|quantità|riciclati/i);
    const uganda = EVIDENCE_INTERVENTIONS_2026_10_10_UGANDA[0];
    expect(uganda.effectSize).toContain("−33%");
    expect(uganda.limitations.join(" ")).toContain("Italia");
  });
  it("does not reintroduce the already archived Cape Town 2015 water-bill RCT", () => {
    expect(daily.every((r) => !r.id.includes("cape-town"))).toBe(true);
  });
});
