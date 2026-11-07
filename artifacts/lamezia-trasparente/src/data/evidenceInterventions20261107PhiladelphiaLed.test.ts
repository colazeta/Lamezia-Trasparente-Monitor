import { describe, expect, it } from "vitest";
import {
  EVIDENCE_THEMATIC_AREAS,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_IMPLEMENTABILITY,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_11_07_PHILADELPHIA_LED } from "./evidenceInterventions20261107PhiladelphiaLed";

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

describe("municipal evidence 2026-11-07 — Philadelphia LED streetlights", () => {
  const record = EVIDENCE_INTERVENTIONS_2026_11_07_PHILADELPHIA_LED[0];
  const doi = "10.1111/1745-9133.70006";

  it("has the 34 canonical fields and unchanged taxonomies", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_11_07_PHILADELPHIA_LED).toHaveLength(1);
    expect(Object.keys(record).sort()).toEqual([...REQUIRED_FIELDS].sort());
    expect(record.id).toBe("philadelphia-citywide-led-streetlight-upgrades-crime-did-2023");
    expect(record.primaryArea).toBe("sicurezza_urbana_prevenzione");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.revisionHistory[0].date).toBe(record.lastVerifiedAt);
  });

  it("is indexed once under one stable ID and one original evaluation DOI", () => {
    expect(EVIDENCE_INTERVENTIONS.filter((x) => x.id === record.id)).toHaveLength(1);
    expect(EVIDENCE_INTERVENTIONS.filter((x) => x.evaluationStudies.some((e) => e.doi === doi))).toHaveLength(1);
    expect(record.primarySource.url).toMatch(/^https:\/\//);
  });

  it("preserves distinctions between observational DiD, outcome and projected financing", () => {
    expect(record.evidenceStrength).toBe("moderata");
    expect(record.evaluationMethod).toContain("differenze-nelle-differenze");
    expect(record.evaluationMethod).toContain("Nessuna allocazione randomizzata");
    expect(record.effectSize).toContain("−15,21%");
    expect(record.effectSize).toContain("−20,98%");
    expect(record.costsRequirements).toContain("previsioni ex ante");
    expect(record.results).toContain("Nessun miglioramento statisticamente robusto");
    expect(record.limitations.join(" ")).toContain("non randomizzato");
    expect(record.measure).toContain("NYCHA");
    expect(record.lameziaAdaptation).toContain("City Green Light");
    expect(record.capacityDataNeeds.length).toBeGreaterThanOrEqual(5);
  });
});
