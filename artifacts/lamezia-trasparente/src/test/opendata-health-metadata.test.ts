import { describe, expect, it } from "vitest";

import airTrafficMetadata from "@/data/generated/lameziaAirTrafficMonthly.metadata.json";
import climate from "@/data/generated/lameziaClimateDaily.json";
import climateMetadata from "@/data/generated/lameziaClimateDaily.metadata.json";
import { LAMEZIA_AIR_TRAFFIC_DATA } from "@/data/lameziaAirTraffic";

describe("Open Data source-health sidecars", () => {
  it("keeps the climate sidecar aligned with the generated dataset", () => {
    expect(climateMetadata).toMatchObject({
      dataset_id: "lamezia-climate-daily",
      source: climate.metadata.source,
      source_url: climate.metadata.source_url,
      generated_at: climate.metadata.generated_at,
      latest_data_point: climate.metadata.latest_complete_date,
      record_count: climate.daily.length,
      update_policy: climate.metadata.update_policy,
      caveat: climate.metadata.caveat,
      licence_or_terms_note: climate.metadata.licence_or_terms_note,
    });
  });

  it("keeps the air-traffic sidecar aligned with the merged public dataset", () => {
    const { metadata, monthly } = LAMEZIA_AIR_TRAFFIC_DATA;

    expect(airTrafficMetadata).toMatchObject({
      dataset_id: "lamezia-air-traffic-monthly",
      source: metadata.source,
      source_url: metadata.source_url,
      generated_at: metadata.generated_at,
      latest_data_point: metadata.latest_complete_month,
      record_count: monthly.length,
      update_policy: metadata.update_policy,
      caveat: metadata.caveat,
      licence_or_terms_note: metadata.licence_or_terms_note,
    });
  });
});
