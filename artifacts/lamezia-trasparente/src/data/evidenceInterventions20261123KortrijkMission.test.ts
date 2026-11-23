import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_23_KORTRIJK_MISSION } from "./evidenceInterventions20261123KortrijkMission";

const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("2026-11-23 Kortrijk MISSION family outreach RCT", () => {
  const cases = EVIDENCE_INTERVENTIONS_2026_11_23_KORTRIJK_MISSION;
  const item = cases[0];

  it("contains one unique complete record with canonical taxonomies", () => {
    expect(cases).toHaveLength(1);
    expect(Object.keys(item).sort()).toEqual(FIELDS);
    expect(EVIDENCE_INTERVENTIONS.filter(record => record.id === item.id)).toHaveLength(1);
    expect(item.id).toBe("kortrijk-mission-outreach-case-management-families-rct-2017");
    expect(item.primaryArea).toBe("welfare_inclusione_servizi_sociali");
    expect(item.evidenceStrength).toBe("moderata");
    expect(item.implementability).toBe("medio_termine");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.lastVerifiedAt).toBe("2026-11-23");
    expect(item.revisionHistory.at(-1)?.date).toBe(item.lastVerifiedAt);
  });

  it("distinguishes the 112-family trial, positive main outcome and nonsignificant outcomes", () => {
    expect(item.population).toContain("112");
    expect(item.evaluationMethod).toContain("56/56");
    expect(item.results).toContain("+19,6 punti percentuali");
    expect(item.results).toContain("p=0,020");
    expect(item.results).toContain("p=0,166");
    expect(item.results).toContain("non significativa");
    expect(item.effectSize).toContain("0,375");
    expect(item.effectSize).toContain("0,179");
    expect(item.evaluationStudies[0].url).toContain("MISSION_FINAL%20REPORT.pdf");
  });

  it("avoids promoting one-year exploratory findings or 2023 city reorganisation as RCT impacts", () => {
    expect(item.limitations.some(text => text.includes("235"))).toBe(true);
    expect(item.limitations.some(text => text.includes("non dimostrano occupazione"))).toBe(true);
    expect(item.limitations.some(text => text.includes("2023"))).toBe(true);
    expect(item.costsRequirements).toContain("NON è il costo marginale");
    expect(item.lameziaAdaptation).toContain("già");
    expect(item.primarySource.url).toBe("https://www.kortrijk.be/mission");
    expect(item.capacityDataNeeds.length).toBeGreaterThanOrEqual(6);
  });
});
