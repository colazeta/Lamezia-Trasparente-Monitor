import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_03 } from "./evidenceInterventions20261103";

const fields = ["id","title","authority","territory","country","implementationYear","problem","measure","mechanism","population","primaryArea","secondaryAreas","interventionTypes","tools","territorialScale","interventionStatus","evaluationMethod","comparator","outcomes","results","effectSize","evidenceStrength","costsRequirements","limitations","unintendedEffects","primarySource","evaluationStudies","lastVerifiedAt","transferabilityItaly","lameziaAdaptation","implementability","capacityDataNeeds","tags","revisionHistory"] as const;

describe("Evidence intake 2026-11-03 — Surrey food waste / São Paulo municipal IPTU", () => {
  it("includes exactly two unique, fully structured cases in the archive", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_03).toHaveLength(2);
    for (const record of EVIDENCE_INTERVENTIONS_2026_11_03) {
      expect(Object.keys(record).sort()).toEqual([...fields].sort());
      expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
      expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
      for (const area of record.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of record.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
      expect(record.lastVerifiedAt).toBe("2026-11-03");
      expect(record.revisionHistory).toHaveLength(1);
      expect(record.primarySource.url).toMatch(/^https:\/\//);
      expect(record.evaluationStudies.length).toBeGreaterThanOrEqual(1);
    }
  });
  it("preserves the measured weight outcome and prevents conflating experiment with subsequent Surrey campaign", () => {
    const c = EVIDENCE_INTERVENTIONS_2026_11_03.find(x => x.country === "Regno Unito")!;
    expect(c.primaryArea).toBe("rifiuti_pulizia_urbana");
    expect(c.effectSize).toContain("20,74%");
    expect(c.outcomes.join(" ")).toContain("peso");
    expect(c.limitations.join(" ")).toContain("campagna");
    expect(c.evaluationStudies[0].doi).toBe("10.1016/j.wasman.2016.09.036");
  });
  it("discloses São Paulo balance concern, one-sided multiple testing and projections", () => {
    const c = EVIDENCE_INTERVENTIONS_2026_11_03.find(x => x.country === "Brasile")!;
    expect(c.primaryArea).toBe("fiscalita_entrate_riscossione");
    expect(c.evidenceStrength).toBe("moderata");
    expect(c.effectSize).toContain("4,07 punti percentuali");
    expect(c.results).toContain("0,011");
    expect(c.limitations.join(" ")).toContain("squilibrio");
    expect(c.limitations.join(" ")).toContain("proiezione");
    expect(c.lameziaAdaptation).toContain("TARI");
  });
});
