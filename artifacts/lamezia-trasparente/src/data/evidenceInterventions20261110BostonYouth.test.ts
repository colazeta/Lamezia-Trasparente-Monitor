import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_10_BOSTON_YOUTH } from "./evidenceInterventions20261110BostonYouth";
const KEYS = ["id","title","authority","territory","country","implementationYear","problem","measure","mechanism","population","primaryArea","secondaryAreas","interventionTypes","tools","territorialScale","interventionStatus","evaluationMethod","comparator","outcomes","results","effectSize","evidenceStrength","costsRequirements","limitations","unintendedEffects","primarySource","evaluationStudies","lastVerifiedAt","transferabilityItaly","lameziaAdaptation","implementability","capacityDataNeeds","tags","revisionHistory"];
describe("Boston summer youth jobs lottery RCT intake — 2026-11-10", () => {
 const row = EVIDENCE_INTERVENTIONS_2026_11_10_BOSTON_YOUTH[0];
 it("meets 34-field schema, uses stable taxonomies and appears only once in the archive", () => {
  expect(EVIDENCE_INTERVENTIONS_2026_11_10_BOSTON_YOUTH).toHaveLength(1);
  expect(Object.keys(row).sort()).toEqual([...KEYS].sort());
  expect(EVIDENCE_INTERVENTIONS.filter(x => x.id === row.id)).toHaveLength(1);
  expect(EVIDENCE_THEMATIC_AREAS).toContain(row.primaryArea);
  row.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
  row.interventionTypes.forEach(t => expect(EVIDENCE_INTERVENTION_TYPES).toContain(t));
  expect(EVIDENCE_STRENGTHS).toContain(row.evidenceStrength);
  expect(EVIDENCE_IMPLEMENTABILITY).toContain(row.implementability);
  expect(row.lastVerifiedAt).toBe(row.revisionHistory.at(-1)?.date);
 });
 it("preserves one lottery / two evaluations and court-charge vs graduation causal distinctions", () => {
  expect(row.comparator).toContain("3.049");
  expect(row.population).toContain("4.235");
  expect(row.evaluationMethod).toContain("Randomized admission lottery");
  expect(row.results).toContain("FREQUENZA");
  expect(row.results).toContain("PROBABILITÀ");
  expect(row.effectSize).toContain("−0,031");
  expect(row.effectSize).toContain("+4,4");
  expect(row.limitations.join(" ")).toContain("non repliche indipendenti");
  expect(row.costsRequirements).toContain("600 USD");
 });
 it("documents live municipal programme, original evaluations and Italian safeguards", () => {
  expect(row.primarySource.url).toContain("boston.gov/");
  expect(row.evaluationStudies.map(x => x.doi)).toContain("10.1002/pam.22138");
  expect(row.evaluationStudies.map(x => x.doi)).toContain("10.1162/edfp_a_00371");
  expect(row.lameziaAdaptation).toContain("La mia estate");
  expect(row.transferabilityItaly).toContain("lavoro minorile");
  expect(row.revisionHistory).toHaveLength(1);
 });
});
