import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_21 } from "./evidenceInterventions20260921";

describe("evidence interventions 2026-09-21", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_21).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_21) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-21");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps London school-meal health evidence separate from mixed attainment evidence", () => {
    const london = EVIDENCE_INTERVENTIONS_2026_09_21.find(
      (item) => item.id === "london-boroughs-universal-free-school-meals",
    );
    expect(london?.evidenceStrength).toBe("forte");
    expect(london?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(london?.effectSize).toContain("−1,3/−1,4");
    expect(london?.effectSize).toContain("−2,1");
    expect(london?.results.toLowerCase()).toContain("eterogenei");
    expect(london?.limitations.join(" ").toLowerCase()).toContain("non trova un effetto medio significativo");
    expect(
      london?.evaluationStudies.some((study) => study.doi === "10.1016/j.jhealeco.2024.102937"),
    ).toBe(true);
  });

  it("uses the causal NYC speed-camera study as the primary effect estimate", () => {
    const nyc = EVIDENCE_INTERVENTIONS_2026_09_21.find(
      (item) => item.id === "nyc-school-zone-speed-cameras-safety",
    );
    expect(nyc?.evidenceStrength).toBe("forte");
    expect(nyc?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(nyc?.effectSize).toContain("−5%");
    expect(nyc?.effectSize).toContain("−2,5%");
    expect(nyc?.effectSize).toContain("−30%");
    expect(nyc?.effectSize).toContain("−16%");
    expect(nyc?.effectSize.toLowerCase()).toContain("descrittivamente");
    expect(
      nyc?.evaluationStudies.some((study) => study.doi === "10.1073/pnas.2520328122"),
    ).toBe(true);
  });

  it("limits SMUD claims to peak-demand response and preserves competence caveats", () => {
    const smud = EVIDENCE_INTERVENTIONS_2026_09_21.find(
      (item) => item.id === "sacramento-smud-smartpricing-options",
    );
    expect(smud?.evidenceStrength).toBe("forte");
    expect(smud?.effectSize).toContain("12%");
    expect(smud?.effectSize).toContain("6%");
    expect(smud?.effectSize).toContain("24%");
    expect(smud?.effectSize).toContain("14%");
    expect(smud?.limitations.join(" ").toLowerCase()).toContain("consumo energetico totale");
    expect(smud?.transferabilityItaly.toLowerCase()).toContain("replica tariffaria comunale diretta");
    expect(smud?.lameziaAdaptation.toLowerCase()).toContain("edifici e carichi sotto controllo comunale");
  });
});
