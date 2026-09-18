import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_18 } from "./evidenceInterventions20260918";

describe("evidence interventions 2026-09-18", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_18).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_18) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-18");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps London traffic-calmed 20 mph zones distinct from sign-only limits", () => {
    const london = EVIDENCE_INTERVENTIONS_2026_09_18.find(
      (item) => item.id === "london-20mph-traffic-calming-zones-casualties",
    );
    expect(london?.evidenceStrength).toBe("forte");
    expect(london?.evaluationMethod.toLowerCase()).toContain("interrupted time-series");
    expect(london?.evaluationMethod).toContain("119.029");
    expect(london?.effectSize).toContain("−41,9%");
    expect(london?.effectSize).toContain("−46,3%");
    expect(london?.effectSize).toContain("−50,2%");
    expect(london?.limitations.join(" ").toLowerCase()).toContain("semplici limiti 20 mph");
    expect(london?.evaluationStudies.some((study) => study.doi === "10.1136/bmj.b4469")).toBe(true);
  });

  it("preserves Cardiff's distinct health and police outcomes", () => {
    const cardiff = EVIDENCE_INTERVENTIONS_2026_09_18.find(
      (item) => item.id === "cardiff-violence-prevention-information-sharing-model",
    );
    expect(cardiff?.evidenceStrength).toBe("forte");
    expect(cardiff?.evaluationMethod).toContain("14");
    expect(cardiff?.effectSize).toContain("0,58");
    expect(cardiff?.effectSize).toContain("0,68");
    expect(cardiff?.effectSize).toContain("1,38");
    expect(cardiff?.results.toLowerCase()).toContain("aggressioni meno gravi");
    expect(cardiff?.limitations.join(" ").toLowerCase()).toContain("non è randomizzata");
    expect(cardiff?.evaluationStudies.some((study) => study.doi === "10.1136/bmj.d3313")).toBe(true);
  });

  it("keeps Brazilian participatory-budgeting evidence comparative rather than attributing effects to Porto Alegre alone", () => {
    const pb = EVIDENCE_INTERVENTIONS_2026_09_18.find(
      (item) => item.id === "brazil-municipal-participatory-budgeting-health-mortality",
    );
    expect(pb?.evidenceStrength).toBe("moderata");
    expect(pb?.territory).toContain("panel di comuni");
    expect(pb?.evaluationMethod).toContain("1990–2004");
    expect(pb?.effectSize).toContain("+2–3 punti percentuali");
    expect(pb?.effectSize).toContain("−1 a −2 decessi");
    expect(pb?.limitations.join(" ").toLowerCase()).toContain("non è randomizzata");
    expect(pb?.revisionHistory[0]?.note.toLowerCase()).toContain("non attribuisce");
    expect(
      pb?.evaluationStudies.some((study) => study.doi === "10.1016/j.worlddev.2013.01.009"),
    ).toBe(true);
  });
});
