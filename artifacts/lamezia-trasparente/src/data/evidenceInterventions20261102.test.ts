import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_02 } from "./evidenceInterventions20261102";

const fields = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("Oakland beverage distribution tax: evidence intake 2026-11-02", () => {
  it("preserves all 34 fields, canonical taxonomy and exactly one archive entry", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_02).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_11_02[0];
    expect(Object.keys(item).sort()).toEqual([...fields].sort());
    expect(EVIDENCE_INTERVENTIONS.filter((entry) => entry.id === item.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    expect(item.primaryArea).toBe("salute_pubblica_locale");
    for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
    for (const kind of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(kind);
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(item.evidenceStrength).toBe("moderata");
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.lastVerifiedAt).toBe("2026-11-02");
    expect(item.revisionHistory).toHaveLength(1);
  });
  it("separates retail purchases from total consumption and modelled health outcomes", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_11_02[0];
    expect(item.effectSize).toContain("26,8%");
    expect(item.effectSize).toContain("22,4%");
    expect(item.effectSize).toContain("non significativo");
    expect(item.results).toContain("non trovano diminuzioni statisticamente significative");
    expect(item.results).toContain("microsimulazioni");
    expect(item.limitations.join(" ")).toContain("Cawley et al. (2020)");
    expect(item.evaluationStudies.some((s) => s.doi === "10.1371/journal.pmed.1004212")).toBe(true);
    expect(item.evaluationStudies.some((s) => s.doi === "10.1016/j.ehb.2020.100865")).toBe(true);
  });
  it("preserves tax-competence limitations and an actionable non-fiscal Lamezia adaptation", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_11_02[0];
    expect(item.transferabilityItaly).toContain("art. 52");
    expect(item.lameziaAdaptation).toContain("refezione scolastica");
    expect(item.lameziaAdaptation).toContain("nessuna tassa comunale");
    expect(item.primarySource.url).toMatch(/^https:\/\//);
  });
});
