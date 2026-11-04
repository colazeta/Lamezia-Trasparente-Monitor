import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_04 } from "./evidenceInterventions20261104";

const REQUIRED_FIELDS = [
  "id","title","authority","territory","country","implementationYear","problem",
  "measure","mechanism","population","primaryArea","secondaryAreas","interventionTypes",
  "tools","territorialScale","interventionStatus","evaluationMethod","comparator",
  "outcomes","results","effectSize","evidenceStrength","costsRequirements",
  "limitations","unintendedEffects","primarySource","evaluationStudies","lastVerifiedAt",
  "transferabilityItaly","lameziaAdaptation","implementability","capacityDataNeeds",
  "tags","revisionHistory",
] as const;

describe("Municipal evidence 2026-11-04 — Brazilian solid waste public consortia", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_04[0];

  it("publishes one complete, typed and uniquely indexed case", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_04).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    for (const area of record.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
    for (const type of record.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.lastVerifiedAt).toBe("2026-11-04");
    expect(record.revisionHistory).toHaveLength(1);
  });

  it("distinguishes quasi-experimental evidence, positive and adverse results", () => {
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.evaluationMethod).toMatch(/staggered difference-in-differences/i);
    expect(record.evaluationMethod).toContain("NON randomizzata");
    expect(record.effectSize).toContain("−0,000127");
    expect(record.effectSize).toContain("+0,000103");
    expect(record.results).toContain("aumenti significativi");
    expect(record.limitations.join(" ")).toContain("confronti multipli");
    expect(record.unintendedEffects).toContain("ricoveri");
  });

  it("does not claim a cash saving or duplicate the existing Brazilian fiscal interventions", () => {
    expect(record.primaryArea).toBe("capacita_amministrativa_personale");
    expect(record.interventionTypes).not.toContain("partnership_pubblico_privato_terzo_settore");
    expect(record.evaluationStudies[0].doi).toBe("10.1016/j.heliyon.2024.e26032");
    expect(record.primarySource.url).toMatch(/^https:\/\//);
    expect(record.lameziaAdaptation).toContain("ARRICAL");
    expect(record.costsRequirements).toContain("non fornisce un costo");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.evaluationStudies.some(s => s.doi === record.evaluationStudies[0].doi))).toHaveLength(1);
  });
});
