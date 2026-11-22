import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_22_MONTEVIDEO_BINS } from "./evidenceInterventions20261122MontevideoBins";

const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("2026-11-22 Montevideo matched-pair public-square bin removal RCT", () => {
  const cases = EVIDENCE_INTERVENTIONS_2026_11_22_MONTEVIDEO_BINS;
  const item = cases[0];

  it("contains one unique 34-field record following stable taxonomies", () => {
    expect(cases).toHaveLength(1);
    expect(Object.keys(item).sort()).toEqual(FIELDS);
    expect(EVIDENCE_INTERVENTIONS.filter(x => x.id === item.id)).toHaveLength(1);
    expect(item.id).toBe("montevideo-plazas-bin-removal-matched-rct-2022");
    expect(item.primaryArea).toBe("rifiuti_pulizia_urbana");
    expect(item.evidenceStrength).toBe("forte");
    expect(item.implementability).toBe("medio_termine");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach(a => expect(EVIDENCE_THEMATIC_AREAS).toContain(a));
    item.interventionTypes.forEach(t => expect(EVIDENCE_INTERVENTION_TYPES).toContain(t));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.lastVerifiedAt).toBe("2026-11-22");
    expect(item.revisionHistory.at(-1)?.date).toBe(item.lastVerifiedAt);
  });

  it("distinguishes 36 randomized squares, 218 recorded inspections, and evidence strength by outcome", () => {
    expect(item.population).toContain("36");
    expect(item.evaluationMethod).toContain("18 coppie");
    expect(item.evaluationMethod).toContain("218");
    expect(item.results).toContain("−43,5%");
    expect(item.results).toContain("p=0,098");
    expect(item.results).toContain("p=0,951");
    expect(item.effectSize).toContain("−0,021");
    expect(item.evaluationStudies.some(s => s.doi === "10.1016/j.cities.2025.105913")).toBe(true);
  });

  it("guards against invented cost savings, citywide bin removal and overclaimed perceptions", () => {
    expect(item.costsRequirements).toContain("non forniscono");
    expect(item.limitations.some(x => x.includes("Tabella 4"))).toBe(true);
    expect(item.lameziaAdaptation).toContain("Solo se");
    expect(item.unintendedEffects).toContain("−0,307");
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.capacityDataNeeds.length).toBeGreaterThanOrEqual(6);
  });
});
