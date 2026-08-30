import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgresql://localhost/lamezia_demographic_rbd_test";

async function helpers() {
  return import("./demographicRbd");
}

describe("ISTAT RBD 2002-2018 contract", () => {
  it("targets only Lamezia totals in the Calabria reconstructed dataflow", async () => {
    const { rbdSeriesKey, rbdSdmxUrl, RBD_FIELDS } = await helpers();
    const births = RBD_FIELDS.find((field) => field.field === "births");
    expect(births).toBeDefined();
    expect(rbdSeriesKey("LBIRTH")).toBe(
      "A.079160.LBIRTH.TOTAL.9.TOTAL",
    );
    expect(rbdSdmxUrl(births!)).toContain(
      "IT1,164_164_DF_DCIS_RICPOPRES2011_21,1.0/A.079160.LBIRTH.TOTAL.9.TOTAL",
    );
    expect(rbdSdmxUrl(births!)).toContain("startPeriod=2002");
    expect(rbdSdmxUrl(births!)).toContain("endPeriod=2018");
  });

  it("maps all eight accounting fields used by change drivers", async () => {
    const { RBD_FIELDS } = await helpers();
    expect(RBD_FIELDS.map((field) => field.field)).toEqual([
      "births",
      "deaths",
      "internalIn",
      "internalOut",
      "foreignIn",
      "foreignOut",
      "populationStart",
      "populationEnd",
    ]);
  });

  it("excludes the partial 2001 period and forces reconstructed provenance", async () => {
    const { normaliseRbdCsv } = await helpers();
    const csv = [
      "FREQ,REF_AREA,DATA_TYPE,AGE,SEX,CITIZENSHIP,TIME_PERIOD,OBS_VALUE,OBS_STATUS",
      "A,079160,LBIRTH,TOTAL,9,TOTAL,2001,120,",
      "A,079160,LBIRTH,TOTAL,9,TOTAL,2002,500,",
      "A,079160,LBIRTH,TOTAL,9,TOTAL,2018,410,",
    ].join("\n");

    expect(normaliseRbdCsv(csv)).toEqual([
      expect.objectContaining({
        period: "2002",
        value: 500,
        sourceStatus: "reconstructed",
        qualityFlags: ["source_reconstructed"],
      }),
      expect.objectContaining({
        period: "2018",
        value: 410,
        sourceStatus: "reconstructed",
        qualityFlags: ["source_reconstructed"],
      }),
    ]);
  });
});
