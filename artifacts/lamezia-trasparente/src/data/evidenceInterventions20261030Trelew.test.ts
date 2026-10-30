import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_30_TRELEW } from "./evidenceInterventions20261030Trelew";

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

describe("municipal evidence archive: Trelew recycling RCT, 30 October 2026", () => {
  it("has one deduplicated intervention with all 34 canonical fields", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_30_TRELEW).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_10_30_TRELEW[0];
    expect(Object.keys(item).sort()).toEqual([...fields].sort());
    expect(item.id).toBe("trelew-argentina-recycling-sorting-simple-information-cluster-rct-2019");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach((kind) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(kind));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(item.evidenceStrength).toBe("forte");
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.lastVerifiedAt).toBe("2026-10-30");
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.evaluationStudies.some((s) => s.doi === "10.1016/j.wasman.2021.11.021")).toBe(true);
    expect(EVIDENCE_INTERVENTIONS.filter((r) => r.id === item.id)).toHaveLength(1);
  });

  it("distinguishes odds ratios, observation waves and rollout", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_30_TRELEW[0];
    expect(item.evaluationMethod).toContain("400 isolati");
    expect(item.effectSize).toContain("0,32");
    expect(item.effectSize).toContain("0,38");
    expect(item.effectSize).toContain("NON sono cali");
    expect(item.population).toContain("1.565");
    expect(item.population).toContain("1.568");
    expect(item.limitations.join(" ")).toContain("rollout");
    expect(item.results).toContain("non costituiscono un campione randomizzato");
  });

  it("preserves selection limitations and municipal applicability", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_30_TRELEW[0];
    expect(item.limitations.join(" ")).toContain("reddito medio-alto");
    expect(item.unintendedEffects).toContain("esposizioni fuori orario");
    expect(item.lameziaAdaptation).toContain("Lamezia Multiservizi");
    expect(item.lameziaAdaptation).toContain("frazione/mastello/giorno/orario");
  });
});
