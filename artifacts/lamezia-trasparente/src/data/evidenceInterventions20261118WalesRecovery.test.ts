import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_18_WALES_RECOVERY } from "./evidenceInterventions20261118WalesRecovery";

const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("Wales education recovery boards — 2026-11-18", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_18_WALES_RECOVERY[0];

  it("matches the canonical 34-field schema, vocabularies and unique ID", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_18_WALES_RECOVERY).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual(FIELDS);
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
  });

  it("retains verifiable authorities, research design and original peer-reviewed DOI", () => {
    expect(record.primaryArea).toBe("capacita_amministrativa_personale");
    expect(record.authority).toContain("Welsh Government");
    expect(record.territory).toContain("Monmouthshire");
    expect(record.evaluationMethod).toContain("synthetic difference-in-differences");
    expect(record.evaluationMethod).toContain("Nessuna randomizzazione");
    expect(record.evaluationStudies.some(study => study.doi === "10.1111/padm.70050")).toBe(true);
    expect(record.primarySource.url).toContain("gov.wales");
    expect(record.evidenceStrength).toBe("moderata");
  });

  it("preserves heterogeneous results, adverse attendance and limits to Italian transferability", () => {
    expect(record.results).toContain("Pembrokeshire");
    expect(record.results).toContain("Torfaen");
    expect(record.results).toContain("svanisce");
    expect(record.unintendedEffects).toContain("assenza");
    expect(record.effectSize).toContain("+10%");
    expect(record.limitations.length).toBeGreaterThanOrEqual(5);
    expect(record.transferabilityItaly).toContain("Non trasferibile automaticamente");
    expect(record.implementationYear).toContain("2013");
    expect(record.lastVerifiedAt).toBe("2026-11-18");
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
  });
});
