import { describe, expect, it } from "vitest";
import {
  EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_05_MECHELEN } from "./evidenceInterventions20261105Mechelen";

const REQUIRED_FIELDS = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea",
  "secondaryAreas", "interventionTypes", "tools", "territorialScale",
  "interventionStatus", "evaluationMethod", "comparator", "outcomes", "results",
  "effectSize", "evidenceStrength", "costsRequirements", "limitations",
  "unintendedEffects", "primarySource", "evaluationStudies", "lastVerifiedAt",
  "transferabilityItaly", "lameziaAdaptation", "implementability",
  "capacityDataNeeds", "tags", "revisionHistory",
] as const;

describe("Municipal evidence 2026-11-05 — Mechelen parking fine RCT", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_05_MECHELEN[0];

  it("uses the complete 34-field schema, canonical ID and existing taxonomies", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_05_MECHELEN).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.id).toBe("mechelen-belgium-parking-fine-combined-notice-nudges-cluster-rct-2020");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory[0].date).toBe(record.lastVerifiedAt);
  });

  it("reports nominal results and mandatory multiple testing qualification", () => {
    expect(record.population).toContain("2.664");
    expect(record.evaluationMethod).toContain("34");
    expect(record.effectSize).toContain("+7,9 pp");
    expect(record.effectSize).toContain("p=0,054");
    expect(record.results).toContain("NON supera");
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.limitations.join(" ")).toContain("preregistrato");
    expect(record.limitations.join(" ")).toContain("34 cluster");
  });

  it("keeps clear study provenance and protects Italian legal notification rights", () => {
    expect(record.evaluationStudies[0].doi).toBe("10.1016/j.socec.2023.102033");
    expect(
      EVIDENCE_INTERVENTIONS.filter(item =>
        item.evaluationStudies.some(study => study.doi === record.evaluationStudies[0].doi),
      ),
    ).toHaveLength(1);
    expect(record.primarySource.url).toMatch(/^https:\/\//);
    expect(record.lameziaAdaptation).toContain("pagoPA");
    expect(record.lameziaAdaptation).toContain("diritti di opposizione");
    expect(record.costsRequirements).toContain("non maggior gettito");
    expect(record.implementability).toBe("medio_termine");
  });
});
