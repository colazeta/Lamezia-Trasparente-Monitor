import { describe, expect, it } from "vitest";
import {
  parseP02HouseholdPayload,
  summarizeHouseholdHistory,
} from "./populationHouseholdsCore";

function p02Fixture() {
  return JSON.stringify({
    Status: true,
    datatable: {
      columns: [
        { data: "sesso", title: "Sesso" },
        { data: "pop_fam", title: "Popolazione residente in famiglia" },
        { data: "famiglie", title: "Numero di famiglie in totale" },
        {
          data: "famiglie_str",
          title: "Numero di famiglie con almeno uno straniero",
        },
        {
          data: "media",
          title: "Numero medio di componenti per famiglia",
        },
      ],
      data: [
        {
          sesso: "Maschi",
          pop_fam: 32400,
          famiglie: 28600,
          famiglie_str: 2100,
          media: "2,29",
        },
        {
          sesso: "Femmine",
          pop_fam: 33200,
          famiglie: 28600,
          famiglie_str: 2100,
          media: "2,29",
        },
        {
          sesso: "Totale",
          pop_fam: 65600,
          famiglie: 28600,
          famiglie_str: 2100,
          media: "2,29",
        },
      ],
    },
  });
}

describe("populationHouseholds P02 projection", () => {
  it("extracts total households and household population without using foreign-specific columns", () => {
    const point = parseP02HouseholdPayload(p02Fixture(), "2025", "final");
    expect(point).toMatchObject({
      period: "2025",
      households: 28600,
      householdPopulation: 65600,
      sourceStatus: "final",
      publishedAverageHouseholdSize: 2.29,
    });
    expect(point.averageHouseholdSize).toBeCloseTo(2.294, 3);
    expect(point.qualityFlags).toContain("derived_from_p02_release");
  });

  it("inherits provisional status and exposes it as a quality flag", () => {
    const point = parseP02HouseholdPayload(p02Fixture(), "2025", "provisional");
    expect(point.sourceStatus).toBe("provisional");
    expect(point.qualityFlags).toContain("source_provisional");
  });

  it("fails closed when household population is absent instead of estimating it from the published average", () => {
    const payload = JSON.stringify({
      Status: true,
      datatable: {
        columns: [
          { data: "famiglie", title: "Numero di famiglie in totale" },
          { data: "media", title: "Numero medio di componenti per famiglia" },
        ],
        data: [{ famiglie: 100, media: "2,3" }],
      },
    });
    expect(() =>
      parseP02HouseholdPayload(payload, "2025", "final"),
    ).toThrow(/householdPopulation not found/i);
  });

  it("summarizes household change without conflating the dated ISTAT series with families-with-children", () => {
    const points = [
      {
        period: "2020",
        households: 27000,
        householdPopulation: 64800,
        averageHouseholdSize: 2.4,
        publishedAverageHouseholdSize: 2.4,
        sourceStatus: "final" as const,
        qualityFlags: ["derived_from_p02_release"],
      },
      {
        period: "2025",
        households: 28600,
        householdPopulation: 65600,
        averageHouseholdSize: 65600 / 28600,
        publishedAverageHouseholdSize: 2.29,
        sourceStatus: "final" as const,
        qualityFlags: ["derived_from_p02_release"],
      },
    ];
    const totals = new Map([
      ["2020", 67000],
      ["2025", 67500],
    ]);
    const summary = summarizeHouseholdHistory(points, "2025", totals);
    expect(summary?.counts.households).toBe(28600);
    expect(summary?.counts.averageHouseholdSize).toBe(2.29);
    expect(summary?.counts.householdPopulationShare).toBeCloseTo(97.2, 1);
    expect(summary?.changeFromFirst).toMatchObject({
      firstPeriod: "2020",
      householdsAbsolute: 1600,
    });
  });
});
