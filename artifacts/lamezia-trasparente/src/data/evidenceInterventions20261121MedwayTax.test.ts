import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_21_MEDWAY_TAX } from "./evidenceInterventions20261121MedwayTax";

const FIELDS = ["authority", "capacityDataNeeds", "comparator", "costsRequirements", "country", "effectSize", "evaluationMethod", "evaluationStudies", "evidenceStrength", "id", "implementability", "implementationYear", "interventionStatus", "interventionTypes", "lameziaAdaptation", "lastVerifiedAt", "limitations", "measure", "mechanism", "outcomes", "population", "primaryArea", "primarySource", "problem", "results", "revisionHistory", "secondaryAreas", "tags", "territorialScale", "territory", "title", "tools", "transferabilityItaly", "unintendedEffects"];

describe("2026-11-21 Medway Council Tax reminder RCT", () => {
  const cases = EVIDENCE_INTERVENTIONS_2026_11_21_MEDWAY_TAX;
  it("contains one canonical, complete, deduplicated record with valid stable taxonomies", () => {
    expect(cases).toHaveLength(1);
    const item = cases[0];
    expect(Object.keys(item).sort()).toEqual(FIELDS);
    expect(item.id).toBe("medway-council-tax-reminder-behavioural-letters-rct-2015");
    expect(EVIDENCE_INTERVENTIONS.filter(x => x.id === item.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach(a => expect(EVIDENCE_THEMATIC_AREAS).toContain(a));
    item.interventionTypes.forEach(t => expect(EVIDENCE_INTERVENTION_TYPES).toContain(t));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.primaryArea).toBe("fiscalita_entrate_riscossione");
    expect(item.evidenceStrength).toBe("forte");
    expect(item.implementability).toBe("quick_win");
    expect(item.lastVerifiedAt).toBe("2026-11-21");
    expect(item.revisionHistory.at(-1)?.date).toBe(item.lastVerifiedAt);
  });

  it("preserves the actual 7-day randomized outcome and both experimental arms", () => {
    const item = cases[0];
    expect(item.effectSize).toContain("12,72");
    expect(item.effectSize).toContain("6,87");
    expect(item.effectSize).toContain("9.130");
    expect(item.results).toContain("62,97%");
    expect(item.results).toContain("75,69%");
    expect(item.results).toContain("69,84%");
    expect(item.evaluationMethod).toContain("35");
    expect(item.evaluationStudies.some(s => s.doi === "10.30636/jbpa.21.54")).toBe(true);
  });

  it("does not equate earlier payments with net new revenue or automatically transfer UK social norms", () => {
    const item = cases[0];
    expect(item.results).toContain("ANTICIPATI");
    expect(item.effectSize).toContain("non verifica");
    expect(item.limitations.some(x => x.includes("Lambeth"))).toBe(true);
    expect(item.transferabilityItaly).toContain("96%");
    expect(item.lameziaAdaptation).toContain("PagoPA");
    expect(item.unintendedEffects).toMatch(/fragili|colpevolizzanti/);
    expect(item.primarySource.url.startsWith("https://")).toBe(true);
    expect(item.capacityDataNeeds.length).toBeGreaterThanOrEqual(5);
  });
});
