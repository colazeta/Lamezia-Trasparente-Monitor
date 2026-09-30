import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_30 } from "./evidenceInterventions20260930";

describe("evidence interventions 2026-09-30", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_30).toHaveLength(3);
    for (const item of EVIDENCE_INTERVENTIONS_2026_09_30) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-30");
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps London specific to engineered 20 mph zones and conservative causal language", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_30.find(
      (x) => x.id === "london-20mph-engineered-zones-casualties",
    );
    expect(item?.evidenceStrength).toBe("forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("controlled interrupted time-series");
    expect(item?.measure.toLowerCase()).toContain("misure fisiche");
    expect(item?.effectSize).toContain("−41,9%");
    expect(item?.effectSize).toContain("−46,3%");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("non è un esperimento randomizzato");
  });

  it("does not overstate Ahmedabad's ecological before-after estimate", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_30.find(
      (x) => x.id === "ahmedabad-heat-action-plan-mortality",
    );
    expect(item?.evidenceStrength).toBe("moderata");
    expect(item?.evaluationMethod.toLowerCase()).toContain("pre/post");
    expect(item?.comparator.toLowerCase()).toContain("nessuna città esterna");
    expect(item?.effectSize).toContain("1.190");
    expect(item?.effectSize).toContain("162–2.218");
    expect(item?.limitations.join(" ").toLowerCase()).toContain("due stagioni");
  });

  it("preserves Philadelphia's threshold effect and enforcement burden", () => {
    const item = EVIDENCE_INTERVENTIONS_2026_09_30.find(
      (x) => x.id === "philadelphia-foot-patrol-hotspots-rct",
    );
    expect(item?.evidenceStrength).toBe("molto_forte");
    expect(item?.evaluationMethod.toLowerCase()).toContain("randomized controlled trial");
    expect(item?.effectSize).toContain("−23%");
    expect(item?.effectSize).toContain("53");
    expect(item?.effectSize).toContain("6 reati violenti");
    expect(item?.unintendedEffects).toContain("64%");
    expect(item?.unintendedEffects).toContain("13%");
  });
});
