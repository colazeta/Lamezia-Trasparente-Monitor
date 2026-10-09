import { describe, expect, it } from "vitest";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_09 } from "./evidenceInterventions20261009";

describe("municipal evidence batch 2026-10-09", () => {
  it("includes each verified intervention once", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_09).toHaveLength(2);
    for (const intervention of EVIDENCE_INTERVENTIONS_2026_10_09) {
      expect(intervention.primarySource.url.startsWith("https://")).toBe(true);
      expect(intervention.evaluationStudies.length).toBeGreaterThan(0);
      expect(intervention.lastVerifiedAt).toBe("2026-10-09");
      expect(intervention.limitations.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((item) => item.id === intervention.id)).toHaveLength(1);
    }
  });
  it("retains the Santa Fe LATE caveat", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_09[0].effectSize).toContain("IV/LATE");
    expect(EVIDENCE_INTERVENTIONS_2026_10_09[0].results).toContain("+5,4");
  });
  it("retains Barcelona's adverse employment result", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_09[1].effectSize).toContain("−22%");
    expect(EVIDENCE_INTERVENTIONS_2026_10_09[1].effectSize).toContain("−8 p.p.");
  });
});
