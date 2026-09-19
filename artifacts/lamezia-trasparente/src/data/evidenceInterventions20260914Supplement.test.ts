import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_14_SUPPLEMENT } from "./evidenceInterventions20260914Supplement";

describe("evidence interventions 2026-09-14 supplement", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_14_SUPPLEMENT).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_14_SUPPLEMENT) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-14");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps the Cape Town RCT effect modest, heterogeneous and distinct from infrastructure measures", () => {
    const capeTown = EVIDENCE_INTERVENTIONS_2026_09_14_SUPPLEMENT.find(
      (item) => item.id === "cape-town-water-bill-behavioural-nudges",
    );
    expect(capeTown?.evaluationMethod.toLowerCase()).toContain("randomized controlled trial");
    expect(capeTown?.effectSize).toContain("−0,6% / −1,3%");
    expect(capeTown?.results.toLowerCase()).toContain("eterogeneo");
    expect(capeTown?.results.toLowerCase()).toContain("non sostituisce");
    expect(capeTown?.limitations.join(" ").toLowerCase()).toContain("reddito");
    expect(capeTown?.interventionTypes).not.toContain("targeting_data_analytics");
  });

  it("does not attribute Preston outcomes to procurement alone or turn local sourcing into a legal preference", () => {
    const preston = EVIDENCE_INTERVENTIONS_2026_09_14_SUPPLEMENT.find(
      (item) => item.id === "preston-community-wealth-building-progressive-procurement",
    );
    expect(preston?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(preston?.effectSize).toContain("+4,1%");
    expect(preston?.results.toLowerCase()).toContain("non trova un aumento statisticamente significativo");
    expect(preston?.limitations.join(" ").toLowerCase()).toContain("multi-componente");
    expect(preston?.transferabilityItaly.toLowerCase()).toContain("non discriminazione");
    expect(preston?.lameziaAdaptation.toLowerCase()).toContain("non come criterio di aggiudicazione");
  });

  it("separates the NYC summons redesign estimate, SMS RCT and projected warrants avoided", () => {
    const nyc = EVIDENCE_INTERVENTIONS_2026_09_14_SUPPLEMENT.find(
      (item) => item.id === "new-york-summons-redesign-text-reminders",
    );
    expect(nyc?.evaluationMethod.toLowerCase()).toContain("randomized controlled trial");
    expect(nyc?.evaluationMethod.toLowerCase()).toContain("regression discontinuity");
    expect(nyc?.effectSize).toContain("−8 p.p.");
    expect(nyc?.effectSize).toContain("38%→28%");
    expect(nyc?.effectSize.toLowerCase()).toContain("proiezioni");
    expect(nyc?.transferabilityItaly.toLowerCase()).toContain("non è competenza comunale");
  });
});
