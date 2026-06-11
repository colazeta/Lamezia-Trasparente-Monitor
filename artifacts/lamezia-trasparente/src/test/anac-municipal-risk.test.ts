import { describe, expect, it } from "vitest";

import {
  type AnacMunicipalRiskReference,
  classifyAnacMunicipalRiskReference,
  countAnacMunicipalRiskReferences,
  findAnacMunicipalRiskPublicationBlocks,
  formatAnacMunicipalRiskLabel,
  sortAnacMunicipalRiskReferences,
  validateAnacMunicipalRiskUrl,
} from "../lib/anacMunicipalRisk";

const FORBIDDEN_PUBLIC_FORMULAS = [
  "corruzione accertata",
  "illecito",
  "responsabilità",
  "anomalia certa",
];

const syntheticReferences: AnacMunicipalRiskReference[] = [
  {
    id: "anac-context-threshold",
    indicatorCode: "ANAC-CONTEXT-02",
    indicatorName: "Addensamento sotto soglia",
    category: "below-threshold-clustering",
    sourceUrl: "https://example.test/anac/indicatori",
    methodologyUrl: "demo://anac-methodology/municipal-risk",
    periodLabel: "periodo sintetico documentato nella metodologia",
    lastDocumentedYear: 2022,
    sourceStatus: "documented",
    interpretation: "procurement-context",
  },
  {
    id: "anac-context-population",
    indicatorCode: "ANAC-CONTEXT-03",
    indicatorName: "Popolazione residente",
    category: "demographic-context",
    sourceUrl: "https://example.test/anac/rischio-comunale",
    methodologyUrl: "https://example.test/anac/metodologia",
    periodLabel: "fixture sintetica senza valori comunali",
    sourceStatus: "partial",
    interpretation: "demographic-context",
  },
  {
    id: "anac-context-income",
    indicatorCode: "ANAC-CONTEXT-04",
    indicatorName: "Reddito imponibile pro capite",
    category: "income-context",
    sourceUrl: "demo://anac-source/income-context",
    methodologyUrl: "demo://anac-methodology/income-context",
    sourceStatus: "not-imported",
    interpretation: "context-signal",
  },
  {
    id: "anac-context-dissolution",
    indicatorCode: "ANAC-CONTEXT-01",
    indicatorName: "Scioglimento per mafia come contesto documentale",
    category: "mafia-dissolution-context",
    sourceUrl: "https://example.test/anac/project",
    methodologyUrl: "https://example.test/anac/municipal-risk-methodology",
    lastDocumentedYear: 2022,
    sourceStatus: "documented",
    interpretation: "not-corruption-evidence",
  },
];

describe("ANAC municipal risk reference URL validation", () => {
  it("accepts only http, https and demo URLs without fetching external resources", () => {
    expect(validateAnacMunicipalRiskUrl("https://example.test/metodo")).toMatchObject({
      normalizedUrl: "https://example.test/metodo",
      valid: true,
      reason: "allowed-protocol",
    });

    expect(validateAnacMunicipalRiskUrl("http://example.test/metodo")).toMatchObject({
      valid: true,
      reason: "allowed-protocol",
    });

    expect(validateAnacMunicipalRiskUrl("demo://synthetic/anac-methodology")).toMatchObject({
      normalizedUrl: "demo://synthetic/anac-methodology",
      valid: true,
      reason: "allowed-protocol",
    });
  });

  it("blocks mailto, javascript and file protocols", () => {
    for (const blockedUrl of [
      "mailto:trasparenza@example.test",
      "javascript:alert('no')",
      "file:///tmp/anac.csv",
    ]) {
      expect(validateAnacMunicipalRiskUrl(blockedUrl)).toEqual({
        input: blockedUrl,
        valid: false,
        reason: "blocked-protocol",
      });
    }
  });
});

describe("ANAC municipal risk reference labels and readiness", () => {
  it("keeps labels technical, cautious and non accusatory", () => {
    for (const reference of syntheticReferences) {
      const label = formatAnacMunicipalRiskLabel(reference).toLowerCase();

      expect(label).toContain("contesto");
      for (const forbiddenFormula of FORBIDDEN_PUBLIC_FORMULAS) {
        expect(label).not.toContain(forbiddenFormula);
      }
    }
  });

  it("classifies references with deterministic cautious readiness states", () => {
    expect(classifyAnacMunicipalRiskReference(syntheticReferences[0])).toMatchObject({
      id: "anac-context-threshold",
      readiness: "reference-ready",
      publicationBlockReasons: [],
    });

    expect(classifyAnacMunicipalRiskReference(syntheticReferences[1])).toMatchObject({
      id: "anac-context-population",
      readiness: "needs-context",
      publicationBlockReasons: [],
    });

    expect(classifyAnacMunicipalRiskReference(syntheticReferences[2])).toMatchObject({
      id: "anac-context-income",
      readiness: "needs-context",
      publicationBlockReasons: [],
    });
  });

  it("blocks references without id, source, methodology note or prudent interpretation", () => {
    const blockedReference: AnacMunicipalRiskReference = {
      id: " ",
      indicatorName: "Formula sintetica non pubblicabile",
      category: "other-context",
      sourceStatus: "documented",
      interpretation: "corruzione accertata",
    };

    expect(findAnacMunicipalRiskPublicationBlocks(blockedReference)).toEqual([
      "missing-id",
      "missing-source-url",
      "missing-methodology-url",
      "non-prudent-interpretation",
    ]);

    expect(classifyAnacMunicipalRiskReference(blockedReference)).toMatchObject({
      readiness: "not-publishable",
    });
  });

  it("marks references that still need source verification without treating them as evidence", () => {
    const referenceNeedingSource: AnacMunicipalRiskReference = {
      id: "anac-context-other",
      indicatorName: "Riferimento metodologico da verificare",
      category: "other-context",
      sourceUrl: "demo://anac-source/pending",
      methodologyUrl: "demo://anac-methodology/pending",
      periodLabel: "fixture sintetica",
      sourceStatus: "missing-source",
      interpretation: "context-signal",
    };

    expect(classifyAnacMunicipalRiskReference(referenceNeedingSource)).toMatchObject({
      readiness: "needs-source",
      publicationBlockReasons: [],
    });
  });
});

describe("ANAC municipal risk reference collection helpers", () => {
  it("counts references by category and source status", () => {
    expect(countAnacMunicipalRiskReferences(syntheticReferences)).toEqual({
      byCategory: {
        "mafia-dissolution-context": 1,
        "below-threshold-clustering": 1,
        "demographic-context": 1,
        "income-context": 1,
        "other-context": 0,
      },
      bySourceStatus: {
        documented: 2,
        partial: 1,
        "missing-source": 0,
        "not-imported": 1,
      },
    });
  });

  it("sorts deterministically by category and id without mutating the input", () => {
    const input = [syntheticReferences[3], syntheticReferences[2], syntheticReferences[0], syntheticReferences[1]];
    const originalIds = input.map((reference) => reference.id);

    const firstSort = sortAnacMunicipalRiskReferences(input).map((reference) => reference.id);
    const secondSort = sortAnacMunicipalRiskReferences(input).map((reference) => reference.id);

    expect(firstSort).toEqual(secondSort);
    expect(firstSort).toEqual([
      "anac-context-threshold",
      "anac-context-population",
      "anac-context-income",
      "anac-context-dissolution",
    ]);
    expect(input.map((reference) => reference.id)).toEqual(originalIds);
  });
});
