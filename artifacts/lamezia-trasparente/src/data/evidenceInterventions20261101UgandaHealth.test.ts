import { describe, it, expect } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_01_UGANDA_HEALTH } from "./evidenceInterventions20261101UgandaHealth";

const FIELDS = [
  "id",
  "title",
  "authority",
  "territory",
  "country",
  "implementationYear",
  "problem",
  "measure",
  "mechanism",
  "population",
  "primaryArea",
  "secondaryAreas",
  "interventionTypes",
  "tools",
  "territorialScale",
  "interventionStatus",
  "evaluationMethod",
  "comparator",
  "outcomes",
  "results",
  "effectSize",
  "evidenceStrength",
  "costsRequirements",
  "limitations",
  "unintendedEffects",
  "primarySource",
  "evaluationStudies",
  "lastVerifiedAt",
  "transferabilityItaly",
  "lameziaAdaptation",
  "implementability",
  "capacityDataNeeds",
  "tags",
  "revisionHistory"
] as const;

describe("Ugandan district clinic accountability RCT (2026-11-01)", () => {
  it("provides the exact 34-field schema and a unique archive record", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_01_UGANDA_HEALTH).toHaveLength(1);
    const entry = EVIDENCE_INTERVENTIONS_2026_11_01_UGANDA_HEALTH[0];
    expect(Object.keys(entry).sort()).toEqual([...FIELDS].sort());
    expect(EVIDENCE_THEMATIC_AREAS).toContain(entry.primaryArea);
    entry.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    entry.interventionTypes.forEach((kind) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(kind));
    expect(EVIDENCE_STRENGTHS).toContain(entry.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(entry.implementability);
    expect(EVIDENCE_INTERVENTIONS.filter((r) => r.id === entry.id)).toHaveLength(1);
    expect(entry.lastVerifiedAt).toBe("2026-11-01");
    expect(entry.primarySource.url).toMatch(/^https:\/\//);
    expect(entry.revisionHistory.length).toBeGreaterThan(0);
  });
  it("discloses mixed external evidence, non-replicated health outcomes and governance constraints", () => {
    const entry = EVIDENCE_INTERVENTIONS_2026_11_01_UGANDA_HEALTH[0];
    expect(entry.evidenceStrength).toBe("moderata");
    expect(entry.effectSize).toContain("−33%");
    expect(entry.effectSize).toContain("376 centri");
    expect(entry.results).toContain("2026");
    expect(entry.evaluationStudies.map((s) => s.doi)).toContain("10.1086/736577");
    expect(entry.limitations.join(" ")).toContain("controstante");
    expect(entry.authority).toContain("ONG");
    expect(entry.lameziaAdaptation).toContain("ASP Catanzaro");
  });
});
