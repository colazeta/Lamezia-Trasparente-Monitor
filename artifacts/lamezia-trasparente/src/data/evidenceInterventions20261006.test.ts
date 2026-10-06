import { describe, expect, it } from "vitest";

import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_10_06 } from "./evidenceInterventions20261006";

describe("evidence interventions 2026-10-06", () => {
  it("adds two unique records to the archive", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_06).toHaveLength(2);
    for (const item of EVIDENCE_INTERVENTIONS_2026_10_06) {
      expect(item.lastVerifiedAt).toBe("2026-10-06");
      expect(item.evaluationStudies.length).toBeGreaterThan(0);
      expect(item.primarySource.url.startsWith("https://")).toBe(true);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("preserves the verified effect sizes and caveats", () => {
    const bikeshare = EVIDENCE_INTERVENTIONS_2026_10_06[0];
    expect(bikeshare.effectSize).toContain("−2,9%");
    expect(bikeshare.effectSize).toContain("−4%");

    const water = EVIDENCE_INTERVENTIONS_2026_10_06[1];
    expect(water.effectSize).toContain("+17 punti percentuali");
    expect(water.effectSize).toContain("+1,7%");
    expect(water.results.toLowerCase()).toContain("non produce");
  });
});
