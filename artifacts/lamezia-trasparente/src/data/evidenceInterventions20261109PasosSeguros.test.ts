import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_09_PASOS_SEGUROS } from "./evidenceInterventions20261109PasosSeguros";

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

describe("Mexico City Pasos Seguros evidence (2026-11-09)", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_09_PASOS_SEGUROS[0];

  it("retains the complete 34-field schema, valid taxonomies and unique stable id", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_09_PASOS_SEGUROS).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.id).toBe("mexico-city-pasos-seguros-intersection-redesign-did-2015");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
  });

  it("distinguishes pedestrian crash effects from inconclusive fatality evidence", () => {
    expect(record.evaluationMethod).toContain("difference-in-differences");
    expect(record.comparator).toContain("non trattati");
    expect(record.effectSize).toContain("0,79");
    expect(record.effectSize).toContain("0,61");
    expect(record.effectSize).toContain("NON significativo");
    expect(record.limitations.join(" ")).toContain("Google Street View");
    expect(record.evidenceStrength).toBe("moderata");
  });

  it("keeps original municipal and academic provenance and realistic transferability", () => {
    expect(record.evaluationStudies[0].doi).toBe("10.1136/jech-2022-219335");
    expect(record.evaluationStudies.every(s => s.url.startsWith("https://"))).toBe(true);
    expect(record.primarySource.url.startsWith("https://")).toBe(true);
    expect(record.lameziaAdaptation).toContain("PGTU");
    expect(record.costsRequirements).toContain("non contiene un costo unitario");
    expect(record.implementability).toBe("medio_termine");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.evaluationStudies.some(study => study.doi === record.evaluationStudies[0].doi))).toHaveLength(1);
  });
});
