import { describe, expect, it } from "vitest";
import {
  LAMEZIA_DEMOGRAPHIC_TREND_DATA,
  LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY,
} from "../data/lameziaDemographicTrend";

function roundFour(value: number) {
  return Number(value.toFixed(4));
}

describe("Lamezia demographic trend OpenData dataset", () => {
  it("keeps the generated annual series sorted and source traceable", () => {
    const { annual, metadata } = LAMEZIA_DEMOGRAPHIC_TREND_DATA;

    expect(metadata.source).toContain("Comune di Lamezia Terme");
    expect(metadata.organization).toBe("comune-di-lamezia-terme");
    expect(metadata.holder_identifier).toBe("c_m208");
    expect(metadata.license_title).toContain("CC BY 4.0");
    expect(metadata.source_csv_url).toContain("trend-demografico.csv");
    expect(metadata.resource_hash).toMatch(/^[a-f0-9]{32}$/);

    const resourceModifiedAt = Date.parse(metadata.resource_last_modified);
    const generatedAt = Date.parse(metadata.generated_at);
    expect(Number.isFinite(resourceModifiedAt)).toBe(true);
    expect(Number.isFinite(generatedAt)).toBe(true);
    expect(resourceModifiedAt).toBeLessThanOrEqual(generatedAt);

    expect(annual.length).toBeGreaterThan(0);
    expect(metadata.rows).toBe(annual.length);
    expect(metadata.first_year).toBe(annual[0]?.year);
    expect(metadata.latest_year).toBe(annual[annual.length - 1]?.year);

    const years = annual.map((record) => record.year);
    expect([...years].sort((a, b) => a - b)).toEqual(years);
    expect(new Set(years).size).toBe(years.length);
    expect(annual[0]).toMatchObject({ index: 1, delta_abs: null, delta_pct: null });
  });

  it("keeps every annual delta and summary consistent with the generated records", () => {
    const { annual } = LAMEZIA_DEMOGRAPHIC_TREND_DATA;

    for (let index = 1; index < annual.length; index += 1) {
      const previous = annual[index - 1];
      const current = annual[index];

      expect(current.index).toBe(previous.index + 1);
      expect(current.year).toBe(previous.year + 1);
      expect(current.delta_abs).toBe(
        current.population_resident - previous.population_resident,
      );
      expect(current.delta_pct).toBe(
        roundFour(
          (current.population_resident - previous.population_resident) /
            previous.population_resident,
        ),
      );
    }

    const first = annual[0];
    const latest = annual[annual.length - 1];
    const peak = annual.reduce((best, record) =>
      record.population_resident > best.population_resident ? record : best,
    );
    const minimum = annual.reduce((best, record) =>
      record.population_resident < best.population_resident ? record : best,
    );

    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.first).toEqual(first);
    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.latest).toEqual(latest);
    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.peak).toEqual(peak);
    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.minimum).toEqual(minimum);
    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.change_since_first_abs).toBe(
      latest.population_resident - first.population_resident,
    );
    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.change_since_peak_abs).toBe(
      latest.population_resident - peak.population_resident,
    );
    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.latest_year_delta_abs).toBe(
      latest.delta_abs,
    );
    expect(LAMEZIA_DEMOGRAPHIC_TREND_SUMMARY.latest_year_delta_pct).toBe(
      latest.delta_pct,
    );
  });
});
