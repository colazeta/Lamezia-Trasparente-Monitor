import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_30_MAPUTO } from "./evidenceInterventions20261030Maputo";

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

describe("municipal evidence archive: Maputo household waste segregation RCT", () => {
  it("contains a single intervention with the 34 canonical fields", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_30_MAPUTO).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_10_30_MAPUTO[0];
    expect(Object.keys(item).sort()).toEqual([...fields].sort());
    expect(item.id).toBe("maputo-mozambique-household-waste-segregation-support-rct-2014");
    expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.lastVerifiedAt).toBe("2026-10-30");
  });

  it("preserves RCT comparator and distinguishes absolute effects from longer-term results", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_30_MAPUTO[0];
    expect(item.evaluationMethod).toMatch(/(?:1000|1\\.000)/);
    expect(item.comparator).toContain("250");
    expect(item.effectSize).toContain("7,5");
    expect(item.effectSize).toContain("10,6");
    expect(item.effectSize).toContain("punti percentuali");
    expect(item.effectSize).toContain("267,4");
    expect(item.effectSize).toContain("25,57");
    expect(item.evaluationStudies.some((study) => study.doi === "10.1007/s10163-017-0677-2")).toBe(true);
    expect(item.primarySource.url).toMatch(/^https:\/\//);
  });

  it("preserves cost-effectiveness limitations and actionable local adaptation", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_30_MAPUTO[0];
    expect(item.evidenceStrength).toBe("forte");
    expect(item.implementability).toBe("medio_termine");
    expect(item.limitations.join(" ")).toContain("Costo-efficacia bassa");
    expect(item.lameziaAdaptation).toContain("Lamezia Multiservizi");
    expect(item.lameziaAdaptation).toContain("impurità");
    expect(item.revisionHistory).toHaveLength(1);
  });
});
