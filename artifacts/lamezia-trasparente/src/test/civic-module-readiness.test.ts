import { describe, expect, it } from "vitest";

import {
  civicModuleSlug,
  createCivicModuleReadinessMatrix,
  createCivicModuleReadinessReport,
  type CivicModuleReadinessInput,
} from "../lib/civicModuleReadiness";

describe("civic module readiness", () => {
  it("marks demo-only modules as not publishable as real data", () => {
    const report = createCivicModuleReadinessReport({
      id: "Modulo dimostrativo",
      area: "monitoring",
      sourceCoverage: "demo_only",
      methodology: "documented",
      demoMode: true,
      exposureIntent: "future_public",
    });

    expect(report.readiness).toBe("demo_only");
    expect(report.publishable).toBe(false);
    expect(report.notPublishableReasons).toContain("demo_only");
    expect(report.technicalReasons).toEqual(["readiness:demo_only"]);
  });

  it("classifies documented sources with partial methodology prudently", () => {
    const report = createCivicModuleReadinessReport({
      id: "Verifica metodologia parziale",
      area: "procurement",
      sourceCoverage: "documented",
      methodology: "partial",
      demoMode: false,
      exposureIntent: "future_public",
    });

    expect(report.readiness).toBe("methodology_partial");
    expect(report.publishable).toBe(true);
    expect(report.technicalReasons).toEqual([
      "readiness:methodology_or_source_partial",
    ]);
  });

  it("detects modules without configured source coverage", () => {
    const report = createCivicModuleReadinessReport({
      id: "Fonte assente",
      area: "administration",
      sourceCoverage: "not_configured",
      methodology: "documented",
      demoMode: false,
      exposureIntent: "future_public",
    });

    expect(report.readiness).toBe("source_not_configured");
    expect(report.publishable).toBe(false);
    expect(report.notPublishableReasons).toEqual(["source_not_configured"]);
  });

  it("normalizes technical module ids and sorts reports deterministically", () => {
    const matrix = createCivicModuleReadinessMatrix([
      documentedModule("Zeta modulo", "procurement"),
      documentedModule("Àlbo  Pretorio", "administration"),
      documentedModule("Beta modulo", "administration"),
    ]);

    expect(civicModuleSlug("  Monitor Civico: Àlbo Pretorio  ")).toBe(
      "monitor-civico-albo-pretorio",
    );
    expect(matrix.reports.map((report) => report.slug)).toEqual([
      "albo-pretorio",
      "beta-modulo",
      "zeta-modulo",
    ]);
  });

  it("counts reports by readiness level, area and source coverage", () => {
    const matrix = createCivicModuleReadinessMatrix([
      documentedModule("Modulo pronto", "monitoring"),
      {
        id: "Metodologia parziale",
        area: "monitoring",
        sourceCoverage: "documented_partial",
        methodology: "documented",
        demoMode: false,
        exposureIntent: "future_public",
      },
      {
        id: "Fonte non configurata",
        area: "assets",
        sourceCoverage: "not_configured",
        methodology: "documented",
        demoMode: false,
        exposureIntent: "future_public",
      },
    ]);

    expect(matrix.counts.byReadiness.ready_for_future_exposure).toBe(1);
    expect(matrix.counts.byReadiness.methodology_partial).toBe(1);
    expect(matrix.counts.byReadiness.source_not_configured).toBe(1);
    expect(matrix.counts.byArea.monitoring).toBe(2);
    expect(matrix.counts.byArea.assets).toBe(1);
    expect(matrix.counts.bySourceCoverage.documented).toBe(1);
    expect(matrix.counts.bySourceCoverage.documented_partial).toBe(1);
    expect(matrix.counts.bySourceCoverage.not_configured).toBe(1);
  });

  it("does not mutate input records", () => {
    const inputs: CivicModuleReadinessInput[] = [
      documentedModule("Modulo B", "participation"),
      documentedModule("Modulo A", "participation"),
    ];
    const before = structuredClone(inputs);

    createCivicModuleReadinessMatrix(inputs);

    expect(inputs).toEqual(before);
  });

  it("detects records missing source, methodology or explicit demo flag", () => {
    const matrix = createCivicModuleReadinessMatrix([
      {
        id: "Senza flag demo",
        area: "civic_access",
        sourceCoverage: "documented",
        methodology: "documented",
        exposureIntent: "future_public",
      },
      {
        id: "Senza metodologia",
        area: "civic_access",
        sourceCoverage: "documented",
        methodology: "missing",
        demoMode: false,
        exposureIntent: "future_public",
      },
      documentedModule("Pubblicabile", "civic_access"),
    ]);

    expect(matrix.notPublishableRecords.map((report) => report.slug)).toEqual([
      "senza-flag-demo",
      "senza-metodologia",
    ]);
    expect(matrix.notPublishableRecords[0]?.notPublishableReasons).toContain(
      "demo_flag_missing",
    );
    expect(matrix.notPublishableRecords[1]?.notPublishableReasons).toContain(
      "methodology_missing",
    );
  });

  it("uses only synthetic fixtures without live URLs or real data fields", () => {
    const matrix = createCivicModuleReadinessMatrix([
      documentedModule("Fixture sintetica", "other"),
    ]);

    const serialized = JSON.stringify(matrix);

    expect(serialized).not.toMatch(/https?:\/\//i);
    expect(serialized).not.toMatch(/comune\.lamezia-terme\.cz\.it/i);
    expect(serialized).not.toMatch(/codice fiscale|partita iva|cig|cup/i);
  });
});

function documentedModule(
  id: string,
  area: CivicModuleReadinessInput["area"],
): CivicModuleReadinessInput {
  return {
    id,
    area,
    sourceCoverage: "documented",
    methodology: "documented",
    demoMode: false,
    exposureIntent: "future_public",
  };
}
