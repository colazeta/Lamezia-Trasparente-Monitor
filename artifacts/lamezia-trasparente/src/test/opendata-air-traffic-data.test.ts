import { describe, expect, it } from "vitest";
import { LAMEZIA_AIR_TRAFFIC_DATA } from "../data/lameziaAirTraffic";

describe("Lamezia air traffic monthly OpenData dataset", () => {
  it("keeps the generated monthly series sorted and source traceable", () => {
    const { metadata, monthly } = LAMEZIA_AIR_TRAFFIC_DATA;

    expect(metadata.source).toContain("Assaeroporti");
    expect(metadata.first_month).toBe("2000-01");
    expect(metadata.latest_complete_month).toBe("2026-06");
    expect(monthly).toHaveLength(318);
    expect(metadata.source_periods).toHaveLength(monthly.length);
    expect(metadata.source_file_url_template).toContain("download-export");

    const months = monthly.map((record) => record.month);
    expect([...months].sort()).toEqual(months);
    expect(new Set(months).size).toBe(months.length);
  });

  it("matches the latest Assaeroporti row extracted for Lamezia Terme", () => {
    const latest = LAMEZIA_AIR_TRAFFIC_DATA.monthly.at(-1);
    const latestAnnual = LAMEZIA_AIR_TRAFFIC_DATA.annual.at(-1);

    expect(latest).toMatchObject({
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
    expect(latestAnnual).toMatchObject({
      year: 2026,
      months: 6,
      passengers_total: 1534874,
      movements_total: 12061,
      cargo_tons_total: 550.6,
    });
  });
});
