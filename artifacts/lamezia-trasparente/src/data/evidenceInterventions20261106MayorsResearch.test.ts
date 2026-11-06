import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_06_MAYORS_RESEARCH } from "./evidenceInterventions20261106MayorsResearch";

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

describe("Municipal evidence 2026-11-06 — CNM mayors evidence briefing RCT", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_06_MAYORS_RESEARCH[0];

  it("has the 34 required fields and existing controlled vocabulary", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_06_MAYORS_RESEARCH).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.id).toBe("brazil-cnm-mayors-research-evidence-policy-adoption-rct-2016");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory[0].date).toBe(record.lastVerifiedAt);
  });

  it("distinguishes evidence information, policy adoption and payments", () => {
    expect(record.evaluationMethod).toMatch(/encouragement design/i);
    expect(record.evaluationMethod).toMatch(/2SLS/);
    expect(record.effectSize).toContain("ToT/2SLS");
    expect(record.effectSize).toContain("0,1031");
    expect(record.effectSize).toContain("0,0531");
    expect(record.effectSize).toContain("ITT");
    expect(record.results).toContain("NON");
    expect(record.limitations.join(" ")).toMatch(/auto-riferito/);
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.implementationYear).toContain("2016");
  });

  it("preserves source, stable DOI and local implementation conditions", () => {
    const doi = "10.1257/aer.20190830";
    expect(record.evaluationStudies[0].doi).toBe(doi);
    expect(EVIDENCE_INTERVENTIONS.filter(item =>
      item.evaluationStudies.some(study => study.doi === doi)
    )).toHaveLength(1);
    expect(record.primarySource.url).toContain("cnm.org.br");
    expect(record.lameziaAdaptation).toContain("PIAO");
    expect(record.lameziaAdaptation).toContain("6 e 12 mesi");
    expect(record.implementability).toBe("quick_win");
  });
});
