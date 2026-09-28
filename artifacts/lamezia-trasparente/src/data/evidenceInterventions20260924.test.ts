import { describe, expect, it } from "vitest";

import {
  EVIDENCE_IMPLEMENTABILITY,
  EVIDENCE_INTERVENTION_TYPES,
  EVIDENCE_STRENGTHS,
  EVIDENCE_THEMATIC_AREAS,
} from "./evidenceInterventions";
import { EVIDENCE_INTERVENTIONS } from "./evidenceInterventionsArchive";
import { EVIDENCE_INTERVENTIONS_2026_09_24 } from "./evidenceInterventions20260924";

describe("evidence interventions 2026-09-24", () => {
  it("contains only sourced, publishable and taxonomically valid records", () => {
    expect(EVIDENCE_INTERVENTIONS_2026_09_24).toHaveLength(3);

    for (const item of EVIDENCE_INTERVENTIONS_2026_09_24) {
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
      expect(item.lastVerifiedAt).toBe("2026-09-24");
      expect(item.revisionHistory.length).toBeGreaterThan(0);
      expect(EVIDENCE_INTERVENTIONS.filter((record) => record.id === item.id)).toHaveLength(1);
    }
  });

  it("keeps San Francisco tenant protection benefits together with the landlord supply response", () => {
    const rentControl = EVIDENCE_INTERVENTIONS_2026_09_24.find(
      (item) => item.id === "san-francisco-1994-rent-control-expansion",
    );
    expect(rentControl?.evidenceStrength).toBe("forte");
    expect(rentControl?.evaluationMethod.toLowerCase()).toContain("quasi");
    expect(rentControl?.effectSize).toContain("−20%");
    expect(rentControl?.effectSize).toContain("−15%");
    expect(rentControl?.effectSize).toContain("+5,1%");
    expect(rentControl?.unintendedEffects.toLowerCase()).toContain("riduzione dello stock");
    expect(
      rentControl?.evaluationStudies.some((study) => study.doi === "10.1257/aer.20181289"),
    ).toBe(true);
  });

  it("separates Seattle donor expansion from the null result on donor diversity", () => {
    const vouchers = EVIDENCE_INTERVENTIONS_2026_09_24.find(
      (item) => item.id === "seattle-democracy-voucher-public-campaign-finance",
    );
    expect(vouchers?.evidenceStrength).toBe("forte");
    expect(vouchers?.evaluationMethod.toLowerCase()).toContain("difference-in-differences");
    expect(vouchers?.effectSize).toContain("+53%");
    expect(vouchers?.effectSize).toContain("+350%");
    expect(vouchers?.results.toLowerCase()).toContain("non supporta");
    expect(
      vouchers?.evaluationStudies.some((study) => study.doi === "10.1016/j.jpubeco.2022.104676"),
    ).toBe(true);
    expect(
      vouchers?.evaluationStudies.some((study) => study.doi === "10.1017/S0003055424000170"),
    ).toBe(true);
  });

  it("keeps Stockton first-year employment evidence distinct from the pandemic follow-up", () => {
    const seed = EVIDENCE_INTERVENTIONS_2026_09_24.find(
      (item) => item.id === "stockton-seed-guaranteed-income-rct",
    );
    expect(seed?.evidenceStrength).toBe("forte");
    expect(seed?.evaluationMethod.toLowerCase()).toContain("randomized controlled trial");
    expect(seed?.effectSize).toContain("28%→40%");
    expect(seed?.effectSize).toContain("32%→37%");
    expect(seed?.limitations.join(" ").toLowerCase()).toContain("pandemia");
    expect(seed?.limitations.join(" ")).toContain("125");
    expect(seed?.limitations.join(" ")).toContain("131");
    expect(
      seed?.evaluationStudies.some((study) => study.doi === "10.1007/s11524-023-00723-0"),
    ).toBe(true);
  });
});
