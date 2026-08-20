import { describe, expect, it } from "vitest";
import {
  LAMEZIA_DEMOGRAPHIC_TREND_DATA,
  LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY,
  getLameziaDemographicTrendRecord,
} from "../data/lameziaDemographicTrend";

describe("Lamezia demographic trend OpenData dataset", () => {
  it("keeps the generated annual series sorted and source traceable", () => {
    const { annual, metadata } = LAMEZIA_DEMOGRAPHIC_TREND_DATA;

    expect(metadata.source).toContain("Comune di Lamezia Terme");
    expect(metadata.organization).toBe("comune-di-lamezia-terme");
    expect(metadata.holder_identifier).toBe("c_m208");
    expect(metadata.license_title).toContain("CC BY 4.0");
    expect(metadata.source_csv_url).toContain("trend-demografico.csv");
    expect(metadata.resource_hash).toBe("15aaa8c88d15673f80c166d68e0f58b8");
    expect(metadata.resource_last_modified).toBe("2026-08-14T16:07:25.000Z");
    expect(metadata.first_year).toBe(2001);
    expect(metadata.latest_year).toBe(2025);
    expect(annual).toHaveLength(25);
    expect(metadata.rows).toBe(annual.length);

    const years = annual.map((record) => record.year);
    expect([...years].sort((a, b) => a - b)).toEqual(years);
    expect(new Set(years).size).toBe(years.length);
  });

  it("matches the latest municipal CSV values and derived deltas", () => {
    expect(getLameziaDemographicTrendRecord(2025)).toMatchObject({
      index: 25,
      year: 2025,
      population_resident: 68406,
      delta_abs: -318,
      delta_pct: -0.0046,
    });
    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.peak).toMatchObject({
      year: 2017,
      population_resident: 70603,
    });
    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.change_since_peak_abs).toBe(-2197);
    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.change_since_first_abs).toBe(2572);
  });
});
