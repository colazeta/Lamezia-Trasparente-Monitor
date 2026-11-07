import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_07_EDINBURGH_20MPH } from "./evidenceInterventions20261107Edinburgh20mph";

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

describe("Municipal evidence 2026-11-07 — Edinburgh 20 mph natural experiment", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_07_EDINBURGH_20MPH[0];

  it("contains all 34 fields and uses existing controlled vocabulary", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_07_EDINBURGH_20MPH).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory[0]?.date).toBe(record.lastVerifiedAt);
  });

  it("integrates exactly one instance and is unique by original scientific evaluation", () => {
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.evaluationStudies.some(study => study.doi === "10.1136/jech-2023-221612"))).toHaveLength(1);
    expect(record.primarySource.url).toContain("edinburgh.gov.uk");
    expect(record.evaluationStudies[0]?.url).toContain("PMC11187370");
  });

  it("does not overclaim a randomised or universal causal effect", () => {
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.evaluationMethod).toMatch(/NON randomizzato/);
    expect(record.comparator).toMatch(/abbinate/);
    expect(record.effectSize).toContain("−20%");
    expect(record.effectSize).toContain("−17%");
    expect(record.effectSize).toContain("−10%");
    expect(record.limitations.join(" ")).toMatch(/non significativo|non randomizzato/i);
    expect(record.transferabilityItaly).toMatch(/Codice della strada/);
    expect(record.lameziaAdaptation).toContain("PGTU");
  });
});
