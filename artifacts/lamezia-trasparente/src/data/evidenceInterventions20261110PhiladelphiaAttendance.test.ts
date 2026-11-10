import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_10_PHILADELPHIA_ATTENDANCE } from "./evidenceInterventions20261110PhiladelphiaAttendance";
const KEYS = ["id","title","authority","territory","country","implementationYear","problem","measure","mechanism","population","primaryArea","secondaryAreas","interventionTypes","tools","territorialScale","interventionStatus","evaluationMethod","comparator","outcomes","results","effectSize","evidenceStrength","costsRequirements","limitations","unintendedEffects","primarySource","evaluationStudies","lastVerifiedAt","transferabilityItaly","lameziaAdaptation","implementability","capacityDataNeeds","tags","revisionHistory"];
describe("Philadelphia school attendance postcard RCT — 2026-11-10 intake", () => {
 const row = EVIDENCE_INTERVENTIONS_2026_11_10_PHILADELPHIA_ATTENDANCE[0];
 it("contains exactly the full schema with stable taxonomies and one canonical record", () => {
  expect(EVIDENCE_INTERVENTIONS_2026_11_10_PHILADELPHIA_ATTENDANCE).toHaveLength(1);
  expect(Object.keys(row).sort()).toEqual([...KEYS].sort());
  expect(EVIDENCE_INTERVENTIONS.filter(x=>x.id===row.id)).toHaveLength(1);
  expect(EVIDENCE_THEMATIC_AREAS).toContain(row.primaryArea);
  row.secondaryAreas.forEach(area=>expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
  row.interventionTypes.forEach(t=>expect(EVIDENCE_INTERVENTION_TYPES).toContain(t));
  expect(EVIDENCE_STRENGTHS).toContain(row.evidenceStrength);
  expect(EVIDENCE_IMPLEMENTABILITY).toContain(row.implementability);
  expect(row.lastVerifiedAt).toBe(row.revisionHistory.at(-1)?.date);
 });
 it("preserves causal distinctions and comparators, avoiding outcome inflation", () => {
  expect(row.evidenceStrength).toBe("forte");
  expect(row.evaluationMethod).toContain("Randomized controlled trial");
  expect(row.comparator).toContain("12.710");
  expect(row.effectSize).toContain("2,4%");
  expect(row.effectSize).toContain("−0,16");
  expect(row.effectSize).toContain("NON significativo");
  expect(row.limitations.join(" ")).toContain("43 giorni");
  expect(row.results).toContain("Non si sono misurati causalmente");
 });
 it("keeps original IES source and explicit legal transferability", () => {
  expect(row.primarySource.url).toContain("ies.ed.gov");
  expect(row.evaluationStudies[0].url).toContain("REL_2017252.pdf");
  expect(row.transferabilityItaly).toContain("dirigenti");
  expect(row.lameziaAdaptation).toContain("Politiche educative");
  expect(row.revisionHistory.length).toBeGreaterThan(0);
 });
});
