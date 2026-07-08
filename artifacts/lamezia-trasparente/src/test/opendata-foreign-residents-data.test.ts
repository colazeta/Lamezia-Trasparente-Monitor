import { describe, expect, it } from "vitest";
import {
  LAMEZIA_FOREIGN_RESIDENTS_DATA,
  LAMEZIA_FOREIGN_RESIDENTS_LATEST_YEAR,
  LAMEZIA_FOREIGN_RESIDENTS_SUMMARY,
  getLameziaForeignResidentsAgeRecord,
} from "../data/lameziaForeignResidents";

describe("Lamezia foreign residents OpenData dataset", () => {
  it("keeps the generated age-sex distribution source traceable", () => {
    const { age, metadata } = LAMEZIA_FOREIGN_RESIDENTS_DATA;

    expect(metadata.source).toContain("Comune di Lamezia Terme");
    expect(metadata.organization).toBe("comune-di-lamezia-terme");
    expect(metadata.holder_identifier).toBe("c_m208");
    expect(metadata.license_title).toContain("CC BY 4.0");
    expect(metadata.source_csv_url).toContain("stranieri-per-sesso-ed-eta.csv");
    expect(metadata.latest_year).toBe(2025);
    expect(metadata.rows).toBe(19);
    expect(metadata.rows).toBe(age.length);
    expect(LAMEZIA_FOREIGN_RESIDENTS_LATEST_YEAR).toBe(2025);
  });

  it("matches the latest municipal CSV totals and largest age class", () => {
    expect(LAMEZIA_FOREIGN_RESIDENTS_SUMMARY).toMatchObject({
      total: 6616,
      male: 3826,
      female: 2790,
      children: 926,
      workingAge: 5281,
      senior: 409,
      male_share: 0.5783,
      female_share: 0.4217,
    });
    expect(LAMEZIA_FOREIGN_RESIDENTS_SUMMARY.largest_age_class).toMatchObject({
      age_class: "35-39",
      total: 761,
      share_of_year: 0.115,
    });
    expect(getLameziaForeignResidentsAgeRecord("90 e piu")).toMatchObject({
      year: 2025,
      male: 8,
      female: 3,
      total: 11,
      age_group: "65+",
    });
  });
});
