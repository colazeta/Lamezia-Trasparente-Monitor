import { describe, expect, it } from "vitest";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_IMPLEMENTABILITY } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_19_NYC_SCHOOL_WATER } from "./evidenceInterventions20261119NycSchoolWater";

const FIELDS = ["authority","capacityDataNeeds","comparator","costsRequirements","country","effectSize","evaluationMethod","evaluationStudies","evidenceStrength","id","implementability","implementationYear","interventionStatus","interventionTypes","lameziaAdaptation","lastVerifiedAt","limitations","measure","mechanism","outcomes","population","primaryArea","primarySource","problem","results","revisionHistory","secondaryAreas","tags","territorialScale","territory","title","tools","transferabilityItaly","unintendedEffects"];

describe("NYC school water dispensers — 2026-11-19", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_19_NYC_SCHOOL_WATER[0];
  it("matches the canonical 34-field schema, taxonomies and deduplicated ID", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_19_NYC_SCHOOL_WATER).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual(FIELDS);
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
  });
  it("retains original municipal source and both peer-reviewed studies", () => {
    expect(record.primarySource.url).toContain("nyced.org");
    expect(record.evaluationStudies.map(s => s.doi)).toContain("10.1001/jamapediatrics.2015.3778");
    expect(record.evaluationStudies.map(s => s.doi)).toContain("10.2105/AJPH.2014.302221");
    expect(record.evaluationMethod).toContain("non RCT");
    expect(record.evidenceStrength).toBe("moderata");
  });
  it("qualifies heterogeneous BMI evidence, milk-purchase proxy and local safeguards", () => {
    expect(record.results).toContain("p=0,11");
    expect(record.effectSize).toContain("−0,025");
    expect(record.unintendedEffects).toContain("latte");
    expect(record.limitations.length).toBeGreaterThanOrEqual(5);
    expect(record.lameziaAdaptation).toContain("ASP");
    expect(record.lastVerifiedAt).toBe("2026-11-19");
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
  });
});
