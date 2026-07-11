import { describe, expect, it } from "vitest";

import airTraffic from "@/data/generated/lameziaAirTrafficMonthly.json";
import airTrafficMetadata from "@/data/generated/lameziaAirTrafficMonthly.metadata.json";
import climate from "@/data/generated/lameziaClimateDaily.json";
import climateMetadata from "@/data/generated/lameziaClimateDaily.metadata.json";

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

  it("keeps the air-traffic sidecar aligned with the generated dataset", () => {
    expect(airTrafficMetadata).toMatchObject({
      dataset_id: "lamezia-air-traffic-monthly",
      source: airTraffic.metadata.source,
      source_url: airTraffic.metadata.source_url,
      generated_at: airTraffic.metadata.generated_at,
      latest_data_point: airTraffic.metadata.latest_complete_month,
      record_count: airTraffic.metadata.months,
      update_policy: airTraffic.metadata.update_policy,
      caveat: airTraffic.metadata.caveat,
      licence_or_terms_note: airTraffic.metadata.licence_or_terms_note,
    });
  });
});
