import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_07_NYC_HOMEBASE } from "./evidenceInterventions20261107NycHomebase";

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

describe("Municipal evidence 2026-11-07 — NYC Homebase prevention RCT", () => {
  const records = EVIDENCE_INTERVENTIONS_2026_11_07_NYC_HOMEBASE;
  const record = records[0];

  it("is a complete, taxonomy-valid, uniquely indexed record", () => {
    expect(records).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.id).toBe("new-york-city-homebase-homelessness-prevention-rct-2010");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach(area => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach(type => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory[0].date).toBe(record.lastVerifiedAt);
  });

  it("preserves experimental comparison and separates explorative estimates", () => {
    expect(record.evaluationMethod).toMatch(/Randomized controlled trial/);
    expect(record.evaluationMethod).toContain("intention-to-treat");
    expect(record.population).toContain("295 famiglie");
    expect(record.effectSize).toContain("−22,6");
    expect(record.effectSize).toContain("27 mesi");
    expect(record.effectSize).toContain("90%");
    expect(record.effectSize).toContain("unilaterale");
    expect(record.effectSize).toContain("−6,5");
    expect(record.limitations.join(" ")).toContain("esplorative");
  });

  it("retains primary-source provenance, financial uncertainty and Italian legal limitations", () => {
    expect(record.primarySource.url).toMatch(/^https:\/\//);
    expect(record.evaluationStudies[0].url).toContain("abtglobal.com");
    expect(record.evaluationStudies[1].doi).toBe("10.1016/j.jhe.2015.12.001");
    expect(record.costsRequirements).toContain("incerto");
    expect(record.lameziaAdaptation).toContain("Una Casa per Tutti");
    expect(record.lameziaAdaptation).toContain("Non alterare graduatorie");
    expect(record.implementability).toBe("medio_termine");
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.evaluationStudies.some(study => study.url === record.evaluationStudies[0].url))).toHaveLength(1);
  });
});
