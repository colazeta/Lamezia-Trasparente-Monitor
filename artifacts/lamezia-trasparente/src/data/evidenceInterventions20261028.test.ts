import { describe, expect, it } from "vitest";
import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_28 } from "./evidenceInterventions20261028";

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

describe("municipal evidence archive, 28 October 2026", () => {
  it("includes two new verified cases with all 34 schema fields and canonical taxonomies", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_28).toHaveLength(2);
    expect(new Set(EVIDENCE_INTERVENTIONS_2026_10_28.map((it) => it.id)).size).toBe(2);
    for (const item of EVIDENCE_INTERVENTIONS_2026_10_28) {
      expect(Object.keys(item).sort()).toEqual([...fields].sort());
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      item.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
      item.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url).toMatch(/^https:\/\//);
      expect(item.evaluationStudies.length).toBeGreaterThanOrEqual(2);
      item.evaluationStudies.forEach((study) => expect(study.url).toMatch(/^https:\/\//));
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.revisionHistory).toHaveLength(1);
      expect(item.lastVerifiedAt).toBe("2026-10-28");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("separates corruption findings from criminal convictions and null outcomes", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_28[0];
    expect(item.id).toBe("brazil-cgu-municipal-procurement-audit-risk-rct");
    expect(item.primaryArea).toBe("trasparenza_integrita_anticorruzione");
    expect(item.evaluationStudies.some((study) => study.doi === "10.1016/j.jdeveco.2018.03.008")).toBe(true);
    expect(item.effectSize).toContain("−15,4 pp");
    expect(item.effectSize).toContain("−11,8 pp");
    expect(item.results).toContain("Nessun miglioramento");
    expect(item.limitations.join(" ")).toContain("mismanagement");
  });

  it("keeps Bogotá cohort-specific long-term effects and null graduation caveat", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_28[1];
    expect(item.id).toBe("bogota-school-attendance-cct-savings-timing-rct");
    expect(item.primaryArea).toBe("istruzione_giovani");
    expect(item.evaluationStudies.some((study) => study.doi === "10.1257/app.3.2.167")).toBe(true);
    expect(item.evaluationStudies.some((study) => study.doi === "10.1257/app.20170008")).toBe(true);
    expect(item.effectSize).toContain("+3,9 pp");
    expect(item.effectSize).toContain("non è statisticamente significativo");
    expect(item.results).toContain("NON trova aumenti robusti");
  });
});
