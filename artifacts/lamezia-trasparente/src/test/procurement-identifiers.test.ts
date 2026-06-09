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
    expect(normalizeCupCandidate(" h12b 1234-5678 9ab ")).toBe("H12B123456789AB");
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

  it("classifies ordinary CIG values only when the local check digits match", () => {
    expect(classifyProcurementIdentifier("1234567CE7")).toEqual({
      original: "1234567CE7",
      normalized: "1234567CE7",
      type: "cig",
      formallyValid: true,
      reason: "formal-cig",
    });
  });

  it("rejects ordinary CIG values with wrong check digits or all-zero numeric parts", () => {
    expect(classifyProcurementIdentifier("1234567ABC")).toEqual({
      original: "1234567ABC",
      normalized: "1234567ABC",
      type: "cig",
      formallyValid: false,
      reason: "invalid-cig-format",
    });

    expect(classifyProcurementIdentifier("0000000000")).toEqual({
      original: "0000000000",
      normalized: "0000000000",
      type: "cig",
      formallyValid: false,
      reason: "invalid-cig-format",
    });
  });

  it("classifies documented Smart CIG and unified CIG formats", () => {
    for (const value of ["X123456789", "Y123456789", "Z123456789"]) {
      expect(classifyProcurementIdentifier(value)).toMatchObject({
        normalized: value,
        type: "cig",
        formallyValid: true,
        reason: "formal-cig",
      });
    }

    expect(classifyProcurementIdentifier("A12BCD34EF")).toMatchObject({
      normalized: "A12BCD34EF",
      type: "cig",
      formallyValid: true,
      reason: "formal-cig",
    });
  });

  it("rejects Smart CIG values outside the documented X/Y/Z prefix family", () => {
    for (const value of ["V123456789", "W123456789"]) {
      expect(classifyProcurementIdentifier(value)).toEqual({
        original: value,
        normalized: value,
        type: "cig",
        formallyValid: false,
        reason: "invalid-cig-format",
      });
    }
  });

  it("classifies lowercase CIG input with spaces or simple hyphens after normalization", () => {
    expect(classifyProcurementIdentifier(" 1234-567 ce7 ")).toEqual({
      original: " 1234-567 ce7 ",
      normalized: "1234567CE7",
      type: "cig",
      formallyValid: true,
      reason: "formal-cig",
    });
  });

  it("rejects 10-character alphanumeric tokens outside known CIG formats", () => {
    expect(classifyProcurementIdentifier("AB12CD3ßE")).toEqual({
      original: "AB12CD3ßE",
      normalized: "AB12CD3ßE",
      type: "unknown",
      formallyValid: false,
      reason: "invalid-characters",
    });

    expect(classifyProcurementIdentifier("Z12345678G")).toEqual({
      original: "Z12345678G",
      normalized: "Z12345678G",
      type: "cig",
      formallyValid: false,
      reason: "invalid-cig-format",
    });
  });

  it("classifies structured CUP values", () => {
    expect(classifyProcurementIdentifier("H12B123456789AB")).toEqual({
      original: "H12B123456789AB",
      normalized: "H12B123456789AB",
      type: "cup",
      formallyValid: true,
      reason: "formal-cup",
    });
  });

  it("classifies lowercase CUP input with spaces or simple hyphens after normalization", () => {
    expect(classifyProcurementIdentifier(" h12b 1234-5678 9ab ")).toEqual({
      original: " h12b 1234-5678 9ab ",
      normalized: "H12B123456789AB",
      type: "cup",
      formallyValid: true,
      reason: "formal-cup",
    });
  });

  it("rejects 15-character alphanumeric tokens outside the CUP pattern", () => {
    expect(classifyProcurementIdentifier("A1B2C3D4E5F6G7H")).toEqual({
      original: "A1B2C3D4E5F6G7H",
      normalized: "A1B2C3D4E5F6G7H",
      type: "cup",
      formallyValid: false,
      reason: "invalid-cup-format",
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
