import { describe, expect, it } from "vitest";
import {
  formatPublicCount,
  formatPublicEuro,
  formatPublicNumber,
  formatPublicPercentage,
  PUBLIC_NUMBER_PLACEHOLDER,
} from "@/lib/publicNumbers";

describe("public number formatting", () => {
  it("preserves zero as a real public value", () => {
    expect(formatPublicNumber(0)).toBe("0");
    expect(formatPublicCount(0)).toBe("0");
    expect(formatPublicPercentage(0)).toBe("0%");
    expect(formatPublicEuro(0)).toBe("0,00 €");
  });

  it("formats decimal numbers with the default Italian locale", () => {
    expect(formatPublicNumber(1234.56, { maximumFractionDigits: 2 })).toBe(
      "1.234,56",
    );
  });

  it("formats public counts without decimal digits", () => {
    expect(formatPublicCount(1234.56)).toBe("1.235");
  });

  it("formats percentage points without treating inputs as fractions", () => {
    expect(formatPublicPercentage(12.34)).toBe("12,3%");
    expect(
      formatPublicPercentage(12.34, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    ).toBe("12,34%");
  });

  it("raises the implicit percentage maximum to the requested minimum", () => {
    expect(formatPublicPercentage(12.34, { minimumFractionDigits: 2 })).toBe(
      "12,34%",
    );
  });

  it("respects an explicit valid percentage maximum", () => {
    expect(formatPublicPercentage(12.345, { maximumFractionDigits: 3 })).toBe(
      "12,345%",
    );
  });

  it("formats euro amounts with deterministic decimals", () => {
    expect(formatPublicEuro(1234.5)).toBe("1.234,50 €");
  });

  it("uses the public placeholder for absent values", () => {
    expect(formatPublicNumber(null)).toBe(PUBLIC_NUMBER_PLACEHOLDER);
    expect(formatPublicNumber(undefined)).toBe(PUBLIC_NUMBER_PLACEHOLDER);
    expect(formatPublicPercentage(null)).toBe(PUBLIC_NUMBER_PLACEHOLDER);
    expect(formatPublicEuro(undefined)).toBe(PUBLIC_NUMBER_PLACEHOLDER);
  });

  it("uses the public placeholder for non-finite values", () => {
    expect(formatPublicNumber(Number.NaN)).toBe(PUBLIC_NUMBER_PLACEHOLDER);
    expect(formatPublicNumber(Number.POSITIVE_INFINITY)).toBe(
      PUBLIC_NUMBER_PLACEHOLDER,
    );
    expect(formatPublicNumber(Number.NEGATIVE_INFINITY)).toBe(
      PUBLIC_NUMBER_PLACEHOLDER,
    );
  });

  it("supports locale and placeholder overrides", () => {
    expect(formatPublicNumber(1234.56, { locale: "en-US" })).toBe("1,234.56");
    expect(formatPublicEuro(1234.5, { locale: "en-US" })).toBe("€1,234.50");
    expect(formatPublicNumber(null, { placeholder: "n/d" })).toBe("n/d");
  });
});
