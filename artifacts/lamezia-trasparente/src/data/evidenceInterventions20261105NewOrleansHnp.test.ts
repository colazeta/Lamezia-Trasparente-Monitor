import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_05_NEW_ORLEANS_HNP } from "./evidenceInterventions20261105NewOrleansHnp";

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

describe("Municipal evidence 2026-11-05 — New Orleans Healthy Neighborhoods Project", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_05_NEW_ORLEANS_HNP[0];

  it("has 34 fields, taxonomy-valid identifiers and an archive-unique intervention", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_05_NEW_ORLEANS_HNP).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.id).toBe("new-orleans-healthy-neighborhoods-vacant-property-family-violence-cluster-rct");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(x => expect(EVIDENCE_THEMATIC_AREAS).toContain(x));
    record.interventionTypes.forEach(x => expect(EVIDENCE_INTERVENTION_TYPES).toContain(x));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
  });

  it("does not confuse relative changes, randomized clusters and citywide violence", () => {
    expect(record.evaluationMethod).toContain("Cluster randomized controlled trial");
    expect(record.evaluationMethod).toContain("23 quartieri");
    expect(record.evaluationMethod).toContain("194 cluster");
    expect(record.evaluationMethod).toContain("101 cluster trattati e 93 controlli");
    expect(record.costsRequirements).toContain("135/296");
    expect(record.effectSize).toContain("−40%");
    expect(record.effectSize).toContain("−16%");
    expect(record.effectSize).toContain("−11%");
    expect(record.effectSize).toContain("−17%");
    expect(record.effectSize).toContain("NON punti percentuali");
    expect(record.results).toContain("NON riduzioni dell'intera violenza domestica cittadina");
    expect(record.limitations.join(" ")).toContain("abstract");
    expect(record.measure).toContain("243 lotti");
    expect(record.measure).toContain("53 strutture");
  });

  it("retains original studies, lawful Italian transfer and maintenance requirements", () => {
    expect(record.evaluationStudies[0].doi).toBe("10.2105/AJPH.2026.308626");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.evaluationStudies.some(study => study.doi === record.evaluationStudies[0].doi))).toHaveLength(1);
    expect(record.primarySource.url).toMatch(/^https:\/\//);
    expect(record.costsRequirements).toContain("NON significa costo economico zero");
    expect(record.lameziaAdaptation).toContain("Ordinanza comunale n. 36");
    expect(record.implementability).toBe("medio_termine");
  });
});
