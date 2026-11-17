import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_17_NEWARK_LED } from "./evidenceInterventions20261117NewarkLed";

const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("Newark targeted LED streetlight upgrades — 2026-11-17", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_17_NEWARK_LED[0];

  it("uses the 34-field canonical schema, controlled vocabularies and unique ID", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_17_NEWARK_LED).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual(FIELDS);
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
  });

  it("preserves intervention locality, primary study, and quasi-experimental design", () => {
    expect(record.primaryArea).toBe("sicurezza_urbana_prevenzione");
    expect(record.authority).toContain("PSE&G");
    expect(record.territory).toContain("Newark");
    expect(record.evaluationMethod).toContain("difference-in-differences");
    expect(record.evaluationMethod).toContain("Non randomizzato");
    expect(record.evaluationStudies.some(s => s.doi === "10.1007/s10940-026-09690-6")).toBe(true);
    expect(record.evidenceStrength).toBe("moderata");
  });

  it("does not overstate short-term effects, displacement, long-term effects, or transferability", () => {
    expect(record.effectSize).toContain("−46%");
    expect(record.effectSize).toContain("8 trimestri");
    expect(record.results).toContain("non emerge");
    expect(record.unintendedEffects).toContain("settimo trimestre");
    expect(record.costsRequirements).toContain("non è riportato");
    expect(record.lameziaAdaptation).toContain("CityGreenApp");
    expect(record.lastVerifiedAt).toBe("2026-11-17");
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
    expect(record.id).not.toContain("philadelphia");
  });
});
