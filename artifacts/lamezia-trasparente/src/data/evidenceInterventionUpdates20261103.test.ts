import { describe, expect, it } from "vitest";
import {
  EVIDENCE_INTERVENTIONS_DAILY,
} from "./evidenceInterventionsDaily";
import {
  EVIDENCE_INTERVENTIONS,
} from "./evidenceInterventionsArchive";
import { applyEvidenceInterventionUpdates20261103 } from "./evidenceInterventionUpdates20261103";

const id = "italy-payt-municipal-waste-fees";
const newDoi = "10.1016/j.ecolecon.2026.108991";

describe("2026-11-03 Emilia-Romagna PAYT evidence revision", () => {
  it("updates only the existing canonical intervention without duplicating it", () => {
    const original = EVIDENCE_INTERVENTIONS_DAILY.find(item => item.id === id);
    expect(original).toBeDefined();
    const updated = EVIDENCE_INTERVENTIONS.filter(item => item.id === id);
    expect(updated).toHaveLength(1);
    expect(updated[0].primaryArea).toBe("rifiuti_pulizia_urbana");
    expect(updated[0].evidenceStrength).toBe("forte");
    expect(updated[0].id).toBe(original?.id);
    expect(Object.keys(updated[0]).sort()).toEqual(Object.keys(original!).sort());
    const doiCount = updated[0].evaluationStudies.filter(study => study.doi === newDoi).length;
    expect(doiCount).toBe(1);
    expect(updated[0].evaluationStudies.length).toBe(original!.evaluationStudies.length + 1);
  });

  it("preserves previous evaluations, records limitations and revision history", () => {
    const updated = EVIDENCE_INTERVENTIONS.find(item => item.id === id)!;
    expect(updated.lastVerifiedAt).toBe("2026-11-03");
    expect(updated.effectSize).toContain("10 punti percentuali");
    expect(updated.results).toContain("non da un aumento statisticamente significativo");
    expect(updated.results).toContain("non emerge un aumento statisticamente significativo del costo totale");
    expect(updated.limitations.join(" ")).toContain("non randomizzata");
    expect(updated.limitations.join(" ")).toContain("65 comuni");
    expect(updated.evaluationStudies.some(study => study.doi === "10.32057/0.QEF.2020.584")).toBe(true);
    expect(updated.revisionHistory.at(-1)?.date).toBe("2026-11-03");
    expect(updated.revisionHistory.length).toBeGreaterThan(1);
  });

  it("does not modify unrelated archive records", () => {
    const other = EVIDENCE_INTERVENTIONS_DAILY.find(item => item.id !== id)!;
    expect(applyEvidenceInterventionUpdates20261103(other)).toBe(other);
  });
});
