import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_09_NYCHA_WASTE } from "./evidenceInterventions20261109NychaWaste";

const REQUIRED_FIELDS = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea", "secondaryAreas",
  "interventionTypes", "tools", "territorialScale", "interventionStatus",
  "evaluationMethod", "comparator", "outcomes", "results", "effectSize",
  "evidenceStrength", "costsRequirements", "limitations", "unintendedEffects",
  "primarySource", "evaluationStudies", "lastVerifiedAt", "transferabilityItaly",
  "lameziaAdaptation", "implementability", "capacityDataNeeds", "tags",
  "revisionHistory",
] as const;

describe("Municipal evidence 2026-11-09 — NYCHA waste-disposal cluster RCT", () => {
  const [record] = EVIDENCE_INTERVENTIONS_2026_11_09_NYCHA_WASTE;

  it("uses all 34 schema fields, one ID, and existing taxonomies", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_09_NYCHA_WASTE).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory[0].date).toBe(record.lastVerifiedAt);
  });

  it("preserves the randomised comparator, short follow-up and outcome scope", () => {
    expect(record.evaluationMethod).toMatch(/randomized controlled trial/i);
    expect(record.comparator).toContain("26 complessi");
    expect(record.effectSize).toContain("−25%");
    expect(record.effectSize).toContain("−16%");
    expect(record.effectSize).toContain("21 settimane");
    expect(record.limitations.join(" ")).toContain("Contenitori e poster");
    expect(record.results).toContain("NON equivale");
    expect(record.implementability).toBe("medio_termine");
  });

  it("retains primary authority and original peer-reviewed provenance", () => {
    expect(record.primarySource.url).toMatch(/^https:\/\/www\.nyc\.gov\//);
    expect(record.evaluationStudies[0].doi).toBe("10.30636/jbpa.42.202");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.evaluationStudies.some(study => study.doi === record.evaluationStudies[0].doi))).toHaveLength(1);
    expect(record.lameziaAdaptation).toContain("Lamezia Multiservizi");
    expect(record.costsRequirements).toContain("NON imputare");
  });
});
