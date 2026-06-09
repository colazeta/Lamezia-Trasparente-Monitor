import { describe, expect, it } from "vitest";

import {
  classifyProcurementIdentifier,
  normalizeCigCandidate,
  normalizeCupCandidate,
} from "../lib/procurementIdentifiers";

describe("procurement identifier normalization", () => {
  it("normalizes CIG candidates by removing whitespace/simple hyphens and uppercasing", () => {
    expect(normalizeCigCandidate(" abcd 1234-ef ")).toBe("ABCD1234EF");
  });

  it("normalizes CUP candidates by removing whitespace/simple hyphens and uppercasing", () => {
    expect(normalizeCupCandidate(" a1b2 c3d4-e5f6 g7h ")).toBe("A1B2C3D4E5F6G7H");
  });

  it("normalizes nullish candidates to an empty value", () => {
    expect(normalizeCigCandidate(null)).toBe("");
    expect(normalizeCupCandidate(undefined)).toBe("");
  });
});

describe("procurement identifier classification", () => {
  it("classifies empty and whitespace input conservatively", () => {
    expect(classifyProcurementIdentifier("")).toEqual({
      original: "",
      normalized: "",
      type: "empty",
      formallyValid: false,
      reason: "empty-input",
    });

    expect(classifyProcurementIdentifier(" \t\n ")).toEqual({
      original: " \t\n ",
      normalized: "",
      type: "empty",
      formallyValid: false,
      reason: "empty-input",
    });
  });

  it("classifies a 10-character alphanumeric token as a formally valid CIG", () => {
    expect(classifyProcurementIdentifier("AB12CD34EF")).toEqual({
      original: "AB12CD34EF",
      normalized: "AB12CD34EF",
      type: "cig",
      formallyValid: true,
      reason: "formal-cig",
    });
  });

  it("classifies lowercase CIG input with spaces or simple hyphens after normalization", () => {
    expect(classifyProcurementIdentifier(" ab12-cd 34ef ")).toEqual({
      original: " ab12-cd 34ef ",
      normalized: "AB12CD34EF",
      type: "cig",
      formallyValid: true,
      reason: "formal-cig",
    });
  });

  it("classifies a 15-character alphanumeric token as a formally valid CUP", () => {
    expect(classifyProcurementIdentifier("A1B2C3D4E5F6G7H")).toEqual({
      original: "A1B2C3D4E5F6G7H",
      normalized: "A1B2C3D4E5F6G7H",
      type: "cup",
      formallyValid: true,
      reason: "formal-cup",
    });
  });

  it("classifies lowercase CUP input with spaces or simple hyphens after normalization", () => {
    expect(classifyProcurementIdentifier(" a1b2 c3d4-e5f6 g7h ")).toEqual({
      original: " a1b2 c3d4-e5f6 g7h ",
      normalized: "A1B2C3D4E5F6G7H",
      type: "cup",
      formallyValid: true,
      reason: "formal-cup",
    });
  });

  it("rejects alphanumeric identifiers with unsupported lengths", () => {
    expect(classifyProcurementIdentifier("AB12CD34E")).toEqual({
      original: "AB12CD34E",
      normalized: "AB12CD34E",
      type: "unknown",
      formallyValid: false,
      reason: "unsupported-length",
    });

    expect(classifyProcurementIdentifier("A1B2C3D4E5F6G7H8")).toEqual({
      original: "A1B2C3D4E5F6G7H8",
      normalized: "A1B2C3D4E5F6G7H8",
      type: "unknown",
      formallyValid: false,
      reason: "unsupported-length",
    });
  });

  it("rejects characters outside alphanumeric tokens and simple separators", () => {
    expect(classifyProcurementIdentifier("AB12_CD34EF")).toEqual({
      original: "AB12_CD34EF",
      normalized: "AB12_CD34EF",
      type: "unknown",
      formallyValid: false,
      reason: "invalid-characters",
    });
  });

  it("handles separator-only input as empty rather than inferring an identifier", () => {
    expect(classifyProcurementIdentifier(" - -- ")).toEqual({
      original: " - -- ",
      normalized: "",
      type: "empty",
      formallyValid: false,
      reason: "empty-input",
    });
  });

  it("keeps ambiguous unsupported formats unknown without substantial interpretation", () => {
    expect(classifyProcurementIdentifier("ABCDEF123456")).toMatchObject({
      original: "ABCDEF123456",
      normalized: "ABCDEF123456",
      type: "unknown",
      formallyValid: false,
      reason: "unsupported-length",
    });
  });
});
