import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_26_MARIENTHAL_MAGMA } from "./evidenceInterventions20261126MarienthalMagma";
const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];
describe("Marienthal MAGMA job guarantee", () => {
  const item = EVIDENCE_INTERVENTIONS_2026_11_26_MARIENTHAL_MAGMA[0];
  it("registers one complete canonical record", () => {
    expect(Object.keys(item).sort()).toEqual(FIELDS);
    expect(EVIDENCE_INTERVENTIONS.filter(record => record.id === item.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.revisionHistory.at(-1)?.date).toBe(item.lastVerifiedAt);
  });
  it("preserves distinct estimands and caveats", () => {
    expect(item.population).toContain("107");
    expect(item.effectSize).toContain("+555 giorni");
    expect(item.effectSize).toContain("237 euro");
    expect(item.effectSize).toContain("inclusi impieghi sovvenzionati");
    expect(item.evidenceStrength).toBe("moderata");
    expect(item.evaluationStudies[0].url).toContain("Jobguarantee_marienthal.pdf");
    expect(item.transferabilityItaly).toContain("non come diritto automatico");
  });
});
