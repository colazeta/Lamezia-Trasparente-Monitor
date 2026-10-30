import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_30 } from "./evidenceInterventions20261030";

const fields = [
  "id",
  "title",
  "authority",
  "territory",
  "country",
  "implementationYear",
  "problem",
  "measure",
  "mechanism",
  "population",
  "primaryArea",
  "secondaryAreas",
  "interventionTypes",
  "tools",
  "territorialScale",
  "interventionStatus",
  "evaluationMethod",
  "comparator",
  "outcomes",
  "results",
  "effectSize",
  "evidenceStrength",
  "costsRequirements",
  "limitations",
  "unintendedEffects",
  "primarySource",
  "evaluationStudies",
  "lastVerifiedAt",
  "transferabilityItaly",
  "lameziaAdaptation",
  "implementability",
  "capacityDataNeeds",
  "tags",
  "revisionHistory"
] as const;

describe("municipal evidence archive, 30 October 2026", () => {
  it("contains one verified Mapo-gu record with all 34 canonical fields", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_30).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_10_30[0];
    expect(Object.keys(item).sort()).toEqual([...fields].sort());
    expect(item.id).toBe("seoul-mapo-gu-rfid-unit-food-waste-pricing-2016");
    expect(item.primaryArea).toBe("rifiuti_pulizia_urbana");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(item.evidenceStrength).toBe("moderata");
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.lastVerifiedAt).toBe("2026-10-30");
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.evaluationStudies.some((study) => study.doi === "10.3390/su9112046")).toBe(true);
    expect(EVIDENCE_INTERVENTIONS.filter((r) => r.id === item.id)).toHaveLength(1);
  });

  it("retains the non-randomised research design and correct outcome definition", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_30[0];
    expect(item.evaluationMethod).toContain("difference-in-differences");
    expect(item.evaluationMethod).toContain("propensity-score matching");
    expect(item.comparator).toContain("non è stata randomizzata");
    expect(item.effectSize).toContain("−0,460");
    expect(item.effectSize).toContain("−0,507");
    expect(item.effectSize).toContain("sette mesi");
    expect(item.results.toLowerCase()).toContain("non si può attribuire");
    expect(item.limitations.join(" ")).toContain("non randomizzata");
  });

  it("preserves cost, fairness, displacement and Italian legal safeguards", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_30[0];
    expect(item.costsRequirements).toContain("non dimostra un ritorno finanziario netto");
    expect(item.unintendedEffects).toContain("abbandoni");
    expect(item.transferabilityItaly).toContain("20 aprile 2017");
    expect(item.lameziaAdaptation).toContain("Lamezia Multiservizi");
  });
});
