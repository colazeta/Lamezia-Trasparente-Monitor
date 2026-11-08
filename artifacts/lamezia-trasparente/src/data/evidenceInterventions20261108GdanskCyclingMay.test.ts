import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_08_GDANSK_CYCLING_MAY } from "./evidenceInterventions20261108GdanskCyclingMay";

const REQUIRED_FIELDS = ["id","title","authority","territory","country","implementationYear","problem","measure","mechanism","population","primaryArea","secondaryAreas","interventionTypes","tools","territorialScale","interventionStatus","evaluationMethod","comparator","outcomes","results","effectSize","evidenceStrength","costsRequirements","limitations","unintendedEffects","primarySource","evaluationStudies","lastVerifiedAt","transferabilityItaly","lameziaAdaptation","implementability","capacityDataNeeds","tags","revisionHistory"] as const;

describe("2026-11-08 Gdańsk Rowerowy Maj quasi-experimental evidence", () => {
  const [record] = EVIDENCE_INTERVENTIONS_2026_11_08_GDANSK_CYCLING_MAY;
  const doi = "10.1016/j.tra.2022.08.017";

  it("has 34 fields, valid taxonomies and documented provenance", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_08_GDANSK_CYCLING_MAY).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.primaryArea).toBe("mobilita_spazio_pubblico");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(a => expect(EVIDENCE_THEMATIC_AREAS).toContain(a));
    record.interventionTypes.forEach(t => expect(EVIDENCE_INTERVENTION_TYPES).toContain(t));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.lastVerifiedAt).toBe("2026-11-08");
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
    expect(record.primarySource.url).toMatch(/^https:\/\//);
    expect(record.evaluationStudies[0].doi).toBe(doi);
  });

  it("indexes once by stable ID and DOI", () => {
    expect(EVIDENCE_INTERVENTIONS.filter(x => x.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_INTERVENTIONS.filter(x => x.evaluationStudies.some(s => s.doi === doi))).toHaveLength(1);
  });

  it("does not overclaim persistence, individual outcomes or RCT strength", () => {
    expect(record.evaluationMethod).toContain("difference-in-differences");
    expect(record.evaluationMethod).toContain("Nessuna randomizzazione");
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.effectSize).toContain("+18%");
    expect(record.effectSize).toContain("+14%");
    expect(record.results).toContain("NON");
    expect(record.results).toContain("giugno");
    expect(record.limitations.join(" ")).toContain("Una sola città di controllo");
    expect(record.lameziaAdaptation).toContain("Nicastro");
    expect(record.lameziaAdaptation).toContain("Sambiase");
    expect(record.lameziaAdaptation).toContain("Sant'Eufemia");
  });
});
