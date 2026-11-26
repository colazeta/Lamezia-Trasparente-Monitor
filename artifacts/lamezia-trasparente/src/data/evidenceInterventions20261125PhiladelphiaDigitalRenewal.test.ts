import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_25_PHILADELPHIA_DIGITAL_RENEWAL } from "./evidenceInterventions20261125PhiladelphiaDigitalRenewal";
const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];
describe("Philadelphia digital renewal letter RCT 2017", () => {
 const item = EVIDENCE_INTERVENTIONS_2026_11_25_PHILADELPHIA_DIGITAL_RENEWAL[0];
 it("registers a complete canonical record exactly once", () => {
  expect(EVIDENCE_INTERVENTIONS_2026_11_25_PHILADELPHIA_DIGITAL_RENEWAL).toHaveLength(1);
  expect(Object.keys(item).sort()).toEqual(FIELDS);
  expect(EVIDENCE_INTERVENTIONS.filter(record => record.id === item.id)).toHaveLength(1);
  expect(item.primaryArea).toBe("digitalizzazione_servizi_online");
  expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
  item.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
  item.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
  expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
  expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
  expect(item.revisionHistory.at(-1)?.date).toBe(item.lastVerifiedAt);
 });
 it("preserves the evidence and the channel adoption limitation", () => {
  expect(item.population).toContain("11.579");
  expect(item.results).toContain("12,3%");
  expect(item.results).toContain("20,4%");
  expect(item.effectSize).toContain("+8,1 pp");
  expect(item.results).toContain("Nessun effetto dimostrato sul risparmio");
  expect(item.evaluationStudies[0].doi).toBe("10.30636/jbpa.41.207");
  expect(item.lameziaAdaptation).toContain("senza togliere accesso a nessuno");
 });
});
