import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_31 } from "./evidenceInterventions20261031";

const fields = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea",
  "secondaryAreas", "interventionTypes", "tools", "territorialScale",
  "interventionStatus", "evaluationMethod", "comparator", "outcomes",
  "results", "effectSize", "evidenceStrength", "costsRequirements",
  "limitations", "unintendedEffects", "primarySource", "evaluationStudies",
  "lastVerifiedAt", "transferabilityItaly", "lameziaAdaptation",
  "implementability", "capacityDataNeeds", "tags", "revisionHistory",
] as const;

describe("municipal evidence archive — 31 October 2026", () => {
  it("validates two distinct source-verified records and all 34 canonical fields", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_31).toHaveLength(2);
    const ids = EVIDENCE_INTERVENTIONS_2026_10_31.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    EVIDENCE_INTERVENTIONS_2026_10_31.forEach((item) => {
      expect(Object.keys(item).sort()).toEqual([...fields].sort());
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      expect(new Set(item.secondaryAreas).size).toBe(item.secondaryAreas.length);
      item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
      item.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url).toMatch(/^https:\/\//);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-10-31");
      expect(item.revisionHistory.some((rev) => rev.date === "2026-10-31")).toBe(true);
      expect(EVIDENCE_INTERVENTIONS.filter((r) => r.id === item.id)).toHaveLength(1);
    });
  });

  it("reports the final randomized housing outcomes without claiming observed child earnings", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_31[0];
    expect(item.id).toBe("seattle-king-county-cmto-housing-search-assistance-rct-2018");
    expect(item.evidenceStrength).toBe("molto_forte");
    expect(item.evaluationMethod).toContain("randomized controlled trials");
    expect(item.effectSize).toContain("53%");
    expect(item.effectSize).toContain("15%");
    expect(item.effectSize).toContain("+38 punti");
    expect(item.limitations.join(" ")).toContain("reddito adulto futuro");
    expect(item.evaluationStudies.some((study) => study.doi === "10.1257/aer.20200407")).toBe(true);
  });

  it("qualifies the non-randomised, short-lived, unequal Sacramento 311 uptake", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_31[1];
    expect(item.id).toBe("sacramento-311-2020-digital-status-map-transparency-psm-did");
    expect(item.evidenceStrength).toBe("moderata");
    expect(item.evaluationMethod).toContain("PSM-DID");
    expect(item.comparator).toContain("San Francisco");
    expect(item.results).toContain("prime quattro settimane");
    expect(item.limitations.join(" ")).toContain("Covid-19");
    expect(item.results).toContain("non è dimostrata");
    expect(item.evaluationStudies.some((study) => study.doi === "10.1016/j.giq.2023.101868")).toBe(true);
  });
});
