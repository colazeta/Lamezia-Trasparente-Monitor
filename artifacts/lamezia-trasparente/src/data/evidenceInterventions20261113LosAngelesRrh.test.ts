import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_13_LOS_ANGELES_RRH } from "./evidenceInterventions20261113LosAngelesRrh";

const FIELDS = ["id","title","authority","territory","country","implementationYear","problem","measure","mechanism","population","primaryArea","secondaryAreas","interventionTypes","tools","territorialScale","interventionStatus","evaluationMethod","comparator","outcomes","results","effectSize","evidenceStrength","costsRequirements","limitations","unintendedEffects","primarySource","evaluationStudies","lastVerifiedAt","transferabilityItaly","lameziaAdaptation","implementability","capacityDataNeeds","tags","revisionHistory"];
describe("Los Angeles RRH evidence record, 2026-11-13", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_13_LOS_ANGELES_RRH[0];
  it("has 34 canonical fields, controlled taxonomies and exactly one archive entry", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_13_LOS_ANGELES_RRH).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...FIELDS].sort());
    expect(EVIDENCE_INTERVENTIONS.filter(x => x.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(x => expect(EVIDENCE_THEMATIC_AREAS).toContain(x));
    record.interventionTypes.forEach(x => expect(EVIDENCE_INTERVENTION_TYPES).toContain(x));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
  });
  it("does not claim randomisation or certainty from matched observational contrasts", () => {
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.evaluationMethod).toContain("NON è un RCT");
    expect(record.comparator).toContain("NON");
    expect(record.effectSize).toContain("−11,8 punti");
    expect(record.effectSize).toContain("−12,1 punti");
    expect(record.results).toContain("si attenua");
    expect(record.limitations.join(" ")).toContain("NON è randomizzato");
    expect(record.limitations.join(" ")).toContain("Santa Clara");
  });
  it("traces publisher, implementing authority, 2026 status and Italian safeguards", () => {
    expect(record.primarySource.url).toContain("lahsa.org");
    expect(record.evaluationStudies[0].doi).toBe("10.1016/j.jue.2026.103889");
    expect(record.evaluationStudies.some(s => s.url.includes("capolicylab.org"))).toBe(true);
    expect(record.interventionStatus).toContain("sospensione");
    expect(record.lameziaAdaptation).toContain("Ambito territoriale sociale");
    expect(record.lastVerifiedAt).toBe("2026-11-13");
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
  });
});
