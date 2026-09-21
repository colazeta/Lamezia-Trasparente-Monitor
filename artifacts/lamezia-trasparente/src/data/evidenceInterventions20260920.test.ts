import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_20 } from "./evidenceInterventions20260920";

describe("evidence interventions 2026-09-20", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_20).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_20) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.evaluationStudies.every((study) => study.url.startsWith("https://"))).toBe(true);
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-09-20");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps Halifax causal estimates separate from descriptive municipal tonnage", () => {
    const halifax = EVIDENCE_INTERVENTIONS_2026_09_20.find(
      (item) => item.id === "halifax-clear-bag-waste-policy",
    );
    expect(halifax?.evidenceStrength).toBe("forte");
    expect(halifax?.evaluationMethod.toLowerCase()).toContain("regression discontinuity");
    expect(halifax?.effectSize).toContain("+15%");
    expect(halifax?.effectSize).toContain("−27%");
    expect(halifax?.effectSize).toContain("−31,4%");
    expect(halifax?.limitations.join(" ").toLowerCase()).toContain("altre modifiche");
    expect(
      halifax?.evaluationStudies.some((study) => study.doi === "10.1016/j.jeem.2020.102404"),
    ).toBe(true);
  });

  it("does not present Denver STAR as a randomized evaluation or universal public-safety response", () => {
    const star = EVIDENCE_INTERVENTIONS_2026_09_20.find(
      (item) => item.id === "denver-star-alternative-crisis-response",
    );
    expect(star?.evidenceStrength).toBe("moderata");
    expect(star?.evaluationMethod.toLowerCase()).toContain("propensity score matching");
    expect(star?.evaluationMethod.toLowerCase()).toContain("non è una randomizzazione");
    expect(star?.effectSize).toContain("50%");
    expect(star?.effectSize).toContain("42%");
    expect(star?.effectSize).toContain("18%");
    expect(star?.effectSize).toContain("15%");
    expect(star?.results.toLowerCase()).toContain("booking");
    expect(star?.limitations.join(" ").toLowerCase()).toContain("basso rischio");
  });

  it("preserves multiple-testing and sensitivity caveats for Philadelphia abandoned housing", () => {
    const philly = EVIDENCE_INTERVENTIONS_2026_09_20.find(
      (item) => item.id === "philadelphia-abandoned-housing-remediation-rct",
    );
    expect(philly?.evidenceStrength).toBe("forte");
    expect(philly?.evaluationMethod.toLowerCase()).toContain("cluster randomized controlled trial");
    expect(philly?.effectSize).toContain("−8,43%");
    expect(philly?.effectSize).toContain("−13,12%");
    expect(philly?.effectSize).toContain("−6,96%");
    expect(philly?.effectSize).toContain("q-value");
    expect(philly?.effectSize).toContain("0,35");
    expect(philly?.limitations.join(" ").toLowerCase()).toContain("test multipli");
    expect(philly?.limitations.join(" ").toLowerCase()).toContain("trend-adjusted");
    expect(
      philly?.evaluationStudies.some((study) => study.doi === "10.1001/jamainternmed.2022.5460"),
    ).toBe(true);
  });
});
