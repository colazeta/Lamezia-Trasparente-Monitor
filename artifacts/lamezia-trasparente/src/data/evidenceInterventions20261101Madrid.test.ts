import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_01_MADRID } from "./evidenceInterventions20261101Madrid";

const fields = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("Madrid Central LEZ and educational outcomes: 1 November 2026", () => {
  it("keeps exactly one verified, 34-field record on the site archive", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_01_MADRID).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_11_01_MADRID[0];
    expect(Object.keys(item).sort()).toEqual([...fields].sort());
    expect(EVIDENCE_INTERVENTIONS.filter((x) => x.id === item.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
    for (const kind of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(kind);
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(item.evidenceStrength).toBe("moderata");
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.lastVerifiedAt).toBe("2026-11-01");
    expect(item.revisionHistory).toHaveLength(1);
  });
  it("distinguishes air pollution, school outcomes and uncertain local spillovers", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_11_01_MADRID[0];
    expect(item.comparator).toContain("251 scuole");
    expect(item.comparator).toContain("10 all'interno");
    expect(item.effectSize).toContain("5,94");
    expect(item.effectSize).toContain("+0,198");
    expect(item.effectSize).toContain("+0,157");
    expect(item.effectSize).toContain("p≤0,10");
    expect(item.effectSize).toContain("non significativo");
    expect(item.evaluationStudies.some((s) => s.doi === "10.1007/s11111-025-00477-8")).toBe(true);
    expect(item.primarySource.url).toMatch(/^https:\/\//);
  });
  it("preserves small-treated-group, Covid and potential commerce trade-offs", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_11_01_MADRID[0];
    expect(item.limitations.join(" ")).toContain("10 scuole");
    expect(item.limitations.join(" ")).toContain("COVID-19");
    expect(item.unintendedEffects).toContain("commerciale");
    expect(item.lameziaAdaptation).toContain("PGTU");
  });
});
