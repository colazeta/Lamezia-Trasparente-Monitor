import { describe, expect, it } from "vitest";
import {
  EVIDENCE_THEMATIC_AREAS,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_IMPLEMENTABILITY,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_06_BARCELONA_GREEN_CORRIDORS } from "./evidenceInterventions20261106BarcelonaGreenCorridors";

const REQUIRED_FIELDS = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea",
  "secondaryAreas", "interventionTypes", "tools", "territorialScale",
  "interventionStatus", "evaluationMethod", "comparator", "outcomes", "results",
  "effectSize", "evidenceStrength", "costsRequirements", "limitations",
  "unintendedEffects", "primarySource", "evaluationStudies", "lastVerifiedAt",
  "transferabilityItaly", "lameziaAdaptation", "implementability",
  "capacityDataNeeds", "tags", "revisionHistory",
] as const;

describe("Municipal evidence 2026-11-06 — Barcelona Eixos Verds quasi-experiment", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_06_BARCELONA_GREEN_CORRIDORS[0];

  it("conforms to the existing 34-field schema and stable taxonomies", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_06_BARCELONA_GREEN_CORRIDORS).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.id).toBe("barcelona-eixample-green-corridors-public-space-quality-did-2022");
    expect(record.primaryArea).toBe("urbanistica_rigenerazione");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory[0].date).toBe(record.lastVerifiedAt);
  });

  it("has no duplicate stable ID or evaluation DOI in the site archive", () => {
    expect(EVIDENCE_INTERVENTIONS.filter((item) => item.id === record.id)).toHaveLength(1);
    expect(
      EVIDENCE_INTERVENTIONS.filter((item) =>
        item.evaluationStudies.some((study) => study.doi === "10.1093/eurpub/ckag126"),
      ),
    ).toHaveLength(1);
  });

  it("qualifies observational quality improvements and nonsignificant outcomes", () => {
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.evaluationMethod).toContain("difference-in-differences");
    expect(record.comparator).toContain("València");
    expect(record.effectSize).toContain("+4,94");
    expect(record.effectSize).toContain("−0,36");
    expect(record.results).toContain("non identifica miglioramenti significativi");
    expect(record.limitations.join(" ")).toContain("ad hoc");
    expect(record.effectSize).toContain("scala osservazionale");
    expect(record.unintendedEffects).toContain("gentrificazione");
  });

  it("uses primary municipal documentation and identifies Lamezia adaptation", () => {
    expect(record.primarySource.url).toMatch(/^https:\/\//);
    expect(record.evaluationStudies[0].doi).toBe("10.1093/eurpub/ckag126");
    expect(record.lameziaAdaptation).toContain("Piano Generale del Traffico Urbano");
    expect(record.lameziaAdaptation).toContain("comparabili");
    expect(record.implementability).toBe("medio_termine");
  });
});
