import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_27 } from "./evidenceInterventions20261027";

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

describe("municipal evidence: Jericó water conservation RCT, 27 October 2026", () => {
  it("has 34 populated fields, canonical taxonomies and a single indexed record", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_27).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_10_27[0];
    expect(Object.keys(item).sort()).toEqual([...requiredFields].sort());
    expect(item.id).toMatch(/^[a-z0-9-]+$/);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach((a) => expect(EVIDENCE_THEMATIC_AREAS).toContain(a));
    item.interventionTypes.forEach((t) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(t));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(item.evidenceStrength).not.toBe("da_verificare");
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.evaluationStudies).toHaveLength(3);
    item.evaluationStudies.forEach((s) => expect(s.url).toMatch(/^https:\/\//));
    expect(item.revisionHistory.length).toBeGreaterThan(0);
    expect(item.lastVerifiedAt).toBe("2026-10-27");
    expect(EVIDENCE_INTERVENTIONS.filter((i) => i.id === item.id)).toHaveLength(1);
  });

  it("distinguishes randomised direct effects from the non-random town-level spillover comparison", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_27[0];
    expect(item.primaryArea).toBe("ambiente_clima_energia");
    expect(item.evidenceStrength).toBe("forte");
    expect(item.effectSize).toContain("6,822%");
    expect(item.effectSize).toContain("4,605%");
    expect(item.evaluationMethod.toLowerCase()).toContain("non randomizzato");
    expect(item.limitations.join(" ").toLowerCase()).toContain("contatori");
    expect(item.evaluationStudies.some((s) => s.doi === "10.1016/j.jeem.2018.08.005")).toBe(true);
    expect(item.lameziaAdaptation).toContain("Sorical");
  });
});
