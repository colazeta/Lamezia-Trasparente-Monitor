import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_03_PATNA } from "./evidenceInterventions20261103Patna";

const requiredFields = [
  "id", "title", "authority", "territory", "country", "implementationYear",
  "problem", "measure", "mechanism", "population", "primaryArea",
  "secondaryAreas", "interventionTypes", "tools", "territorialScale",
  "interventionStatus", "evaluationMethod", "comparator", "outcomes",
  "results", "effectSize", "evidenceStrength", "costsRequirements",
  "limitations", "unintendedEffects", "primarySource", "evaluationStudies",
  "lastVerifiedAt", "transferabilityItaly", "lameziaAdaptation",
  "implementability", "capacityDataNeeds", "tags", "revisionHistory",
] as const;

describe("evidence archive — 3 November 2026 Patna training", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_03_PATNA[0];

  it("has the stable 34-field schema, canonical classifications and unique archive entry", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_03_PATNA).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...requiredFields].sort());
    expect(record.id).toBe("patna-india-municipal-waste-source-segregation-citizen-training-rct-2021");
    expect(record.primaryArea).toBe("rifiuti_pulizia_urbana");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach((kind) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(kind));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(record.evidenceStrength).not.toBe("da_verificare");
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(EVIDENCE_INTERVENTIONS.filter((x) => x.id === record.id)).toHaveLength(1);
    expect(record.lastVerifiedAt).toBe("2026-11-03");
    expect(record.revisionHistory).toHaveLength(1);
  });

  it("documents the directly randomised effect separately from descriptive trends and spatial models", () => {
    expect(record.effectSize).toContain("+4,5–6,1 punti percentuali");
    expect(record.effectSize).toContain("descrittivo");
    expect(record.effectSize).toContain("13,57");
    expect(record.evaluationMethod).toContain("staggered");
    expect(record.comparator).toContain("non ancora formati");
    expect(record.limitations.join(" ")).toContain("non un effetto netto");
  });

  it("keeps original verifiable sources, actual operational costs and modelling caveats", () => {
    expect(record.primarySource.url).toBe("https://cep.lse.ac.uk/pubs/download/dp2124.pdf");
    expect(record.evaluationStudies.some((s) => s.url.includes("/dp/18124/"))).toBe(true);
    expect(record.costsRequirements).toContain("₹2.581.000");
    expect(record.costsRequirements).toContain("simulazione");
    expect(record.limitations.join(" ")).toContain("non una versione peer-reviewed");
    expect(record.lameziaAdaptation).toContain("Lamezia Multiservizi");
  });
});
