import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_02_GALICIA } from "./evidenceInterventions20261102Galicia";
const keys = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];
describe("Galicia seven-city integrated child inclusion trial, 2026-11-02", () => {
  it("validates the canonical 34-field record, taxonomy and unique archive entry", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_02_GALICIA).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_11_02_GALICIA[0];
    expect(Object.keys(item).sort()).toEqual([...keys].sort());
    expect(EVIDENCE_INTERVENTIONS.filter((entry) => entry.id === item.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    expect(item.primaryArea).toBe("welfare_inclusione_servizi_sociali");
    for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
    for (const kind of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(kind);
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(item.evidenceStrength).toBe("forte");
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.lastVerifiedAt).toBe("2026-11-02");
    expect(item.revisionHistory.length).toBeGreaterThan(0);
  });
  it("preserves RCT urban scope, sample attrition, null outcomes and standardized outcomes", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_11_02_GALICIA[0];
    expect(item.population).toContain("2.359");
    expect(item.population).toContain("1.862");
    expect(item.evaluationMethod).toContain("sette città");
    expect(item.effectSize).toContain("+0,13");
    expect(item.effectSize).toContain("+0,19–0,25");
    expect(item.effectSize).toContain("deviazioni standard");
    expect(item.results).toContain("Non sono identificati effetti medi robusti");
    expect(item.limitations.join(" ")).toContain("rurali");
    expect(item.evaluationStudies.some((s) => s.doi === "10.1007/s13209-026-00340-5")).toBe(true);
  });
  it("documents incremental cost and safeguards in the Italian adaptation", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_11_02_GALICIA[0];
    expect(item.costsRequirements).toContain("1.132");
    expect(item.lameziaAdaptation).toContain("Ambito Territoriale Sociale di Lamezia");
    expect(item.transferabilityItaly).toContain("Assegno di inclusione");
    expect(item.primarySource.url).toMatch(/^https:\/\//);
  });
});
