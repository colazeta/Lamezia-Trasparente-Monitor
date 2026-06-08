import { describe, expect, it } from "vitest";

import { formatPublicTimeField } from "@/lib/time";

describe("formatPublicTimeField", () => {
  it("renders ISO dates with the default public date format", () => {
    expect(formatPublicTimeField("2026-06-08")).toBe("08 giu 2026");
  });

  it("renders timestamps with an explicit public timestamp pattern", () => {
    expect(
      formatPublicTimeField("2026-06-08T06:20:00.000Z", "dd MMM yyyy, HH:mm"),
    ).toBe("08 giu 2026, 06:20");
  });

  it("normalizes absent or invalid values to the existing placeholder", () => {
    expect(formatPublicTimeField(null)).toBe("—");
    expect(formatPublicTimeField(undefined)).toBe("—");
    expect(formatPublicTimeField("non-una-data")).toBe("—");
  });
});
