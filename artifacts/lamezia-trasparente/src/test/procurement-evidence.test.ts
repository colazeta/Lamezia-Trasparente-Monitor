import { describe, expect, it } from "vitest";

import {
  buildProcurementEvidenceLabel,
  classifyProcurementEvidenceReadiness,
  countProcurementEvidenceByStatus,
  countProcurementEvidenceByType,
  type ProcurementEvidence,
  sortProcurementEvidence,
  validateProcurementEvidenceUrl,
} from "../lib/procurementEvidence";

const fixtures: readonly ProcurementEvidence[] = Object.freeze([
  Object.freeze({
    id: "ev-003",
    evidenceType: "supporting-document",
    relation: "supporting-context",
    sourceUrl: "demo://fixture/supporting-note",
    sourceLabel: "Scheda sintetica interna",
    identifier: "SYNTH-DOC-003",
    sourceStatus: "demo-only",
    interpretation: "context-only",
  }),
  Object.freeze({
    id: "ev-001",
    evidenceType: "cig-reference",
    relation: "direct-reference",
    sourceUrl: "https://example.test/procurement/reference-alpha",
    sourceLabel: "Riferimento tecnico sintetico",
    identifier: "SYNTH-ID-001",
    sourceStatus: "documented",
    interpretation: "identifier-reference",
  }),
  Object.freeze({
    id: "ev-002",
    evidenceType: "determina",
    relation: "requires-verification",
    sourceUrl: "http://example.test/procurement/reference-beta",
    identifier: "SYNTH-DOC-002",
    sourceStatus: "partial",
    interpretation: "documentary-evidence",
  }),
  Object.freeze({
    id: "ev-004",
    evidenceType: "missing-source",
    relation: "not-linked",
    sourceLabel: "Fonte dichiarata ma non importata",
    sourceStatus: "missing-source",
    interpretation: "not-compliance-finding",
  }),
]);

const FORMAL_CIG_LIKE_TOKEN = /^([0-9]{7}[A-F0-9]{3}|[A-UXYZ][A-F0-9]{9})$/;
const FORMAL_CUP_LIKE_TOKEN = /^[A-Z][0-9]{2}[A-Z][A-Z0-9]{11}$/;

describe("procurement evidence URL validation", () => {
  it("allows only http, https and demo URLs without fetching remote resources", () => {
    expect(validateProcurementEvidenceUrl("https://example.test/documento")).toMatchObject({
      valid: true,
      protocol: "https",
    });
    expect(validateProcurementEvidenceUrl("http://example.test/documento")).toMatchObject({
      valid: true,
      protocol: "http",
    });
    expect(validateProcurementEvidenceUrl("demo://fixture/documento")).toEqual({
      valid: true,
      protocol: "demo",
      normalizedUrl: "demo://fixture/documento",
    });
  });

  it("blocks protocols that should not be treated as procurement evidence sources", () => {
    expect(validateProcurementEvidenceUrl("mailto:office@example.test")).toEqual({
      valid: false,
      protocol: "unsupported",
    });
    expect(validateProcurementEvidenceUrl("javascript:alert(1)")).toEqual({
      valid: false,
      protocol: "unsupported",
    });
    expect(validateProcurementEvidenceUrl("file:///tmp/documento.pdf")).toEqual({
      valid: false,
      protocol: "unsupported",
    });
  });

  it("handles missing or malformed URLs conservatively", () => {
    expect(validateProcurementEvidenceUrl(undefined)).toEqual({ valid: false, protocol: "missing" });
    expect(validateProcurementEvidenceUrl("   ")).toEqual({ valid: false, protocol: "missing" });
    expect(validateProcurementEvidenceUrl("not a url")).toEqual({ valid: false, protocol: "invalid" });
  });
});

describe("procurement evidence labels and readiness", () => {
  it("builds neutral labels that keep the reference documentary and to be verified", () => {
    expect(buildProcurementEvidenceLabel(fixtures[1])).toBe(
      "Riferimento tecnico sintetico — riferimento documentale da verificare",
    );
    expect(buildProcurementEvidenceLabel(fixtures[2])).toBe("Riferimento a determina da verificare");

    for (const evidence of fixtures) {
      expect(buildProcurementEvidenceLabel(evidence).toLowerCase()).not.toContain("irregolarità");
      expect(buildProcurementEvidenceLabel(evidence).toLowerCase()).not.toContain("illecito");
      expect(buildProcurementEvidenceLabel(evidence).toLowerCase()).not.toContain("prova di");
    }
  });

  it("classifies document readiness without compliance scoring or substantive findings", () => {
    expect(classifyProcurementEvidenceReadiness(fixtures[1])).toBe("documentary-reference");
    expect(classifyProcurementEvidenceReadiness(fixtures[2])).toBe("partial-reference");
    expect(classifyProcurementEvidenceReadiness(fixtures[0])).toBe("demo-reference");
    expect(classifyProcurementEvidenceReadiness(fixtures[3])).toBe("requires-source");
  });
});

describe("procurement evidence counts and deterministic ordering", () => {
  it("counts evidence by type and by source status including zero values", () => {
    expect(countProcurementEvidenceByType(fixtures)).toMatchObject({
      "cig-reference": 1,
      determina: 1,
      "supporting-document": 1,
      "missing-source": 1,
      "cup-reference": 0,
      other: 0,
    });

    expect(countProcurementEvidenceByStatus(fixtures)).toEqual({
      documented: 1,
      partial: 1,
      "missing-source": 1,
      "not-imported": 0,
      "demo-only": 1,
    });
  });

  it("sorts deterministically and does not mutate the input array", () => {
    const mutableInput = fixtures.map((evidence) => ({ ...evidence }));
    const before = JSON.stringify(mutableInput);

    const sortedOnce = sortProcurementEvidence(mutableInput);
    const sortedTwice = sortProcurementEvidence([...mutableInput].reverse());

    expect(JSON.stringify(mutableInput)).toBe(before);
    expect(sortedOnce).not.toBe(mutableInput);
    expect(sortedOnce.map((evidence) => evidence.id)).toEqual(["ev-001", "ev-002", "ev-004", "ev-003"]);
    expect(sortedTwice.map((evidence) => evidence.id)).toEqual(sortedOnce.map((evidence) => evidence.id));
  });

  it("uses only synthetic identifiers in fixtures, with no real CIG or CUP tokens", () => {
    for (const evidence of fixtures) {
      expect(evidence.identifier ?? "").not.toMatch(FORMAL_CIG_LIKE_TOKEN);
      expect(evidence.identifier ?? "").not.toMatch(FORMAL_CUP_LIKE_TOKEN);
    }
  });
});
