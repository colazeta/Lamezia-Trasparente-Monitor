import { describe, expect, it } from "vitest";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";

describe("evidence revision 2026-11-08 — Islington LTN pollution and traffic", () => {
  const id = "london-low-traffic-neighbourhoods-road-injuries";
  const doi = "10.1016/j.trd.2022.103536";

  it("updates the existing London LTN intervention rather than duplicating it", () => {
    const records = EVIDENCE_INTERVENTIONS.filter((item) => item.id === id);
    expect(records).toHaveLength(1);
    const london = records[0];
    expect(london.primaryArea).toBe("mobilita_spazio_pubblico");
    expect(london.lastVerifiedAt).toBe("2026-11-08");
    expect(london.revisionHistory.map((r) => r.date)).toContain("2026-09-04");
    expect(london.revisionHistory.map((r) => r.date)).toContain("2026-11-08");
    expect(london.evaluationStudies.filter((study) => study.doi === doi)).toHaveLength(1);
    expect(EVIDENCE_INTERVENTIONS.filter((item) => item.evaluationStudies.some((study) => study.doi === doi))).toHaveLength(1);
    expect(london.evaluationStudies.some((study) => study.url.includes("islington.gov.uk"))).toBe(true);
  });

  it("distinguishes significant NO2 outcomes from uncertain traffic-border results", () => {
    const london = EVIDENCE_INTERVENTIONS.find((item) => item.id === id)!;
    expect(london.effectSize).toContain("NO₂ interno −5,7%");
    expect(london.effectSize).toContain("boundary −8,9%");
    expect(london.effectSize).toContain("traffico interno −58,2%");
    expect(london.effectSize).toContain("boundary −13,4% NON statisticamente significativo");
    expect(london.limitations.join(" ")).toContain("solo al 10%");
    expect(london.evaluationMethod).toContain("generalised difference-in-differences");
    expect(london.results).toContain("NON è statisticamente significativo");
    expect(london.lameziaAdaptation).toContain("PGTU 2026");
    expect(london.evidenceStrength).toBe("forte"); // overall 2025 injury study; evidence on Islington NO2 only moderate
  });
});
