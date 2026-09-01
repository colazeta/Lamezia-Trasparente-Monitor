import { describe, expect, it } from "vitest";
import {
  LAMEZIA_AIR_TRAFFIC_DATA,
  getLameziaAirTrafficYearComparison,
} from "../data/lameziaAirTraffic";

describe("Lamezia air traffic monthly OpenData dataset", () => {
  it("keeps the generated monthly series sorted and source traceable", () => {
    const { metadata, monthly } = LAMEZIA_AIR_TRAFFIC_DATA;

    expect(metadata.source).toContain("Assaeroporti");
    expect(metadata.first_month).toBe("2000-01");
    expect(metadata.latest_complete_month).toBe(monthly.at(-1)?.month);
    expect(monthly[0]?.month).toBe(metadata.first_month);
    expect(monthly).toHaveLength(metadata.months);
    expect(metadata.source_file_url_template).toContain("download-export");

    const months = monthly.map((record) => record.month);
    expect([...months].sort()).toEqual(months);
    expect(new Set(months).size).toBe(months.length);
    expect(metadata.source_periods).toEqual(months);
    const [firstYear, firstMonth] = metadata.first_month.split("-").map(Number);
    const [lastYear, lastMonth] = metadata.latest_complete_month
      .split("-")
      .map(Number);
    expect(monthly).toHaveLength(
      (lastYear - firstYear) * 12 + lastMonth - firstMonth + 1,
    );
  });

  it("preserves the reviewed June 2026 Assaeroporti row as the series grows", () => {
    const june = LAMEZIA_AIR_TRAFFIC_DATA.monthly.find(
      (record) => record.month === "2026-06",
    );

    expect(june).toMatchObject({
      month: "2026-06",
      rank: 19,
      movements: {
        total: 2912,
        total_yoy_pct: 0.102,
      },
      passengers: {
        national: 215166,
        international: 173031,
        direct_transits: 1396,
        total: 389703,
        total_yoy_pct: 0.221,
      },
      cargo_tons: {
        total: 94.7,
        total_yoy_pct: -0.305,
      },
    });
    const firstHalf = LAMEZIA_AIR_TRAFFIC_DATA.monthly.filter(
      (record) => record.year === 2026 && record.month_number <= 6,
    );
    expect(firstHalf).toHaveLength(6);
    expect(
      firstHalf.reduce(
        (sum, record) => sum + (record.passengers.total ?? 0),
        0,
      ),
    ).toBe(1534874);
    expect(
      firstHalf.reduce((sum, record) => sum + (record.movements.total ?? 0), 0),
    ).toBe(12061);
    expect(
      firstHalf.reduce(
        (sum, record) => sum + (record.cargo_tons.total ?? 0),
        0,
      ),
    ).toBeCloseTo(550.6, 1);
  });

  it("reconciles annual summaries with all available months, including new releases", () => {
    const { monthly, annual } = LAMEZIA_AIR_TRAFFIC_DATA;
    expect(annual.map((record) => record.year)).toEqual([
      ...new Set(monthly.map((record) => record.year)),
    ]);
    for (const summary of annual) {
      const records = monthly.filter((record) => record.year === summary.year);
      expect(summary.months).toBe(records.length);
      expect(summary.latest_month).toBe(records.at(-1)?.month);
      expect(summary.passengers_total).toBe(
        records.reduce(
          (sum, record) => sum + (record.passengers.total ?? 0),
          0,
        ),
      );
      expect(summary.movements_total).toBe(
        records.reduce((sum, record) => sum + (record.movements.total ?? 0), 0),
      );
      expect(summary.cargo_tons_total).toBe(
        Number(
          records
            .reduce((sum, record) => sum + (record.cargo_tons.total ?? 0), 0)
            .toFixed(1),
        ),
      );
    }
  });

  it("compares a partial year only with the same months of the previous year", () => {
    expect(getLameziaAirTrafficYearComparison(2026)).toMatchObject({
      year: 2026,
      previous_year: 2025,
      months: 7,
      latest_month: "2026-07",
      passengers_total: 1961184,
      previous_passengers_total: 1721353,
      passengers_yoy_pct: 0.1393,
      movements_total: 15412,
      previous_movements_total: 15082,
      movements_yoy_pct: 0.0219,
      cargo_tons_total: 655.2,
      previous_cargo_tons_total: 893.2,
      cargo_tons_yoy_pct: -0.2664,
    });
  });

  it("does not invent a comparison before the beginning of the series", () => {
    expect(getLameziaAirTrafficYearComparison(2000)).toBeNull();
  });
});
