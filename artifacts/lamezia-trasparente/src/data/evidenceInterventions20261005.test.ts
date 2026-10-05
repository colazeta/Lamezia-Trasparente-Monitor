import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_05 } from "./evidenceInterventions20261005";

describe("evidence interventions 2026-10-05", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_05).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_10_05) {
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
      expect(item.lastVerifiedAt).toBe("2026-10-05");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("deduplicates intervention-authority-territory-study tuples", () => {
    for (const item of EVIDENCE_INTERVENTIONS_2026_10_05) {
      const dois = item.evaluationStudies.map((study) => study.doi).filter(Boolean);
      expect(dois.length).toBeGreaterThan(0);

      const matching = EVIDENCE_INTERVENTIONS.filter((record) => {
        if (record.authority !== item.authority || record.territory !== item.territory) return false;
        const recordDois = new Set(record.evaluationStudies.map((study) => study.doi).filter(Boolean));
        return dois.some((doi) => recordDois.has(doi));
      });

      expect(matching).toHaveLength(1);
      expect(matching[0]?.id).toBe(item.id);
    }
  });

  it("preserves the Pasos Seguros fatal-crash null and design limitations", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_05.find(
      (record) => record.id === "mexico-city-pasos-seguros-pedestrian-intersections",
    );

    expect(item?.evidenceStrength).toBe("forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(item?.effectSize).toContain("−21%");
    expect(item?.effectSize).toContain("non significativa");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("12 mesi");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("volumi");
    expect(item?.evaluationStudies.some((study) => study.doi === "10.1136/jech-2022-219335")).toBe(
      true,
    );
  });

  it("keeps Glasgow's local crime reduction separate from the city-wide null", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_05.find(
      (record) => record.id === "glasgow-transformational-regeneration-areas-crime-did",
    );

    expect(item?.evidenceStrength).toBe("forte");
    expect(item?.effectSize).toContain("−19%");
    expect(item?.effectSize.toLowerCase()).toContain("nessuna riduzione");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("meccanica");
    expect(item?.unintendedEffects.toLowerCase()).toContain("spostamento");
    expect(item?.evaluationStudies.some((study) => study.doi === "10.1093/jeg/lbad021")).toBe(true);
  });

  it("does not turn Barcelona public-space scores into unmeasured health effects", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_10_05.find(
      (record) => record.id === "barcelona-eixample-green-corridors-public-space-did",
    );

    expect(item?.evidenceStrength).toBe("moderata");
    expect(item?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(item?.effectSize).toContain("+4,94");
    expect(item?.results.toLowerCase()).toContain("non misura direttamente");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("due sezioni");
    expect(item?.evaluationStudies.some((study) => study.doi === "10.1093/eurpub/ckag126")).toBe(
      true,
    );
  });
});
