import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgresql://localhost/lamezia_demographic_rbd_test";

async function helpers() {
  return import("./demographicRbd");
}

describe("ISTAT RBD 2002-2018 contract", () => {
  it("targets only Lamezia totals and all required indicators in one query", async () => {
    const { rbdCombinedSeriesKey, rbdSdmxUrl } = await helpers();
    expect(rbdCombinedSeriesKey()).toBe(
      "A.079160.LBIRTH+DEATH+REGM+DEREGM+REGOTHC+DEREGOTHC+JAN+DEC.TOTAL.9.TOTAL",
    );
    expect(rbdSdmxUrl()).toContain(
      "IT1,164_164_DF_DCIS_RICPOPRES2011_21,1.0/A.079160.LBIRTH+DEATH+REGM+DEREGM+REGOTHC+DEREGOTHC+JAN+DEC.TOTAL.9.TOTAL",
    );
    expect(rbdSdmxUrl()).toContain("startPeriod=2002");
    expect(rbdSdmxUrl()).toContain("endPeriod=2018");
  });

  it("maps all eight accounting fields used by change drivers", async () => {
    const { RBD_FIELDS } = await helpers();
    expect(RBD_FIELDS.map((field) => [field.field, field.dataType])).toEqual([
      ["births", "LBIRTH"],
      ["deaths", "DEATH"],
      ["internalIn", "REGM"],
      ["internalOut", "DEREGM"],
      ["foreignIn", "REGOTHC"],
      ["foreignOut", "DEREGOTHC"],
      ["populationStart", "JAN"],
      ["populationEnd", "DEC"],
    ]);
  });

  it("separates DATA_TYPE, excludes partial 2001 and marks reconstructed provenance", async () => {
    const { parseRbdCsv } = await helpers();
    const csv = [
      "FREQ,REF_AREA,DATA_TYPE,AGE,SEX,CITIZENSHIP,TIME_PERIOD,OBS_VALUE,OBS_STATUS",
      "A,079160,LBIRTH,TOTAL,9,TOTAL,2001,120,",
      "A,079160,LBIRTH,TOTAL,9,TOTAL,2002,500,",
      "A,079160,DEATH,TOTAL,9,TOTAL,2002,620,E",
      "A,079160,JAN,TOTAL,9,TOTAL,2002,70466,",
      "A,079160,LBIRTH,TOTAL,9,TOTAL,2018,410,",
      "A,079160,ACQCITIZ,TOTAL,9,TOTAL,2018,90,",
    ].join("\n");

    expect(parseRbdCsv(csv)).toEqual([
      expect.objectContaining({
        dataType: "DEATH",
        period: "2002",
        value: 620,
        qualityFlags: ["source_reconstructed", "source_estimate"],
      }),
      expect.objectContaining({
        dataType: "JAN",
        period: "2002",
        value: 70466,
        qualityFlags: ["source_reconstructed"],
      }),
      expect.objectContaining({
        dataType: "LBIRTH",
        period: "2002",
        value: 500,
        qualityFlags: ["source_reconstructed"],
      }),
      expect.objectContaining({
        dataType: "LBIRTH",
        period: "2018",
        value: 410,
        qualityFlags: ["source_reconstructed"],
      }),
    ]);
  });
});
