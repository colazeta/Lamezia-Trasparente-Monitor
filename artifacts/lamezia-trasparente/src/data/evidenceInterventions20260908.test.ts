import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS_2026_09_08 } from "./evidenceInterventions20260908";

describe("evidence interventions 2026-09-08", () => {
  it("contains only sourced and taxonomically valid public records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_08).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_08) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-08");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
    }
  });

  it("keeps the STAR outcome framed as recorded low-level offenses", () => {
    const star = EVIDENCE_INTERVENTIONS_2026_09_08.find(
      (item) => item.id === "denver-star-alternative-crisis-response",
    );
    expect(star?.outcomes.join(" ").toLowerCase()).toContain("registrati");
    expect(star?.effectSize.toLowerCase()).toContain("registrati");
    expect(star?.limitations.join(" ").toLowerCase()).toContain("outcome principale");
  });

  it("keeps the Trentino migration evidence explicitly uncertain and fertility null", () => {
    const trentino = EVIDENCE_INTERVENTIONS_2026_09_08.find(
      (item) => item.id === "trentino-family-friendly-municipality-certification",
    );
    expect(trentino?.evidenceStrength).toBe("moderata");
    expect(trentino?.effectSize).toContain("p=0,064");
    expect(trentino?.results.toLowerCase()).toContain("non emerge alcun effetto rilevabile sulla fertilità");
    expect(trentino?.lameziaAdaptation).toContain("marzo 2009");
    expect(trentino?.limitations.join(" ")).toContain("convenzione sottoscritta");
  });

  it("records Calgary as a randomized reporting experiment rather than a randomized 311 rollout", () => {
    const calgary = EVIDENCE_INTERVENTIONS_2026_09_08.find(
      (item) => item.id === "calgary-311-service-request-resolution-rct",
    );
    expect(calgary?.evaluationMethod.toLowerCase()).toContain("field experiment randomizzato");
    expect(calgary?.limitations.join(" ").toLowerCase()).toContain("non l'effetto causale di introdurre ex novo");
  });
});
