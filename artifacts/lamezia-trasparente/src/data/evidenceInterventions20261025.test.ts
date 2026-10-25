import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_25 } from "./evidenceInterventions20261025";

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

describe("municipal evidence, 25 October 2026", () => {
  it("provides one complete, sourced, publishable and taxonomy-valid record", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_25).toHaveLength(1);
    for (const item of EVIDENCE_INTERVENTIONS_2026_10_25) {
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
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-10-25");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("does not misrepresent observational change or modelled cost benefits as causal estimates", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_25[0];
    expect(item.evidenceStrength).toBe("moderata");
    expect(item.effectSize).toContain("8,0→4,4");
    expect(item.effectSize).toContain("IC95%");
    expect(item.effectSize).toContain("non statisticamente distinta da zero");
    expect(item.results).toContain("non sono risparmi osservati");
    expect(item.limitations.join(" ")).toContain("intervallo al 95%");
    expect(item.evaluationStudies.some((study) => study.doi === "10.1186/s40621-014-0017-0")).toBe(true);
  });
});
