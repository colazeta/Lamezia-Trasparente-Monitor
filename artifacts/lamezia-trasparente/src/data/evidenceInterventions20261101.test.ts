import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_01 } from "./evidenceInterventions20261101";

const schemaFields = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea",
  "secondaryAreas", "interventionTypes", "tools", "territorialScale",
  "interventionStatus", "evaluationMethod", "comparator", "outcomes",
  "results", "effectSize", "evidenceStrength", "costsRequirements",
  "limitations", "unintendedEffects", "primarySource", "evaluationStudies",
  "lastVerifiedAt", "transferabilityItaly", "lameziaAdaptation",
  "implementability", "capacityDataNeeds", "tags", "revisionHistory",
] as const;

describe("evidence archive intake: Birmingham CAZ (2026-11-01)", () => {
  const item = EVIDENCE_INTERVENTIONS_2026_11_01[0];

  it("keeps precisely the 34 established fields, stable identifier, and one integrated record", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_01).toHaveLength(1);
    expect(Object.keys(item).sort()).toEqual([...schemaFields].sort());
    expect(item.id).toBe("birmingham-clean-air-zone-2021-no2-nox-synthetic-control");
    expect(EVIDENCE_INTERVENTIONS.filter((row) => row.id === item.id)).toHaveLength(1);
    expect(item.lastVerifiedAt).toBe("2026-11-01");
    expect(item.revisionHistory).toHaveLength(1);
  });

  it("uses fixed taxonomies and cites original municipal and scientific sources", () => {
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    item.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.primaryArea).toBe("ambiente_clima_energia");
    expect(item.evidenceStrength).toBe("moderata");
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.evaluationStudies.some((s) => s.doi === "10.1007/s10640-023-00794-2")).toBe(true);
    expect(item.evaluationStudies.every((s) => s.url.startsWith("https://"))).toBe(true);
  });

  it("prevents misrepresenting selective air-quality results as citywide or clinical benefits", () => {
    expect(item.effectSize).toContain("−3,4%");
    expect(item.effectSize).toContain("−6,6%");
    expect(item.effectSize).toContain("−11,9%");
    expect(item.effectSize).toContain("PM₂,₅");
    expect(item.effectSize).toContain("NON");
    expect(item.results).toContain("prime sette mesi");
    expect(item.limitations.join(" ")).toContain("non randomizzato");
    expect(item.limitations.join(" ")).toContain("pandemiche");
    expect(item.unintendedEffects).toContain("distributivo");
  });

  it("requires Italian legal/equity feasibility and refuses automatic replication", () => {
    expect(item.transferabilityItaly).toContain("art. 7");
    expect(item.transferabilityItaly).toContain("non è replicabile automaticamente");
    expect(item.lameziaAdaptation).toContain("ARPACAL");
    expect(item.implementability).toBe("strutturale");
    expect(item.costsRequirements).toContain("non il costo");
  });
});
