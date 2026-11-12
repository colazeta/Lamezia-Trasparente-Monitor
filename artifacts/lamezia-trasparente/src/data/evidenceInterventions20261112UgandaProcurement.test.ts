import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_12_UGANDA_PROCUREMENT } from "./evidenceInterventions20261112UgandaProcurement";

const KEYS = ["id","title","authority","territory","country","implementationYear","problem","measure","mechanism","population","primaryArea","secondaryAreas","interventionTypes","tools","territorialScale","interventionStatus","evaluationMethod","comparator","outcomes","results","effectSize","evidenceStrength","costsRequirements","limitations","unintendedEffects","primarySource","evaluationStudies","lastVerifiedAt","transferabilityItaly","lameziaAdaptation","implementability","capacityDataNeeds","tags","revisionHistory"];

describe("Uganda procurement transparency support: 2026-11-12", () => {
  const row = EVIDENCE_INTERVENTIONS_2026_11_12_UGANDA_PROCUREMENT[0];
  it("has all 34 canonical fields, enumerated taxonomies and unique ID", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_12_UGANDA_PROCUREMENT).toHaveLength(1);
    expect(Object.keys(row).sort()).toEqual([...KEYS].sort());
    expect(EVIDENCE_INTERVENTIONS.filter(x => x.id === row.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(row.primaryArea);
    row.secondaryAreas.forEach(x => expect(EVIDENCE_THEMATIC_AREAS).toContain(x));
    row.interventionTypes.forEach(x => expect(EVIDENCE_INTERVENTION_TYPES).toContain(x));
    expect(EVIDENCE_STRENGTHS).toContain(row.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(row.implementability);
    expect(row.lastVerifiedAt).toBe(row.revisionHistory.at(-1)?.date);
  });
  it("distinguishes observational training from randomized award and no proven anticorruption effect", () => {
    expect(row.evidenceStrength).toBe("moderata");
    expect(row.evaluationMethod).toContain("NON RANDOMIZZATO");
    expect(row.evaluationMethod).toContain("randomizzato");
    expect(row.comparator).toContain("84 distretti");
    expect(row.comparator).toContain("25 distretti");
    expect(row.effectSize).toContain("+86,66 atti");
    expect(row.effectSize).toContain("+5.193,7 milioni UGX");
    expect(row.results).toContain("NON");
    expect(row.limitations.join(" ")).toContain("NON è randomizzato");
    expect(row.results).toContain("Nessuna riduzione di corruzione");
  });
  it("keeps source traceability, Italian application constraints and revision provenance", () => {
    expect(row.primarySource.url).toBe("https://gpp.ppda.go.ug/");
    expect(row.evaluationStudies[0].doi).toBe("10.1111/puar.70205");
    expect(row.evaluationStudies.some(s => s.url.includes("OSF.IO"))).toBe(true);
    expect(row.lameziaAdaptation).toContain("BDNCP");
    expect(row.lameziaAdaptation).toContain("senza rinviare obblighi legali");
    expect(row.revisionHistory).toHaveLength(1);
  });
});
