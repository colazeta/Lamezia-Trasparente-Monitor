import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_10 } from "./evidenceInterventions20260910";

describe("evidence interventions 2026-09-10", () => {
  it("contains only sourced and taxonomically valid public records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_10).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_10) {
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
      expect(item.evaluationMethod.trim().length).toBeGreaterThan(20);
      expect(item.comparator.trim().length).toBeGreaterThan(10);
      expect(item.limitations.length).toBeGreaterThan(0);
      expect(item.lastVerifiedAt).toBe("2026-09-10");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("keeps Catalonia's published effect range separate from Italian tax competence", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_10.find(
      (entry) => entry.id === "catalonia-municipal-ibi-solar-pv-rebates",
    );
    expect(item?.effectSize).toContain("34–50%");
    expect(item?.effectSize).toContain("68%");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("imu");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("base legislativa");
    expect(item?.lameziaAdaptation.toLowerCase()).toContain("quali leve fiscali locali siano realmente consentite");
  });

  it("keeps Healthy Homes as an active-comparator RCT and projected savings as projections", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_10.find(
      (entry) => entry.id === "seattle-king-county-healthy-homes-asthma",
    );
    expect(item?.comparator.toLowerCase()).toContain("intervento attivo");
    expect(item?.effectSize.toLowerCase()).toContain("p=0,138");
    expect(item?.effectSize.toLowerCase()).toContain("non un risparmio di bilancio direttamente osservato");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("non raggiunge la significatività statistica");
  });

  it("keeps Rio's lottery estimate as ITT and records the working-paper revision", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_10.find(
      (entry) => entry.id === "rio-de-janeiro-public-daycare-lottery",
    );
    expect(item?.evaluationMethod.toLowerCase()).toContain("intent-to-treat");
    expect(item?.effectSize).toContain("34%");
    expect(item?.effectSize).toContain("32%");
    expect(item?.results.toLowerCase()).toContain("non dai genitori");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("lavoro materno");
  });
});
