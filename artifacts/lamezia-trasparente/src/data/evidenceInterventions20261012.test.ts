import { describe, expect, it } from "vitest";
import { EVIDENCE_INTERVENTIONS_2026_10_12 } from "./evidenceInterventions20261012";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_THEMATIC_AREAS, EVIDENCE_INTERVENTION_TYPES } from "./evidenceInterventions";

describe("municipal evidence 2026-10-12", () => {
  it("validates a unique, source-backed and published Hábitat RCT record", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_10_12).toHaveLength(1);
    const record = EVIDENCE_INTERVENTIONS_2026_10_12[0];
    expect(record.id).toBe("mexico-habitat-neighbourhood-infrastructure-rct");
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    for (const area of record.secondaryAreas) expect(EVIDENCE_THEMATIC_AREAS).toContain(area);
    for (const type of record.interventionTypes) expect(EVIDENCE_INTERVENTION_TYPES).toContain(type);
    expect(record.evidenceStrength).toBe("molto_forte");
    expect(record.primarySource.url.startsWith("https://")).toBe(true);
    expect(record.evaluationStudies).toHaveLength(3);
    expect(record.lastVerifiedAt).toBe("2026-10-12");
    expect(record.revisionHistory).toHaveLength(1);
    expect(EVIDENCE_INTERVENTIONS.filter(item => item.id === record.id)).toHaveLength(1);
  });
  it("preserves nulls and adverse rental consequences alongside benefits", () => {
    const record = EVIDENCE_INTERVENTIONS_2026_10_12[0];
    expect(record.evaluationMethod).toContain("176");
    expect(record.comparator).toContain("194");
    expect(record.effectSize).toContain("5,76");
    expect(record.effectSize).toContain("17 USD");
    expect(record.results.toLowerCase()).toContain("non rileva");
    expect(record.unintendedEffects.toLowerCase()).toContain("canoni");
    expect(record.evaluationStudies.map(x => x.doi)).toContain("10.1257/app.20160429");
    expect(record.evaluationStudies.map(x => x.doi)).toContain("10.3386/w32776");
  });
  it("does not duplicate the intervention under a second identity", () => {
    const record = EVIDENCE_INTERVENTIONS_2026_10_12[0];
    const matching = EVIDENCE_INTERVENTIONS.filter(item =>
      item.country === record.country &&
      item.evaluationStudies.some(s => s.doi === "10.1257/app.20160429")
    );
    expect(matching).toHaveLength(1);
  });
});
