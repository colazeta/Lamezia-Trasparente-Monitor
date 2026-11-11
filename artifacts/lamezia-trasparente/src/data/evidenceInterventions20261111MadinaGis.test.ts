import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_11_MADINA_GIS } from "./evidenceInterventions20261111MadinaGis";

const KEYS = ["id","title","authority","territory","country","implementationYear","problem","measure","mechanism","population","primaryArea","secondaryAreas","interventionTypes","tools","territorialScale","interventionStatus","evaluationMethod","comparator","outcomes","results","effectSize","evidenceStrength","costsRequirements","limitations","unintendedEffects","primarySource","evaluationStudies","lastVerifiedAt","transferabilityItaly","lameziaAdaptation","implementability","capacityDataNeeds","tags","revisionHistory"];

describe("Madina GIS tax collection RCT — 2026-11-11", () => {
  const row = EVIDENCE_INTERVENTIONS_2026_11_11_MADINA_GIS[0];
  it("contains the canonical 34 fields, taxonomies and unique stable ID", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_11_MADINA_GIS).toHaveLength(1);
    expect(Object.keys(row).sort()).toEqual([...KEYS].sort());
    expect(EVIDENCE_INTERVENTIONS.filter(x => x.id === row.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(row.primaryArea);
    row.secondaryAreas.forEach(x => expect(EVIDENCE_THEMATIC_AREAS).toContain(x));
    row.interventionTypes.forEach(x => expect(EVIDENCE_INTERVENTION_TYPES).toContain(x));
    expect(EVIDENCE_STRENGTHS).toContain(row.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(row.implementability);
    expect(row.lastVerifiedAt).toBe(row.revisionHistory.at(-1)?.date);
  });
  it("preserves adverse bribery signals, the indirect-question caveat and design limits", () => {
    expect(row.evidenceStrength).toBe("forte");
    expect(row.evaluationMethod).toContain("Randomized");
    expect(row.comparator).toContain("28 operatori");
    expect(row.effectSize).toContain("+27%");
    expect(row.effectSize).toContain("+103%");
    expect(row.effectSize).toContain("+11,6 punti percentuali");
    expect(row.unintendedEffects).toContain("11,6 punti percentuali");
    expect(row.limitations.join(" ")).toContain("non costituiscono prova");
    expect(row.limitations.join(" ")).toContain("non risulta una pubblicazione peer-reviewed");
  });
  it("references the original research and local policy safeguards", () => {
    expect(row.primarySource.url).toBe("https://www.nber.org/papers/w29923");
    expect(row.evaluationStudies[0].doi).toBe("10.3386/w29923");
    expect(row.evaluationStudies[1].url).toContain("povertyactionlab.org");
    expect(row.lameziaAdaptation).toContain("PagoPA");
    expect(row.lameziaAdaptation).toContain("senza riscossione in contanti");
    expect(row.revisionHistory).toHaveLength(1);
  });
});
