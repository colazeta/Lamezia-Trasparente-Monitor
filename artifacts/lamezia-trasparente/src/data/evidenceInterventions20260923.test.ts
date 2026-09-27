import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_23 } from "./evidenceInterventions20260923";

describe("evidence interventions 2026-09-23", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_23).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_23) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-23");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("uses the peer-reviewed SFpark DiD rather than the larger administrative search-time change as the causal anchor", () => {
    const sfpark = EVIDENCE_INTERVENTIONS_2026_09_23.find(
      (item) => item.id === "san-francisco-sfpark-demand-responsive-parking-pricing",
    );
    expect(sfpark?.evidenceStrength).toBe("forte");
    expect(sfpark?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(sfpark?.effectSize).toContain("−15%");
    expect(sfpark?.effectSize).toContain("−12%");
    expect(sfpark?.effectSize).toContain("−43%");
    expect(sfpark?.limitations.join(" ")).toContain("43%");
    expect(
      sfpark?.evaluationStudies.some((study) => study.doi === "10.1016/j.tra.2018.03.007"),
    ).toBe(true);
  });

  it("keeps Lambeth simplification separate from the social-norm backfire", () => {
    const lambeth = EVIDENCE_INTERVENTIONS_2026_09_23.find(
      (item) => item.id === "lambeth-council-tax-bill-simplification-rct",
    );
    expect(lambeth?.evidenceStrength).toBe("forte");
    expect(lambeth?.evaluationMethod.toLowerCase()).toContain("randomized");
    expect(lambeth?.effectSize).toContain("+3,8");
    expect(lambeth?.effectSize).toContain("+4,3");
    expect(lambeth?.results.toLowerCase()).toContain("backfire");
    expect(lambeth?.lameziaAdaptation.toLowerCase()).toContain("non inserire una social norm");
    expect(
      lambeth?.evaluationStudies.some((study) => study.doi === "10.30636/jbpa.11.10"),
    ).toBe(true);
  });

  it("preserves the Las Vegas RCT result without generalising the use-of-force effect to all BWC programmes", () => {
    const vegas = EVIDENCE_INTERVENTIONS_2026_09_23.find(
      (item) => item.id === "las-vegas-body-worn-cameras-rct",
    );
    expect(vegas?.evidenceStrength).toBe("forte");
    expect(vegas?.evaluationMethod.toLowerCase()).toContain("randomized controlled trial");
    expect(vegas?.effectSize).toContain("54,6%→38,1%");
    expect(vegas?.effectSize).toContain("31,2%→19,7%");
    expect(vegas?.limitations.join(" ").toLowerCase()).toContain("eterogenei");
    expect(vegas?.transferabilityItaly.toLowerCase()).toContain("dpia");
    expect(
      vegas?.evaluationStudies.some((study) => study.doi === "10.1002/cl2.1112"),
    ).toBe(true);
  });
});
