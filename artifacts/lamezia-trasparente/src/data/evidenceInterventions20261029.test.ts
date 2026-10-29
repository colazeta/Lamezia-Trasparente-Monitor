import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_29 } from "./evidenceInterventions20261029";

const fields = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea",
  "secondaryAreas", "interventionTypes", "tools", "territorialScale",
  "interventionStatus", "evaluationMethod", "comparator", "outcomes",
  "results", "effectSize", "evidenceStrength", "costsRequirements",
  "limitations", "unintendedEffects", "primarySource", "evaluationStudies",
  "lastVerifiedAt", "transferabilityItaly", "lameziaAdaptation",
  "implementability", "capacityDataNeeds", "tags", "revisionHistory",
] as const;

describe("municipal evidence archive, 29 October 2026", () => {
  it("holds one new verified case with all 34 stable schema fields", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_29).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_10_29[0];
    expect(Object.keys(item).sort()).toEqual([...fields].sort());
    expect(item.id).toBe("santa-fe-argentina-good-taxpayer-sidewalk-lottery-2009");
    expect(item.primaryArea).toBe("fiscalita_entrate_riscossione");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(item.evidenceStrength).not.toBe("da_verificare");
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.lastVerifiedAt).toBe("2026-10-29");
    expect(item.revisionHistory).toHaveLength(1);
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.evaluationStudies.some((study) => study.doi === "10.1016/j.jpubeco.2021.104422")).toBe(true);
    expect(EVIDENCE_INTERVENTIONS.filter((r) => r.id === item.id)).toHaveLength(1);
  });

  it("differentiates randomised ITT, actual construction and non-randomised neighbourhood comparisons", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_29[0];
    expect(item.effectSize).toContain("+3,1");
    expect(item.effectSize).toContain("+7,1");
    expect(item.comparator).toContain("non sono individualmente randomizzate");
    expect(item.effectSize).toContain("223");
    expect(item.limitations.join(" ")).toContain("spillover");
  });

  it("preserves negative net-return possibility and Italian legal/equity safeguards", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_29[0];
    expect(item.costsRequirements).toContain("finanziariamente in perdita");
    expect(item.transferabilityItaly).toContain("bassa per replicare");
    expect(item.unintendedEffects).toContain("regressivo");
  });
});
