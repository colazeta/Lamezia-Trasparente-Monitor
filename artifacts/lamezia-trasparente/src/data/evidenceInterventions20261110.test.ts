import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_10_FREETOWN } from "./evidenceInterventions20261110Freetown";
import { EVIDENCE_INTERVENTIONS_2026_11_10_YOUNGSTOWN } from "./evidenceInterventions20261110Youngstown";

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
const records = [
  ...EVIDENCE_INTERVENTIONS_2026_11_10_FREETOWN,
  ...EVIDENCE_INTERVENTIONS_2026_11_10_YOUNGSTOWN,
];

describe("Evidence interventions 2026-11-10: Freetown and Youngstown", () => {
  it("has two distinct records, all 34 mandatory fields and allowed stable taxonomy values", () => {
    expect(records).toHaveLength(2);
    expect(new Set(records.map(record => record.id)).size).toBe(2);
    for (const record of records) {
      expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
      expect(EVIDENCE_INTERVENTIONS.filter(x => x.id === record.id)).toHaveLength(1);
      expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
      expect(record.secondaryAreas).not.toContain(record.primaryArea);
      for (const area of record.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of record.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
      expect(record.evaluationStudies.length).toBeGreaterThan(0);
      expect(record.primarySource.url).toMatch(/^https:\/\//);
      for (const study of record.evaluationStudies) expect(study.url).toMatch(/^https:\/\//);
      expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
      expect(record.capacityDataNeeds.length).toBeGreaterThan(0);
      expect(record.transferabilityItaly).toContain("Italia");
    }
  });

  it("guards Freetown's relative monetary effect from mistaken percentage-point compliance claims", () => {
    const record = EVIDENCE_INTERVENTIONS_2026_11_10_FREETOWN[0];
    expect(record.primaryArea).toBe("fiscalita_entrate_riscossione");
    expect(record.evidenceStrength).toBe("forte");
    expect(record.evaluationMethod).toContain("Randomized controlled trial");
    expect(record.effectSize).toContain("+23,784 SLE");
    expect(record.effectSize).toContain("+20,0% relativo");
    expect(record.effectSize).toContain("non significativo");
    expect(record.results).toContain("IMPORTO MEDIO");
    expect(record.results).toContain("NON statisticamente significativo");
    expect(record.limitations.join(" ")).toContain("telefonata neutra");
  });

  it("guards Youngstown matched observational DiD, vehicle theft adverse outcomes and nonduplication with Philadelphia", () => {
    const record = EVIDENCE_INTERVENTIONS_2026_11_10_YOUNGSTOWN[0];
    expect(record.id).not.toBe("philadelphia-vacant-lot-greening");
    expect(record.primaryArea).toBe("urbanistica_rigenerazione");
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.evaluationMethod).toContain("difference-in-differences");
    expect(record.evaluationMethod).toContain("non sono state randomizzate");
    expect(record.effectSize).toContain("IRR 0,80");
    expect(record.unintendedEffects).toContain("aumento dei furti");
    expect(record.limitations.join(" ")).toContain("selezione");
  });

  it("preserves original source provenance and unique studies in the published archive", () => {
    const doi = "10.1177/0042098015608058";
    const youngstown = EVIDENCE_INTERVENTIONS_2026_11_10_YOUNGSTOWN[0];
    const freetown = EVIDENCE_INTERVENTIONS_2026_11_10_FREETOWN[0];
    expect(youngstown.evaluationStudies[0].doi).toBe(doi);
    expect(EVIDENCE_INTERVENTIONS.filter(x => x.evaluationStudies.some(study => study.doi === doi))).toHaveLength(1);
    expect(freetown.evaluationStudies.some(study => study.doi === "10.1257/rct.9207-1.0")).toBe(true);
    expect(freetown.primarySource.url).toContain("theigc.org");
    expect(youngstown.primarySource.url).toContain("yndc.org");
    expect(EVIDENCE_INTERVENTIONS.some(x => x.id === "philadelphia-vacant-lot-greening")).toBe(true);
  });
});
