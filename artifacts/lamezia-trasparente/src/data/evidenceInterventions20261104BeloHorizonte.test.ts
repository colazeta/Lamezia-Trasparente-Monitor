import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_04_BELO_HORIZONTE } from "./evidenceInterventions20261104BeloHorizonte";

const REQUIRED_FIELDS = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea", "secondaryAreas",
  "interventionTypes", "tools", "territorialScale", "interventionStatus",
  "evaluationMethod", "comparator", "outcomes", "results", "effectSize",
  "evidenceStrength", "costsRequirements", "limitations", "unintendedEffects",
  "primarySource", "evaluationStudies", "lastVerifiedAt", "transferabilityItaly",
  "lameziaAdaptation", "implementability", "capacityDataNeeds", "tags",
  "revisionHistory",
] as const;

describe("Municipal evidence 2026-11-04 — Belo Horizonte licensing RCT", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_04_BELO_HORIZONTE[0];
  it("has 34 required fields, stable unique id and valid taxonomy", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_04_BELO_HORIZONTE).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.id).toBe("belo-horizonte-brazil-municipal-business-license-enforcement-rct-2011");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory[0].date).toBe(record.lastVerifiedAt);
  });
  it("does not conflate assignment effects, LATE or adverse effects", () => {
    expect(record.evaluationMethod).toMatch(/Randomized field experiment/);
    expect(record.effectSize).toMatch(/ITT/);
    expect(record.effectSize).toContain("0,0218");
    expect(record.effectSize).toContain("0,0392");
    expect(record.effectSize).toContain("LATE IV");
    expect(record.effectSize).toContain("INFERENZA DEBOLE");
    expect(record.unintendedEffects).toContain("−3,49");
    expect(record.limitations.join(" ")).toContain("attrition");
    expect(record.results).toContain("ALF");
  });
  it("retains evaluation provenance, legality and no extrapolated municipal profits", () => {
    expect(record.evaluationStudies[0].doi).toBe("10.1093/wber/lhu008");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.evaluationStudies.some(study => study.doi === record.evaluationStudies[0].doi))).toHaveLength(1);
    expect(record.primarySource.url).toMatch(/^https:\/\//);
    expect(record.lameziaAdaptation).toContain("CalabriaSUAP");
    expect(record.costsRequirements).toContain("non prova di saldo netto positivo");
    expect(record.implementability).toBe("medio_termine");
  });
});
