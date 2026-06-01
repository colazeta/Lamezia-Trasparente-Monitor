import { describe, it, expect } from "vitest";
import type { PerformanceIndicatorValue } from "@workspace/api-client-react";
import {
  buildComparisonSeries,
  RAW_SUFFIX,
} from "@/lib/performanceFormat";

function val(period: string, value: number): PerformanceIndicatorValue {
  return {
    id: Math.random(),
    indicatorId: 1,
    period,
    value,
    note: null,
    manual: true,
    source: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

describe("buildComparisonSeries", () => {
  it("merges series on a sorted common time axis", () => {
    const rows = buildComparisonSeries(
      [
        { key: "a", values: [val("2021", 10), val("2023", 30)] },
        { key: "b", values: [val("2022", 200), val("2023", 400)] },
      ],
      "absolute",
    );
    expect(rows.map((r) => r.period)).toEqual(["2021", "2022", "2023"]);
    // absolute mode keeps raw values
    expect(rows[0].a).toBe(10);
    expect(rows[2].a).toBe(30);
    expect(rows[1].b).toBe(200);
  });

  it("leaves missing periods as null so lines can be connected", () => {
    const rows = buildComparisonSeries(
      [
        { key: "a", values: [val("2021", 10)] },
        { key: "b", values: [val("2022", 200)] },
      ],
      "absolute",
    );
    const y2021 = rows.find((r) => r.period === "2021")!;
    const y2022 = rows.find((r) => r.period === "2022")!;
    expect(y2021.b).toBeNull();
    expect(y2022.a).toBeNull();
  });

  it("normalizes each series to 100 at its first non-zero value", () => {
    const rows = buildComparisonSeries(
      [
        { key: "a", values: [val("2021", 50), val("2022", 75)] },
        { key: "b", values: [val("2021", 200), val("2022", 100)] },
      ],
      "normalized",
    );
    const y2021 = rows.find((r) => r.period === "2021")!;
    const y2022 = rows.find((r) => r.period === "2022")!;
    expect(y2021.a).toBe(100);
    expect(y2021.b).toBe(100);
    expect(y2022.a).toBe(150); // 75 / 50 * 100
    expect(y2022.b).toBe(50); // 100 / 200 * 100
    // raw values are preserved alongside the normalized ones
    expect(y2022[`a${RAW_SUFFIX}`]).toBe(75);
    expect(y2022[`b${RAW_SUFFIX}`]).toBe(100);
  });

  it("falls back gracefully when the first value is zero", () => {
    const rows = buildComparisonSeries(
      [{ key: "a", values: [val("2021", 0), val("2022", 20)] }],
      "normalized",
    );
    // base picks the first non-zero value (20), so 2022 indexes to 100
    expect(rows.find((r) => r.period === "2022")!.a).toBe(100);
    expect(rows.find((r) => r.period === "2021")!.a).toBe(0);
  });
});
