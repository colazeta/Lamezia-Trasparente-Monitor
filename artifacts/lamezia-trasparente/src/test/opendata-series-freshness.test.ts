import { describe, expect, it } from "vitest";
import airTrafficMetadata from "../data/generated/lameziaAirTrafficMonthly.metadata.json";
import climateMetadata from "../data/generated/lameziaClimateDaily.metadata.json";
import foreignResidentsData from "../data/generated/lameziaForeignResidentsAgeSex.json";
import {
  LAMEZIA_OPEN_DATA_SERIES,
  LAMEZIA_OPEN_DATA_SERIES_BY_ID,
  LAMEZIA_OPEN_DATA_SERIES_STATUS_SUMMARY,
} from "../data/lameziaOpenDataSeriesStatus";

describe("Lamezia Open Data monitored series freshness", () => {
  it("publishes exactly six unique source-linked documented series", () => {
    const ids = LAMEZIA_OPEN_DATA_SERIES.map((series) => series.id);

    expect(LAMEZIA_OPEN_DATA_SERIES_STATUS_SUMMARY).toEqual({
      total: 6,
      automated: 5,
      monitoredDaily: 5,
    });
    expect(new Set(ids).size).toBe(6);

    for (const series of LAMEZIA_OPEN_DATA_SERIES) {
      expect(series.source_url.startsWith("https://")).toBe(true);
      expect(["active", "manual"]).toContain(series.automation_status);
      expect(["daily", "release-driven"]).toContain(series.monitoring_cadence);
      expect(["daily", "weekly", "monthly", "release-driven"]).toContain(
        series.source_cadence,
      );
      expect(series.latest_observation_label).toBeTruthy();

      if (series.id === "lamezia-demographic-trend") {
        expect(series.materialised_at).toBeNull();
      } else {
        expect(series.materialised_at).toBeTruthy();
      }
    }
  });

  it("tracks static observations without duplicating the canonical demographic period", () => {
    expect(
      LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-climate-daily")
        ?.latest_observation,
    ).toBe(climateMetadata.latest_data_point);
    expect(
      LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-air-traffic-monthly")
        ?.latest_observation,
    ).toBe(airTrafficMetadata.latest_data_point);

    const demographic = LAMEZIA_OPEN_DATA_SERIES_BY_ID.get(
      "lamezia-demographic-trend",
    );
    expect(demographic?.latest_observation).toBeNull();
    expect(demographic?.latest_observation_label).toBe(
      "Serie corrente via API",
    );
    expect(demographic?.latest_observation_note).toContain(
      "API demografica canonica",
    );
    expect(demographic?.source).toContain("ISTAT");

    const householdComposition = LAMEZIA_OPEN_DATA_SERIES_BY_ID.get(
      "lamezia-household-composition-2023",
    );
    expect(householdComposition).toMatchObject({
      latest_observation: "2023",
      latest_observation_label: "2023",
      source_cadence: "release-driven",
      monitoring_cadence: "release-driven",
      automation_status: "manual",
      materialised_at: "2026-09-01T18:11:15.000Z",
    });
    expect(householdComposition?.latest_observation_note).toContain(
      "Fotografia censuaria",
    );

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
    ).toBe("release-driven");
    expect(
      LAMEZIA_OPEN_DATA_SERIES_BY_ID.get("lamezia-household-composition-2023")
        ?.automation_status,
    ).toBe("manual");
  });
});
