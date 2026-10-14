import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_14_SCHOOL } from "./evidenceInterventions20261014School";
import { EVIDENCE_INTERVENTIONS_2026_10_14_CLEAN_HEAT } from "./evidenceInterventions20261014CleanHeat";

const newCases = [...EVIDENCE_INTERVENTIONS_2026_10_14_SCHOOL, ...EVIDENCE_INTERVENTIONS_2026_10_14_CLEAN_HEAT];

describe("2026-10-14 verified local intervention records", () => {
  it("preserves unique public identifiers and evidence provenance", () => {
    expect(newCases).toHaveLength(2);
    expect(new Set(newCases.map(item => item.id)).size).toBe(2);
    for (const item of newCases) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(item.primarySource.url).toMatch(/^https:\/\//);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.evaluationStudies.every(study => study.url.startsWith("https://"))).toBe(true);
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-10-14");
      expect(EVIDENCE_INTERVENTIONS.filter(existing => existing.id === item.id)).toHaveLength(1);
    }
  });
  it("keeps Philadelphia's small six-district replication estimate distinct", () => {
    const school = newCases.find(x => x.id.startsWith("philadelphia-school"));
    expect(school?.results).toContain("1,9%");
    expect(school?.evaluationStudies.length).toBe(3);
  });
  it("does not present spatial air-quality associations as health impacts", () => {
    const heat = newCases.find(x => x.id.startsWith("nyc-clean-heat"));
    expect(heat?.evidenceStrength).toBe("moderata");
    expect(heat?.evaluationMethod.toLowerCase()).toContain("osservazionale");
    expect(heat?.effectSize).toContain("10 edifici");
    expect(heat?.limitations.join(" ").toLowerCase()).toContain("ricoveri");
  });
});
