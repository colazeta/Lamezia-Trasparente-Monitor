import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_01_PALMA } from "./evidenceInterventions20261101Palma";

const fields = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea",
  "secondaryAreas", "interventionTypes", "tools", "territorialScale",
  "interventionStatus", "evaluationMethod", "comparator", "outcomes",
  "results", "effectSize", "evidenceStrength", "costsRequirements",
  "limitations", "unintendedEffects", "primarySource", "evaluationStudies",
  "lastVerifiedAt", "transferabilityItaly", "lameziaAdaptation",
  "implementability", "capacityDataNeeds", "tags", "revisionHistory",
] as const;

describe("municipal evidence archive: Palma EMAYA biowaste pledge 2019", () => {
  const item = EVIDENCE_INTERVENTIONS_2026_11_01_PALMA[0];

  it("contains exactly the 34 established fields and is integrated without duplicate ids", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_01_PALMA).toHaveLength(1);
    expect(Object.keys(item).sort()).toEqual([...fields].sort());
    expect(item.id).toBe("palma-emaya-biowaste-pledge-2019-quasi-random-longitudinal");
    expect(EVIDENCE_INTERVENTIONS.filter((row) => row.id === item.id)).toHaveLength(1);
    expect(item.revisionHistory).toHaveLength(1);
    expect(item.lastVerifiedAt).toBe("2026-11-01");
  });

  it("uses canonical taxonomies and cites scientific and municipal primary sources", () => {
    expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
    item.secondaryAreas.forEach((a) => expect(EVIDENCE_THEMATIC_AREAS).toContain(a));
    item.interventionTypes.forEach((t) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(t));
    expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
    expect(item.primaryArea).toBe("rifiuti_pulizia_urbana");
    expect(item.evidenceStrength).toBe("forte");
    expect(item.implementability).toBe("medio_termine");
    expect(item.primarySource.url).toMatch(/^https:\/\//);
    expect(item.evaluationStudies.some((s) => s.doi === "10.1073/pnas.2414578122")).toBe(true);
    expect(item.evaluationStudies.some((s) => s.url.includes("socialscienceregistry.org"))).toBe(true);
  });

  it("preserves quasi-random allocation and qualified four-year participation estimates", () => {
    expect(item.evaluationMethod).toContain("quasi-randomizzata");
    expect(item.evaluationMethod).toContain("NON RCT");
    expect(item.population).toContain("1.519");
    expect(item.population).toContain("709");
    expect(item.population).toContain("810");
    expect(item.effectSize).toContain("4,55");
    expect(item.effectSize).toContain("5,10");
    expect(item.effectSize).toContain("3,11");
    expect(item.effectSize).toContain("4,49");
    expect(item.effectSize).toContain("210");
    expect(item.effectSize).toContain("non");
    expect(item.outcomes.join(" ")).toContain("NON misurati");
    expect(item.limitations.join(" ")).toContain("80,88%");
  });

  it("guards against unsupported kg/cost claims and privacy-unsafe replication", () => {
    expect(item.results).toContain("non sui kg");
    expect(item.unintendedEffects).toContain("privacy");
    expect(item.transferabilityItaly).toContain("GDPR");
    expect(item.lameziaAdaptation).toContain("Lamezia Multiservizi");
    expect(item.lameziaAdaptation).toContain("senza alcuna sanzione");
    expect(item.costsRequirements).toContain("non sono gratuiti");
  });
});
