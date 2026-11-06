import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_06_RIO_CEP } from "./evidenceInterventions20261106RioCep";

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

describe("Municipal evidence 2026-11-06 — Rio Méier CEP synthetic-DiD", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_06_RIO_CEP[0];

  it("retains all 34 mandatory fields, stable id, valid taxonomy and one matching archive item", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_06_RIO_CEP).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.id).toBe("rio-de-janeiro-meier-cep-municipal-urban-safety-sdid-2021");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory[0].date).toBe(record.lastVerifiedAt);
  });

  it("keeps the synthetic comparator and self-reported municipal before-after separated", () => {
    expect(record.evaluationMethod).toContain("synthetic difference-in-differences");
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.effectSize).toContain("−32%");
    expect(record.effectSize).toContain("−40%");
    expect(record.effectSize).toContain("NON una seconda stima causalmente identificata");
    expect(record.limitations.join(" ")).toContain("non casuale");
    expect(record.results).toContain("componente");
    expect(record.unintendedEffects).toContain("spostamento");
  });

  it("preserves original peer-reviewed and primary-municipal provenance and Italian legal caveats", () => {
    const doi = "10.1016/j.econlet.2025.112448";
    expect(record.evaluationStudies[0].doi).toBe(doi);
    expect(EVIDENCE_INTERVENTIONS.filter(item =>
      item.evaluationStudies.some(study => study.doi === doi),
    )).toHaveLength(1);
    expect(record.primarySource.url).toMatch(/^https:\/\//);
    expect(record.lameziaAdaptation).toContain("Polizia Locale");
    expect(record.lameziaAdaptation).toContain("DPIA");
    expect(record.costsRequirements).toContain("NON verificati");
    expect(record.implementability).toBe("medio_termine");
  });
});
