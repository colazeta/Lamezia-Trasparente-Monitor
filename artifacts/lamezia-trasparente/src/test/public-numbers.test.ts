import { describe, expect, it } from "vitest";

import {
  PUBLIC_NUMBER_PLACEHOLDER,
  formatPublicCount,
  formatPublicEuro,
  formatPublicNumber,
  formatPublicPercentage,
} from "@/lib/publicNumbers";

describe("public number formatting", () => {
  it("preserves zero as a real value", () => {
    expect(formatPublicNumber(0)).toBe("0");
    expect(formatPublicCount(0)).toBe("0");
    expect(formatPublicPercentage(0)).toBe("0%");
    expect(formatPublicEuro(0)).toBe("0,00 €");
  });

  it("formats decimal public numbers with the Italian locale by default", () => {
    expect(formatPublicNumber(1234.56)).toBe("1.234,56");
    expect(formatPublicNumber(1234.567)).toBe("1.234,57");
  });

  it("formats public counts without decimal digits", () => {
    expect(formatPublicCount(1234)).toBe("1.234");
    expect(formatPublicCount(1234.56)).toBe("1.235");
  });

  it("formats percentages expressed as percentage points", () => {
    expect(formatPublicPercentage(12.5)).toBe("12,5%");
    expect(formatPublicPercentage(12.345)).toBe("12,35%");
  });

  it("formats public euro amounts", () => {
    expect(formatPublicEuro(1234.5)).toBe("1.234,50 €");
    expect(formatPublicEuro(1234.567)).toBe("1.234,57 €");
  });

  it("keeps fraction digit options coherent when minimum exceeds the default maximum", () => {
    expect(formatPublicNumber(1234.5, { minimumFractionDigits: 3 })).toBe(
      "1.234,500",
    );
    expect(formatPublicPercentage(12.5, { minimumFractionDigits: 3 })).toBe(
      "12,500%",
    );
    expect(formatPublicEuro(1234.5, { minimumFractionDigits: 3 })).toBe(
      "1.234,500 €",
    );
  });

  it("uses a deterministic placeholder for absent or non-finite values", () => {
    expect(formatPublicNumber(null)).toBe(PUBLIC_NUMBER_PLACEHOLDER);
    expect(formatPublicNumber(undefined)).toBe(PUBLIC_NUMBER_PLACEHOLDER);
    expect(formatPublicNumber(Number.NaN)).toBe(PUBLIC_NUMBER_PLACEHOLDER);
    expect(formatPublicNumber(Number.POSITIVE_INFINITY)).toBe(
      PUBLIC_NUMBER_PLACEHOLDER,
    );
    expect(formatPublicNumber(Number.NEGATIVE_INFINITY)).toBe(
      PUBLIC_NUMBER_PLACEHOLDER,
    );
  });

  it("allows locale and placeholder overrides without runtime integration", () => {
    expect(formatPublicNumber(1234.5, { locale: "en-US" })).toBe("1,234.5");
    expect(formatPublicEuro(null, { placeholder: "n.d." })).toBe("n.d.");
  });
});
