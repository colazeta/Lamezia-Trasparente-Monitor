import { describe, expect, it } from "vitest";
import {
  EVIDENCE_THEMATIC_AREAS,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_IMPLEMENTABILITY,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_02_RICANY } from "./evidenceInterventions20261102Ricany";

const fields = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("Říčany speeding-ticket payment salience RCT — verified 2026-11-02", () => {
  it("has all 34 schema fields and uses the established taxonomies", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_02_RICANY).toHaveLength(1);
    const item = EVIDENCE_INTERVENTIONS_2026_11_02_RICANY[0];
    expect(Object.keys(item).sort()).toEqual([...fields].sort());
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    expect(item.primaryArea).toBe("fiscalita_entrate_riscossione");
    for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
    for (const kind of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(kind);
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(item.evidenceStrength).toBe("forte");
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.implementability).toBe("medio_termine");
    expect(item.lastVerifiedAt).toBe("2026-11-02");
    expect(item.revisionHistory).toHaveLength(1);
  });

  it("is integrated only once and does not duplicate the scientific evaluation", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_11_02_RICANY[0];
    expect(EVIDENCE_INTERVENTIONS.filter((entry) => entry.id === item.id)).toHaveLength(1);
    const studyDoi = "10.1002/pam.22387";
    expect(item.evaluationStudies).toHaveLength(1);
    expect(item.evaluationStudies[0].doi).toBe(studyDoi);
    expect(EVIDENCE_INTERVENTIONS.filter((entry) =>
      entry.evaluationStudies.some((study) => study.doi === studyDoi)
    )).toHaveLength(1);
    expect(item.primarySource.url).toMatch(/^https:\/\//);
  });

  it("distinguishes randomised payment outcomes, modelling and null effects", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_11_02_RICANY[0];
    expect(item.evaluationMethod).toContain("78.882");
    expect(item.effectSize).toContain("77,9%");
    expect(item.effectSize).toContain("+2,0 punti");
    expect(item.effectSize).toContain("+1,6 punti");
    expect(item.effectSize).toContain("non significativo");
    expect(item.results).toContain("statisticamente significativo");
    expect(item.limitations.join(" ")).toContain("errore informatico");
    expect(item.outcomes.join(" ")).toContain("non valutate causalmente");
    expect(item.costsRequirements).toContain("12,62 CZK");
  });

  it("sets an Italian legally safe, measurable adaptation without changing sanctions", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_11_02_RICANY[0];
    expect(item.transferabilityItaly).toContain("art. 202");
    expect(item.transferabilityItaly).toContain("30%");
    expect(item.lameziaAdaptation).toContain("pagoPA");
    expect(item.lameziaAdaptation).toContain("diritti di ricorso");
    expect(item.lameziaAdaptation).toContain("solo il formato");
    expect(item.capacityDataNeeds.some((value) => value.includes("preregistrazione"))).toBe(true);
  });
});
