import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_01 } from "./evidenceInterventions20261001";

describe("evidence interventions 2026-10-01", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_01).toHaveLength(2);
    for (const item of EVIDENCE_INTERVENTIONS_2026_10_01) {
      expect(item.id).toMatch(/^[a-z0-9-]+$/);
      expect(item.evidenceStrength).not.toBe("da_verificare");
      expect(EVIDENCE_THEMATIC_AREAS).toContain(item.primaryArea);
      for (const area of item.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
      for (const type of item.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
      expect(EVIDENCE_STRENGTHS).toContain(item.evidenceStrength);
      expect(EVIDENCE_IMPLEMENTABILITY).toContain(item.implementability);
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-10-01");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps Philadelphia's experimental caveats alongside the main effects", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_01.find(
      (x) => x.id === "philadelphia-abandoned-house-remediation-rct",
    );
    expect(item?.evidenceStrength).toBe("forte");
    expect(item?.effectSize).toContain("−8,43%");
    expect(item?.effectSize).toContain("−13,12%");
    expect(item?.effectSize).toContain("−6,96%");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("q-value");
    expect(item?.results.toLowerCase()).toContain("non significativa");
  });

  it("keeps Madrid's benefits and retail trade-off together", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_01.find(
      (x) => x.id === "madrid-central-low-emission-zone-did",
    );
    expect(item?.evidenceStrength).toBe("forte");
    expect(item?.effectSize).toContain("−19%");
    expect(item?.effectSize).toContain("−16%");
    expect(item?.effectSize).toContain("−21%");
    expect(item?.unintendedEffects.toLowerCase()).toContain("trade-off");
  });
});
