import { describe, expect, it } from "vitest";
import { LAMEZIA_AIR_TRAFFIC_DATA } from "../data/lameziaAirTraffic";

describe("Lamezia air traffic monthly OpenData dataset", () => {
  it("keeps the generated monthly series sorted and source traceable", () => {
    const { metadata, monthly } = LAMEZIA_AIR_TRAFFIC_DATA;

    expect(metadata.source).toContain("Assaeroporti");
    expect(metadata.first_month).toBe("2000-01");
    expect(metadata.latest_complete_month).toBe("2026-05");
    expect(monthly).toHaveLength(317);
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
      month: "2026-05",
      rank: 19,
      movements: {
        total: 2448,
        total_yoy_pct: 0.026,
      },
      passengers: {
        total: 321679,
        total_yoy_pct: 0.139,
      },
      cargo_tons: {
        total: 109.705,
        total_yoy_pct: -0.178,
      },
    });
    expect(latestAnnual).toMatchObject({
      year: 2026,
      months: 5,
      passengers_total: 1145171,
      movements_total: 9149,
      cargo_tons_total: 455.9,
    });
  });
});
