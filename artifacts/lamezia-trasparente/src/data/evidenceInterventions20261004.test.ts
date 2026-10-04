import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_04 } from "./evidenceInterventions20261004";

describe("evidence interventions 2026-10-04", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_04).toHaveLength(2);

    for (const item of EVIDENCE_INTERVENTIONS_2026_10_04) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-10-04");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("does not duplicate an intervention-authority-territory-study tuple", () => {
    for (const item of EVIDENCE_INTERVENTIONS_2026_10_04) {
      const study = item.evaluationStudies[0]?.doi ?? item.evaluationStudies[0]?.citation ?? "";
      const matches = EVIDENCE_INTERVENTIONS.filter((record) => {
        const recordStudy =
          record.evaluationStudies[0]?.doi ?? record.evaluationStudies[0]?.citation ?? "";
        return (
          record.authority === item.authority &&
          record.territory === item.territory &&
          record.title === item.title &&
          recordStudy === study
        );
      });
      expect(matches).toHaveLength(1);
    }
  });

  it("keeps causal NYC speed-camera effects separate from descriptive violation trends", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_04.find(
      (x) => x.id === "nyc-school-zone-speed-cameras-did",
    );
    expect(item?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(item?.effectSize).toContain("−30%");
    expect(item?.effectSize).toContain("−16%");
    expect(item?.results).toContain("−94%");
    expect(item?.results.toLowerCase()).toContain("descrittivo");
    expect(item?.interventionStatus).toContain("2030");
  });

  it("preserves both benefits and longer-run null or negative SYEP findings", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_04.find(
      (x) => x.id === "nyc-summer-youth-employment-program-lottery",
    );
    expect(item?.evidenceStrength).toBe("molto_forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("randomized");
    expect(item?.effectSize).toContain("−0,098");
    expect(item?.effectSize).toContain("−0,073");
    expect(item?.results.toLowerCase()).toContain("non emergono");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("2005");
  });
});
