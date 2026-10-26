import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_26 } from "./evidenceInterventions20261026";

const requiredFields = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea",
  "secondaryAreas", "interventionTypes", "tools", "territorialScale",
  "interventionStatus", "evaluationMethod", "comparator", "outcomes",
  "results", "effectSize", "evidenceStrength", "costsRequirements",
  "limitations", "unintendedEffects", "primarySource", "evaluationStudies",
  "lastVerifiedAt", "transferabilityItaly", "lameziaAdaptation",
  "implementability", "capacityDataNeeds", "tags", "revisionHistory",
] as const;

describe("municipal evidence, 26 October 2026", () => {
  it("has 34 fully populated fields, canonical categories, and one archive record", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_26).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_10_26[0];
    expect(Object.keys(item).sort()).toEqual([...requiredFields].sort());
    expect(item.id).toMatch(/^[a-z0-9-]+$/);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(item.evidenceStrength).not.toBe("da_verificare");
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.evaluationStudies.length).toBeGreaterThanOrEqual(2);
    item.evaluationStudies.forEach((study) => expect(study.url).toMatch(/^https:\/\//));
    expect(item.revisionHistory).toHaveLength(1);
    expect(item.limitations.length).toBeGreaterThan(0);
    expect(item.lastVerifiedAt).toBe("2026-10-26");
    expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
  });

  it("keeps causal claims, descriptive food security shares and limitations distinct", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_26[0];
    expect(item.evidenceStrength).toBe("forte");
    expect(item.effectSize).toContain("50,6%");
    expect(item.effectSize).toContain("35,0%");
    expect(item.effectSize).toContain("NON è la stima causale aggiustata");
    expect(item.results).toContain("non rileva un effetto statisticamente distinguibile da zero");
    expect(item.limitations.join(" ")).toContain("attrition");
    expect(item.evaluationStudies.some((s) => s.doi === "10.21034/iwp.108")).toBe(true);
    expect(item.implementationYear).toContain("2022");
  });
});
