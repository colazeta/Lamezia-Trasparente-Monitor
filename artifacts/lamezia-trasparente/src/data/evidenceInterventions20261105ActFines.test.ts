import { describe, expect, it } from "vitest";
import {
  EVIDENCE_THEMATIC_AREAS,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_IMPLEMENTABILITY,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_05_ACT_FINES } from "./evidenceInterventions20261105ActFines";

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

describe("ACT traffic and parking fine letters randomized experiment — 2026-11-05", () => {
  const item = EVIDENCE_INTERVENTIONS_2026_11_05_ACT_FINES[0];

  it("has the 34 mandatory fields and reuses stable taxonomies", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_05_ACT_FINES).toHaveLength(1);
    expect(Object.keys(item).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach((kind) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(kind));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.revisionHistory[0].date).toBe(item.lastVerifiedAt);
  });

  it("appears exactly once and does not duplicate its study", () => {
    expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    const doi = "10.1016/j.jebo.2023.03.029";
    expect(item.evaluationStudies[0].doi).toBe(doi);
    expect(EVIDENCE_INTERVENTIONS.filter((record) =>
      record.evaluationStudies.some((study) => study.doi === doi),
    )).toHaveLength(1);
  });

  it("preserves study comparisons, adjusted treatment effects and uncertainty", () => {
    expect(item.evaluationMethod).toMatch(/randomizzazione stratificata/);
    expect(item.effectSize).toContain("+0,032");
    expect(item.effectSize).toContain("+0,019");
    expect(item.effectSize).toContain("IZA DP 14252");
    expect(item.results).toContain("potenza sufficiente");
    expect(item.evidenceStrength).toBe("forte");
    expect(item.limitations.join(" ")).toContain("NON");
    expect(item.costsRequirements).toContain("simulazione");
  });

  it("requires lawful application and does not claim road safety improvements", () => {
    expect(item.lameziaAdaptation).toContain("pagoPA");
    expect(item.transferabilityItaly).toContain("diritto di difesa");
    expect(item.outcomes.join(" ")).toContain("non misurati");
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.implementability).toBe("medio_termine");
  });
});
