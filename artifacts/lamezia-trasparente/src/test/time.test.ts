import { describe, expect, it } from "vitest";

import { formatPublicTimeField } from "@/lib/time";

function withTimezone<T>(timezone: string, callback: () => T): T {
  const originalTimezone = process.env.TZ;
  process.env.TZ = timezone;

  try {
    return callback();
  } finally {
    if (originalTimezone === undefined) {
      delete process.env.TZ;
    } else {
      process.env.TZ = originalTimezone;
    }
  }
}

describe("formatPublicTimeField", () => {
  it("renders date-only inputs as civil dates instead of UTC instants", () => {
    withTimezone("America/New_York", () => {
      expect(formatPublicTimeField("2026-06-08")).toBe("08 giu 2026");
    });
  });

  it("renders timestamps with an explicit public timestamp pattern", () => {
    withTimezone("UTC", () => {
      expect(
        formatPublicTimeField(
          "2026-06-08T06:20:00.000Z",
          "dd MMM yyyy, HH:mm",
        ),
      ).toBe("08 giu 2026, 06:20");
    });
  });

  it("normalizes absent or invalid values to the existing placeholder", () => {
    expect(formatPublicTimeField(null)).toBe("â€”");
    expect(formatPublicTimeField(undefined)).toBe("â€”");
    expect(formatPublicTimeField("non-una-data")).toBe("â€”");
    expect(formatPublicTimeField("2026-02-31")).toBe("â€”");
  });
});
