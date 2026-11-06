import { describe, expect, it } from "vitest";
import {
  EVIDENCE_THEMATIC_AREAS,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_STRENGTHS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_06_PMAT } from "./evidenceInterventions20261106Pmat";

const REQUIRED_FIELDS = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea", "secondaryAreas",
  "interventionTypes", "tools", "territorialScale", "interventionStatus",
  "evaluationMethod", "comparator", "outcomes", "results", "effectSize",
  "evidenceStrength", "costsRequirements", "limitations", "unintendedEffects",
  "primarySource", "evaluationStudies", "lastVerifiedAt", "transferabilityItaly",
  "lameziaAdaptation", "implementability", "capacityDataNeeds", "tags", "revisionHistory",
] as const;

describe("Municipal evidence 2026-11-06 — BNDES PMAT programme", () => {
  const item = EVIDENCE_INTERVENTIONS_2026_11_06_PMAT[0];
  it("includes exactly 34 structured fields and is unique in archive", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_06_PMAT).toHaveLength(1);
    expect(Object.keys(item).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(item.id).toBe("brazil-bndes-pmat-municipal-tax-capacity-school-infrastructure-1998");
    expect(EVIDENCE_INTERVENTIONS.filter(entry => entry.id === item.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(item.revisionHistory[0].date).toBe(item.lastVerifiedAt);
  });
  it("preserves DOI uniqueness, institutional provenance and the quasi-experimental limits", () => {
    const doi = "10.1257/app.20150509";
    expect(item.evaluationStudies[0].doi).toBe(doi);
    expect(EVIDENCE_INTERVENTIONS.filter(entry => entry.evaluationStudies.some(study => study.doi === doi))).toHaveLength(1);
    expect(item.primarySource.url).toMatch(/^https:\/\/www\.bndes\.gov\.br/);
    expect(item.evaluationMethod).toContain("Quasi-esperimento");
    expect(item.evaluationMethod).toContain("difference-in-differences");
    expect(item.evidenceStrength).toBe("moderata");
    expect(item.limitations.join(" ")).toContain("Adesione al PMAT volontaria");
  });
  it("does not confuse tax revenues with profits, school infrastructure with learning or guarantee Italian powers", () => {
    expect(item.effectSize).toContain("+10%");
    expect(item.effectSize).toContain("+4–5%");
    expect(item.effectSize).toContain("non come profitto netto");
    expect(item.results).toContain("Non emerge una dimostrazione");
    expect(item.transferabilityItaly).toContain("vincoli di legge");
    expect(item.lameziaAdaptation).toContain("PagoPA");
    expect(item.implementability).toBe("strutturale");
  });
});
