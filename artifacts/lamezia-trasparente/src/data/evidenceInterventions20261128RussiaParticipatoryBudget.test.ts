import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_28_RUSSIA_PARTICIPATORY_BUDGET } from "./evidenceInterventions20261128RussiaParticipatoryBudget";
const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];
describe("Rural Russia participatory budgeting trial", () => {
  const item = EVIDENCE_INTERVENTIONS_2026_11_28_RUSSIA_PARTICIPATORY_BUDGET[0];
  it("registers exactly one complete record with established taxonomy", () => {
    expect(Object.keys(item).sort()).toEqual(FIELDS);
    expect(EVIDENCE_INTERVENTIONS.filter(record => record.id === item.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.revisionHistory.at(-1)?.date).toBe(item.lastVerifiedAt);
  });
  it("retains provenance, null results and subgroup caveats", () => {
    expect(item.population).toContain("109");
    expect(item.results).toContain("non significativa nel campione complessivo");
    expect(item.effectSize).toContain("+33,46 USD");
    expect(item.effectSize).toContain("solo al 10%");
    expect(item.limitations.join(" ")).toContain("non verificati nella versione finale");
    expect(item.evaluationStudies.map(study => study.doi)).toContain("10.1007/s10101-018-0214-3");
    expect(item.evidenceStrength).toBe("moderata");
  });
});
