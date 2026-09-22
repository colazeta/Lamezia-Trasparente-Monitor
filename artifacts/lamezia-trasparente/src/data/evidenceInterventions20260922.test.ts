import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_22 } from "./evidenceInterventions20260922";

describe("evidence interventions 2026-09-22", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_22).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_22) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-22");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps NYC SYEP benefits separate from null and adverse longer-term labour-market findings", () => {
    const nyc = EVIDENCE_INTERVENTIONS_2026_09_22.find(
      (item) => item.id === "nyc-summer-youth-employment-program-lottery",
    );
    expect(nyc?.evidenceStrength).toBe("molto_forte");
    expect(nyc?.evaluationMethod.toLowerCase()).toContain("randomized");
    expect(nyc?.effectSize).toContain("+54");
    expect(nyc?.effectSize).toContain("−10%");
    expect(nyc?.effectSize).toContain("−20%");
    expect(nyc?.results.toLowerCase()).toContain("redditi");
    expect(nyc?.results.toLowerCase()).toContain("college");
    expect(
      nyc?.evaluationStudies.some((study) => study.doi === "10.1093/qje/qjv034"),
    ).toBe(true);
    expect(
      nyc?.evaluationStudies.some((study) => study.doi === "10.1002/pam.22393"),
    ).toBe(true);
  });

  it("treats Medellin as an integrated neighborhood transformation rather than a cable-car-only effect", () => {
    const medellin = EVIDENCE_INTERVENTIONS_2026_09_22.find(
      (item) => item.id === "medellin-metrocable-pui-neighborhood-transformation",
    );
    expect(medellin?.evidenceStrength).toBe("forte");
    expect(medellin?.evaluationMethod.toLowerCase()).toContain("natural experiment");
    expect(medellin?.effectSize).toContain("0,33");
    expect(medellin?.effectSize).toContain("0,25");
    expect(medellin?.limitations.join(" ").toLowerCase()).toContain("sola linea k");
    expect(
      medellin?.evaluationStudies.some((study) => study.doi === "10.1093/aje/kwr428"),
    ).toBe(true);
  });

  it("preserves the legal and measurement caveats around Indonesian audit leakage estimates", () => {
    const indonesia = EVIDENCE_INTERVENTIONS_2026_09_22.find(
      (item) => item.id === "indonesia-kdp-random-government-audits-village-roads",
    );
    expect(indonesia?.evidenceStrength).toBe("molto_forte");
    expect(indonesia?.evaluationMethod.toLowerCase()).toContain("randomized");
    expect(indonesia?.effectSize).toContain("4%");
    expect(indonesia?.effectSize).toContain("100%");
    expect(indonesia?.effectSize).toContain("8 punti");
    expect(indonesia?.limitations.join(" ").toLowerCase()).toContain("qualificazione giuridica");
    expect(
      indonesia?.evaluationStudies.some((study) => study.doi === "10.1086/517935"),
    ).toBe(true);
  });
});
