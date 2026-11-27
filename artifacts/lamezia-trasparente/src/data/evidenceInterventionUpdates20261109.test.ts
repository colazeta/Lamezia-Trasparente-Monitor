import { describe, expect, it } from "vitest";
import { EVIDENCE_IMPLEMENTABILITY, EVIDENCE_INTERVENTION_TYPES, EVIDENCE_STRENGTHS, EVIDENCE_THEMATIC_AREAS } from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { applyEvidenceInterventionUpdates20261109 } from "./evidenceInterventionUpdates20261109";

const PAYT_ID = "italy-payt-municipal-waste-fees";
const DOI = "10.1016/j.ecolecon.2026.108991";

describe("2026-11-09 Emilia-Romagna PAYT evidence revision", () => {
  const records = EVIDENCE_INTERVENTIONS.filter((item) => item.id === PAYT_ID);
  const record = records[0];

  it("updates the existing stable record rather than creating a duplicate", () => {
    expect(records).toHaveLength(1);
    expect(record).toBeDefined();
    expect(record.lastVerifiedAt).toBe("2026-11-27");
    expect(record.revisionHistory.some((revision) => revision.date === "2026-08-30")).toBe(true);
    expect(record.revisionHistory.some((revision) => revision.date === "2026-11-09")).toBe(true);
    expect(record.evaluationStudies.filter((study) => study.doi === DOI)).toHaveLength(1);
    expect(record.evaluationStudies.some((study) => study.doi === "10.32057/0.QEF.2020.584")).toBe(true);
    expect(record.evaluationStudies.some((study) => study.doi === "10.1016/j.jebo.2025.107247")).toBe(true);
  });

  it("qualifies the causal estimates, observed regional figures, and cost limitations", () => {
    expect(record.evaluationMethod).toContain("synthetic DiD");
    expect(record.evaluationMethod).toContain("staggered DiD");
    expect(record.results).toContain("10 punti percentuali");
    expect(record.effectSize).toContain("NON equivale");
    expect(record.limitations.join(" ")).toContain("NON la stima causale");
    expect(record.limitations.join(" ")).toContain("65 misurano");
    expect(record.primarySource.url).toMatch(/^https:\/\/ambiente\.regione\.emilia-romagna\.it\//);
  });

  it("retains canonical classifications and transfers with explicit Lamezia prerequisites", () => {
    expect(EVIDENCE_THEMATIC_AREAS).toContain(record.primaryArea);
    record.secondaryAreas.forEach((area) => expect(EVIDENCE_THEMATIC_AREAS).toContain(area));
    record.interventionTypes.forEach((type) => expect(EVIDENCE_INTERVENTION_TYPES).toContain(type));
    expect(EVIDENCE_STRENGTHS).toContain(record.evidenceStrength);
    expect(EVIDENCE_IMPLEMENTABILITY).toContain(record.implementability);
    expect(record.lameziaAdaptation).toContain("Lamezia Multiservizi");
    expect(record.lameziaAdaptation).toContain("non presupporre");
  });

  it("adds the 2026-11-27 Valente evidence once and distinguishes estimated costs from simulations", () => {
    expect(record.evaluationStudies.filter((study) => study.doi === "10.1016/j.jeem.2022.102755")).toHaveLength(1);
    expect(record.revisionHistory.some((revision) => revision.date === "2026-11-27")).toBe(true);
    expect(record.evaluationMethod).toContain("3.574 comuni del Centro-Nord");
    expect(record.effectSize).toContain("20,17");
    expect(record.effectSize).toContain("23,85");
    expect(record.effectSize).toContain("non sono risparmi di bilancio osservati");
    expect(record.limitations.join(" ")).toContain("Sud e Isole esclusi");
    expect(record.lameziaAdaptation).toContain("Simulare più livelli");
  });

  it("leaves unrelated records unchanged", () => {
    const other = EVIDENCE_INTERVENTIONS.find((item) => item.id !== PAYT_ID);
    expect(other).toBeDefined();
    expect(applyEvidenceInterventionUpdates20261109(other!)).toBe(other);
  });
});
