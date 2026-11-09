import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_09_BALTIMORE_VISION } from "./evidenceInterventions20261109BaltimoreVision";

const REQUIRED_FIELDS = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea", "secondaryAreas",
  "interventionTypes", "tools", "territorialScale", "interventionStatus",
  "evaluationMethod", "comparator", "outcomes", "results", "effectSize",
  "evidenceStrength", "costsRequirements", "limitations", "unintendedEffects",
  "primarySource", "evaluationStudies", "lastVerifiedAt", "transferabilityItaly",
  "lameziaAdaptation", "implementability", "capacityDataNeeds", "tags",
  "revisionHistory",
] as const;

describe("Baltimore Vision for Baltimore cluster RCT — 2026-11-09", () => {
  const records = EVIDENCE_INTERVENTIONS_2026_11_09_BALTIMORE_VISION;
  const record = records[0];

  it("has one canonical 34-field record, valid taxonomies and no duplicate in archive", () => {
    expect(records).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.id).toBe("baltimore-vision-for-baltimore-school-eyeglasses-cluster-rct-2016");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.secondaryAreas).not.toContain(record.primaryArea);
    expect(record.revisionHistory.at(-1)?.date).toBe(record.lastVerifiedAt);
    expect(record.evidenceStrength).toBe("forte");
  });

  it("separates the significant one-year reading outcome from null longer-term and other tests", () => {
    expect(record.evaluationMethod).toContain("Cluster randomized controlled trial");
    expect(record.evaluationMethod).toContain("intention-to-treat");
    expect(record.population).toContain("2.304 alunni");
    expect(record.effectSize).toContain("+0,09 SD");
    expect(record.effectSize).toContain("0,02");
    expect(record.effectSize).toContain("due anni");
    expect(record.effectSize).toContain("0,23");
    expect(record.effectSize).toContain("non significativo");
    expect(record.results).toContain("nessun effetto generale robusto");
    expect(record.limitations.join(" ")).toContain("PARCC");
    expect(record.limitations.join(" ")).toContain("sottogruppi");
  });

  it("uses original sources and protects medical, school and cost claims", () => {
    expect(record.primarySource.url).toMatch(/^https:\/\//);
    expect(record.evaluationStudies[0].doi).toBe("10.1001/jamaophthalmol.2021.3544");
    expect(record.evaluationStudies[0].url).toContain("jamanetwork.com");
    expect(record.evaluationStudies.every(s => s.url.startsWith("https://"))).toBe(true);
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.evaluationStudies.some(study => study.doi === record.evaluationStudies[0].doi))).toHaveLength(1);
    expect(record.costsRequirements).toContain("non fornisce un costo pieno");
    expect(record.capacityDataNeeds.join(" ")).toContain("dati sanitari");
    expect(record.lameziaAdaptation).toContain("ASP Catanzaro");
    expect(record.implementability).toBe("medio_termine");
  });
});
