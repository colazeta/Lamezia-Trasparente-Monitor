import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_30_GERMANY } from "./evidenceInterventions20261030Germany";

const canonicalFields = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea",
  "secondaryAreas", "interventionTypes", "tools", "territorialScale",
  "interventionStatus", "evaluationMethod", "comparator", "outcomes",
  "results", "effectSize", "evidenceStrength", "costsRequirements",
  "limitations", "unintendedEffects", "primarySource", "evaluationStudies",
  "lastVerifiedAt", "transferabilityItaly", "lameziaAdaptation",
  "implementability", "capacityDataNeeds", "tags", "revisionHistory",
] as const;

describe("German municipal low-emission zones — 30 October 2026", () => {
  it("provides one unique archive item with all 34 canonical fields", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_30_GERMANY).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_10_30_GERMANY[0];
    expect(Object.keys(item).sort()).toEqual([...canonicalFields].sort());
    expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    expect(item.primaryArea).toBe("salute_pubblica_locale");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.lastVerifiedAt).toBe("2026-10-30");
  });

  it("cites peer-reviewed originals and clearly distinguishes outcomes", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_30_GERMANY[0];
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.evaluationStudies.map((study) => study.doi)).toContain("10.1016/j.jhealeco.2020.102402");
    expect(item.evaluationStudies.map((study) => study.doi)).toContain("10.1016/j.jpubeco.2023.105014");
    expect(item.evaluationMethod).toContain("non randomizzato");
    expect(item.effectSize).toContain("PM10");
    expect(item.effectSize).toContain("NO2");
    expect(item.effectSize).toContain("2%/−3%");
    expect(item.results).toContain("Sarmiento");
    expect(item.unintendedEffects).toContain("ozono");
  });

  it("requires local evidence, legal review, inclusion and outcome evaluation before Italian adoption", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_30_GERMANY[0];
    expect(item.implementability).toBe("strutturale");
    expect(item.lameziaAdaptation).toContain("PGTU");
    expect(item.lameziaAdaptation).toContain("ARPACAL");
    expect(item.transferabilityItaly).toContain("proporzionalità");
    expect(item.capacityDataNeeds.length).toBeGreaterThan(4);
    expect(item.revisionHistory).toHaveLength(1);
  });
});
