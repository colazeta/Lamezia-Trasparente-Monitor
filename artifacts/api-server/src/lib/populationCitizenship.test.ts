import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgresql://localhost/lamezia_demographics_test";

async function helpers() {
  return import("./populationCitizenship");
}

describe("population citizenship SDMX contract", () => {
  it("targets only Lamezia in the three verified dimension orders", async () => {
    const {
      currentForeignStructureSdmxKey,
      reconstructedForeignStructureSdmxKey,
      currentCitizenshipCountriesSdmxKey,
    } = await helpers();

    expect(currentForeignStructureSdmxKey()).toBe("A.079160.JAN.1+2+9.");
    expect(reconstructedForeignStructureSdmxKey()).toBe(
      "A.079160.JAN..1+2+9.FRG",
    );
    expect(currentCitizenshipCountriesSdmxKey()).toBe(
      "A.079160.FJAN.1+2+9.",
    );
  });

  it("parses current foreign age-sex rows without mixing another municipality", async () => {
    const { parseForeignStructureCsv } = await helpers();
    const csv = [
      "FREQ,REF_AREA,DATA_TYPE,SEX,AGE,TIME_PERIOD,OBS_VALUE,OBS_STATUS",
      "A,079160,JAN,1,Y0,2025,50,",
      "A,079160,JAN,2,Y0,2025,45,",
      "A,079160,JAN,9,Y0,2025,95,",
      "A,078001,JAN,9,Y0,2025,10,",
    ].join("\n");

    const rows = parseForeignStructureCsv(csv, "current");
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ period: "2025", age: "0" });
    expect(rows.every((row) => row.sourceStatus === "final")).toBe(true);
  });

  it("keeps only FRG and reconstructed years in the historical source", async () => {
    const { parseForeignStructureCsv } = await helpers();
    const csv = [
      "FREQ,REF_AREA,DATA_TYPE,AGE,SEX,CITIZENSHIP,TIME_PERIOD,OBS_VALUE,OBS_STATUS",
      "A,079160,JAN,Y0,1,FRG,2018,40,",
      "A,079160,JAN,Y0,2,FRG,2018,35,",
      "A,079160,JAN,Y0,9,FRG,2018,75,",
      "A,079160,JAN,Y0,9,TOTAL,2018,600,",
      "A,079160,JAN,Y0,9,FRG,2019,80,",
    ].join("\n");

    const rows = parseForeignStructureCsv(csv, "reconstructed");
    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.period === "2018")).toBe(true);
    expect(rows.every((row) => row.sourceStatus === "reconstructed")).toBe(true);
    expect(rows[0].qualityFlags).toContain("source_reconstructed");
  });

  it("parses country citizenship separately from geopolitical aggregations", async () => {
    const { parseCitizenshipCountriesCsv, countryName } = await helpers();
    const csv = [
      "FREQ,REF_AREA,DATA_TYPE,SEX,CITIZENSHIP,TIME_PERIOD,OBS_VALUE,OBS_STATUS",
      "A,079160,FJAN,1,RO,2024,500,",
      "A,079160,FJAN,2,RO,2024,600,",
      "A,079160,FJAN,9,RO,2024,1100,",
      "A,079160,FJAN,9,AFR_N,2024,700,",
    ].join("\n");

    const rows = parseCitizenshipCountriesCsv(csv);
    expect(rows).toHaveLength(4);
    expect(rows.find((row) => row.citizenship === "RO")).toBeDefined();
    expect(countryName("RO")).toMatch(/Roman/i);
    expect(countryName("AFR_N")).toBeNull();
    expect(countryName("EU")).toBeNull();
  });
});
