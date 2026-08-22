import { describe, expect, it } from "vitest";
import airTrafficMetadata from "../data/generated/lameziaAirTrafficMonthly.metadata.json";
import climateMetadata from "../data/generated/lameziaClimateDaily.metadata.json";
import demographicData from "../data/generated/lameziaDemographicTrend.json";
import foreignResidentsData from "../data/generated/lameziaForeignResidentsAgeSex.json";
import {
  LAMEZIA_OPEN_DATA_SERIES,
  LAMEZIA_OPEN_DATA_SERIES_BY_ID,
  LAMEZIA_OPEN_DATA_SERIES_STATUS_SUMMARY,
} from "../data/lameziaOpenDataSeriesStatus";

describe("Lamezia Open Data monitored series freshness", () => {
  it("publishes exactly five unique source-linked monitored series", () => {
    const ids = LAMEZIA_OPEN_DATA_SERIES.map((series) => series.id);

    expect(LAMEZIA_OPEN_DATA_SERIES_STATUS_SUMMARY).toEqual({
      total: 5,
      automated: 5,
      monitoredDaily: 5,
    });
    expect(new Set(ids).size).toBe(5);

    for (const series of LAMEZIA_OPEN_DATA_SERIES) {
      expect(series.source_url.startsWith("https://")).toBe(true);
      expect(series.automation_status).toBe("active");
      expect(series.monitoring_cadence).toBe("daily");
      expect(["daily", "weekly", "monthly"]).toContain(series.source_cadence);
      expect(series.latest_observation_label).toBeTruthy();
      expect(series.materialised_at).toBeTruthy();
    }
  });

  it("tracks the materialised source observations without freezing updateable dates", () => {
    expect(
      LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-climate-daily")
        ?.latest_observation,
    ).toBe(climateMetadata.latest_data_point);
    expect(
      LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-air-traffic-monthly")
        ?.latest_observation,
    ).toBe(airTrafficMetadata.latest_data_point);
    expect(
      LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-demographic-trend")
        ?.latest_observation,
    ).toBe(String(demographicData.metadata.latest_year));
    expect(
      LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-foreign-residents-age-sex")
        ?.latest_observation,
    ).toBe(String(foreignResidentsData.metadata.latest_year));

    const families = LAMEZIA_OPEN_DATA_SERIES_BY_ID.get(
      "lamezia-families-children",
    );
    expect(families?.latest_observation).toBeNull();
    expect(families?.latest_observation_label).toBe("Risorsa corrente");
    expect(families?.latest_observation_note).toContain(
      "non espone un anno di riferimento",
    );
  });

  it("distinguishes source publication cadence from monitoring cadence", () => {
    expect(
      LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-climate-daily")
        ?.source_cadence,
    ).toBe("daily");
    expect(
      LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-air-traffic-monthly")
        ?.source_cadence,
    ).toBe("monthly");
    expect(
      LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-demographic-trend")
        ?.source_cadence,
    ).toBe("weekly");
  });
});
