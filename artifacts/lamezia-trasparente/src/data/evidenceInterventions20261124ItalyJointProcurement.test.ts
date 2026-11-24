import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_24_ITALY_JOINT_PROCUREMENT } from "./evidenceInterventions20261124ItalyJointProcurement";
const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];
describe("2026-11-24 joint public works procurement", () => {
 const cases = EVIDENCE_INTERVENTIONS_2026_11_24_ITALY_JOINT_PROCUREMENT;
 const item = cases[0];
 it("registers one complete canonical record", () => {
  expect(cases).toHaveLength(1);
  expect(Object.keys(item).sort()).toEqual(FIELDS);
  expect(EVIDENCE_INTERVENTIONS.filter(record => record.id === item.id)).toHaveLength(1);
  expect(item.primaryArea).toBe("procurement_spesa_pubblica");
  expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
  item.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
  item.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
  expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
  expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
  expect(item.revisionHistory.at(-1)?.date).toBe(item.lastVerifiedAt);
 });
 it("preserves the matched results and their units and limitations", () => {
  expect(item.population).toContain("50.905");
  expect(item.results).toContain("−54,64");
  expect(item.results).toContain("−38,86");
  expect(item.results).toContain("non significativamente");
  expect(item.effectSize).toContain("non riduzione percentuale della durata totale");
  expect(item.evaluationStudies[0].doi).toBe("10.1080/00343404.2024.2350615");
  expect(item.limitations.some(text => text.includes("1.022"))).toBe(true);
  expect(item.evidenceStrength).toBe("moderata");
  expect(item.lameziaAdaptation).toContain("Non equiparare SUAM e Unione");
 });
});
