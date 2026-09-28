import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_25 } from "./evidenceInterventions20260925";

describe("evidence interventions 2026-09-25", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_25).toHaveLength(3);
    for (const item of EVIDENCE_INTERVENTIONS_2026_09_25) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-25");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("preserves the key methodological safeguards", () => {
    const payt = EVIDENCE_INTERVENTIONS_2026_09_25.find((item) => item.id === "emilia-romagna-payt-waste-tariff");
    const bam = EVIDENCE_INTERVENTIONS_2026_09_25.find((item) => item.id === "chicago-becoming-a-man-school-counselling-rcts");
    const bahia = EVIDENCE_INTERVENTIONS_2026_09_25.find((item) => item.id === "salvador-bahia-azul-citywide-sanitation");
    expect(payt?.evidenceStrength).toBe("forte");
    expect(payt?.effectSize).toContain("−60 kg");
    expect(bam?.evidenceStrength).toBe("molto_forte");
    expect(bam?.limitations.join(" ").toLowerCase()).toContain("scaling");
    expect(bahia?.evidenceStrength).toBe("moderata");
    expect(bahia?.evaluationMethod.toLowerCase()).toContain("before-after");
  });
});
