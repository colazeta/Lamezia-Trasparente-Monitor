import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_14_MACERATA_MICROCHIPS } from "./evidenceInterventions20261114MacerataMicrochips";

const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];
describe("COSMARI Macerata microchipped bags quasi-experiment, 2026-11-14", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_14_MACERATA_MICROCHIPS[0];
  it("is a single complete canonical record with valid controlled vocabularies", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_14_MACERATA_MICROCHIPS).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...FIELDS].sort());
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
  });
  it("does not conflate identifying bags with pay-as-you-throw pricing", () => {
    expect(record.measure).toContain("NON era una tariffa pay-as-you-throw");
    expect(record.evaluationMethod).toContain("NON è un RCT");
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.effectSize).toContain("3–3,3 punti");
    expect(record.effectSize).toContain("1–2 kg");
    expect(record.costsRequirements).toContain("NEGATIVO");
    expect(record.costsRequirements).toContain("PREVENTIVI");
  });
  it("traces paper, primary municipal source, later local discontinuation and 2026 verification", () => {
    expect(record.primarySource.url).toContain("comune.macerata.it");
    expect(record.evaluationStudies.some(study => study.url.includes("comune.recanati.mc.it"))).toBe(true);
    expect(record.evaluationStudies.some(study => study.doi === "10.1007/s10018-021-00338-2")).toBe(true);
    expect(record.evaluationStudies.some(study => study.url.includes("univpm.it"))).toBe(true);
    expect(record.interventionStatus).toContain("Recanati");
    expect(record.limitations.join(" ")).toContain("GDPR");
    expect(record.lastVerifiedAt).toBe("2026-11-14");
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
  });
});
