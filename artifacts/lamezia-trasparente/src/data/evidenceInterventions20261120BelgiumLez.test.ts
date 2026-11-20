import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_20_BELGIUM_LEZ } from "./evidenceInterventions20261120BelgiumLez";

const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("2026-11-20 Belgium LEZ interventions, independent authority and common evaluation", () => {
  const cases = EVIDENCE_INTERVENTIONS_2026_11_20_BELGIUM_LEZ;
  it("has two authority-specific, complete, valid records with one ID each in the global archive", () => {
    expect(cases).toHaveLength(2);
    expect(new Set(cases.map(x => x.id)).size).toBe(2);
    for (const record of cases) {
      expect(Object.keys(record).sort()).toEqual(FIELDS);
      expect(EVIDENCE_INTERVENTIONS.filter(x => x.id === record.id)).toHaveLength(1);
      expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
      record.secondaryAreas.forEach(a => expect(EVIDENCE_THEMATIC_AREAS).toContain(a));
      record.interventionTypes.forEach(t => expect(EVIDENCE_INTERVENTION_TYPES).toContain(t));
      expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
      expect(record.primaryArea).toBe("ambiente_clima_energia");
      expect(record.evidenceStrength).toBe("moderata");
      expect(record.evaluationStudies.some(s => s.doi === "10.1016/j.envint.2025.109515")).toBe(true);
      expect(record.evaluationMethod).toContain("Non");
      expect(record.lastVerifiedAt).toBe("2026-11-20");
      expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
      expect(record.implementationYear).toMatch(/2017|2018/);
      expect(record.capacityDataNeeds.length).toBeGreaterThanOrEqual(5);
    }
  });
  it("separates the actual implementing authorities and distinguishes the two NO2 estimates", () => {
    expect(cases[0].authority).toContain("Antwerpen");
    expect(cases[1].authority).toContain("Brussels-Capital Region");
    expect(cases[0].effectSize).toContain("0,712");
    expect(cases[1].effectSize).toContain("0,799");
    expect(cases[0].effectSize).toContain("0,066");
    expect(cases[1].effectSize).toContain("0,0283");
    expect(cases[0].limitations.some(x => x.includes("pre-intervento"))).toBe(true);
    expect(cases[1].limitations.some(x => x.includes("diagnosi"))).toBe(true);
  });
  it("does not present before-after exposure changes or prescription proxies as verified net causal or clinical effects", () => {
    for (const record of cases) {
      expect(record.effectSize).toMatch(/osservat/);
      expect(record.results).toMatch(/non|Non/);
      expect(record.costsRequirements).toMatch(/Nessun|non/);
      expect(record.transferabilityItaly).toContain("non");
    }
  });
});
