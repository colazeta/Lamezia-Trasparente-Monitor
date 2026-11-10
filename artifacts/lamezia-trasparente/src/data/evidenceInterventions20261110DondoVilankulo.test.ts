import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_10_DONDO_VILANKULO } from "./evidenceInterventions20261110DondoVilankulo";

const EXPECTED_KEYS = ["id","title","authority","territory","country","implementationYear","problem","measure","mechanism","population","primaryArea","secondaryAreas","interventionTypes","tools","territorialScale","interventionStatus","evaluationMethod","comparator","outcomes","results","effectSize","evidenceStrength","costsRequirements","limitations","unintendedEffects","primarySource","evaluationStudies","lastVerifiedAt","transferabilityItaly","lameziaAdaptation","implementability","capacityDataNeeds","tags","revisionHistory"];
describe("Municipal evidence 2026-11-10 — Dondo/Vilankulo IPRA notifications", () => {
 const row=EVIDENCE_INTERVENTIONS_2026_11_10_DONDO_VILANKULO[0];
 it("uses canonical schema and stable taxonomies", () => {
  expect(EVIDENCE_INTERVENTIONS_2026_11_10_DONDO_VILANKULO).toHaveLength(1);
  expect(Object.keys(row).sort()).toEqual([...EXPECTED_KEYS].sort());
  expect(EVIDENCE_INTERVENTIONS.filter(x=>x.id===row.id)).toHaveLength(1);
  expect(EVIDENCE_THEMATIC_AREAS).toContain(row.primaryArea);
  row.secondaryAreas.forEach(a=>expect(EVIDENCE_THEMATIC_AREAS).toContain(a));
  row.interventionTypes.forEach(t=>expect(EVIDENCE_INTERVENTION_TYPES).toContain(t));
  expect(EVIDENCE_STRENGTHS).toContain(row.evidenceStrength);
  expect(EVIDENCE_IMPLEMENTABILITY).toContain(row.implementability);
  expect(row.revisionHistory[0].date).toBe(row.lastVerifiedAt);
 });
 it("does not misrepresent post-treatment non-delivery as randomized no-letter control", () => {
  expect(row.evidenceStrength).toBe("moderata");
  expect(row.evaluationMethod).toContain("NON è randomizzato");
  expect(row.comparator).toContain("non assegnato casualmente");
  expect(row.effectSize).toContain("+0,0509");
  expect(row.effectSize).toContain("+0,0842");
  expect(row.effectSize).toContain("NON significativo");
  expect(row.results).toContain("non era randomizzato");
  expect(row.unintendedEffects).toContain("imprese");
 });
 it("preserves provenance, no duplication by original DOI and local administrative specificity", () => {
  expect(row.evaluationStudies[0].doi).toBe("10.1002/pa.2960");
  expect(row.primarySource.url).toContain("rie.deval.org");
  expect(row.lameziaAdaptation).toContain("TARI 2026");
  expect(row.lameziaAdaptation).toContain("NON replicare");
  expect(EVIDENCE_INTERVENTIONS.filter(x=>x.evaluationStudies.some(s=>s.doi==="10.1002/pa.2960"))).toHaveLength(1);
 });
});
