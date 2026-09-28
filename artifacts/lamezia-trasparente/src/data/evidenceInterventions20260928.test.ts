import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_28 } from "./evidenceInterventions20260928";

describe("evidence interventions 2026-09-28", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_28).toHaveLength(3);
    for (const item of EVIDENCE_INTERVENTIONS_2026_09_28) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-28");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps Denver supportive housing separate from the SIB financing mechanism", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_28.find((x) => x.id === "denver-supportive-housing-social-impact-bond-rct");
    expect(item?.evidenceStrength).toBe("molto_forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("randomized controlled trial");
    expect(item?.effectSize).toContain("+560");
    expect(item?.effectSize).toContain("−40%");
    expect(item?.effectSize).toContain("−27%");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("social impact bond");
  });

  it("does not add together New York's two benchmarking estimates", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_28.find((x) => x.id === "nyc-local-law-84-energy-benchmarking-disclosure");
    expect(item?.evidenceStrength).toBe("forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(item?.effectSize).toContain("−6%");
    expect(item?.effectSize).toContain("−14%");
    expect(item?.effectSize).toContain("−9%");
    expect(item?.effectSize).toContain("−13%");
    expect(item?.effectSize.toLowerCase()).toContain("non sono additive");
  });

  it("preserves Cape Town heterogeneity and low-use safeguards", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_28.find((x) => x.id === "cape-town-water-bill-conservation-nudges-rct");
    expect(item?.evidenceStrength).toBe("molto_forte");
    expect(item?.effectSize).toContain("−0,6%/−1,3%");
    expect(item?.effectSize).toContain("18 mesi");
    expect(item?.results.toLowerCase()).toContain("reddito più basso");
    expect(item?.population).toContain("6 kL/mese");
  });
});
