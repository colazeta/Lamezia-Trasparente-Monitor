import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ??= "postgresql://localhost/lamezia_demographics_test";

async function helpers() {
  return import("./populationStructure");
}

describe("population structure SDMX contract", () => {
  it("uses the current and reconstructed dimension orders without expanding other municipalities", async () => {
    const {
      currentStructureSdmxKey,
      reconstructedStructureSdmxKey,
    } = await helpers();

    expect(currentStructureSdmxKey()).toBe("A.079160.JAN.1+2+9..99");
    expect(reconstructedStructureSdmxKey()).toBe(
      "A.079160.JAN..1+2+9.TOTAL",
    );
  });

  it("normalises single ages, the open 100+ class and sex codes", async () => {
    const { parseStructureAge, parseStructureSex } = await helpers();

    expect(parseStructureAge("Y0")).toBe("0");
    expect(parseStructureAge("Y99")).toBe("99");
    expect(parseStructureAge("Y_GE100")).toBe("100+");
    expect(parseStructureAge("TOTAL")).toBe("TOTAL");
    expect(parseStructureSex("1")).toBe("male");
    expect(parseStructureSex("2")).toBe("female");
    expect(parseStructureSex("9")).toBe("total");
  });

  it("keeps current estimate status and filters civil-status-specific rows", async () => {
    const { parsePopulationStructureCsv } = await helpers();
    const csv = [
      "FREQ,REF_AREA,DATA_TYPE,SEX,AGE,MARITAL_STATUS,TIME_PERIOD,OBS_VALUE,OBS_STATUS",
      "A,079160,JAN,1,Y0,99,2026,250,e",
      "A,079160,JAN,2,Y0,99,2026,240,e",
      "A,079160,JAN,9,Y0,99,2026,490,e",
      "A,079160,JAN,9,Y0,1,2026,480,e",
    ].join("\n");

    const parsed = parsePopulationStructureCsv(csv, "current");
    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toMatchObject({
      period: "2026",
      age: "0",
      sourceStatus: "estimated",
      qualityFlags: ["source_estimate"],
    });
  });

  it("marks historical observations reconstructed and excludes the 2019 overlap", async () => {
    const { parsePopulationStructureCsv } = await helpers();
    const csv = [
      "FREQ,REF_AREA,DATA_TYPE,AGE,SEX,CITIZENSHIP,TIME_PERIOD,OBS_VALUE,OBS_STATUS",
      "A,079160,JAN,Y0,1,TOTAL,2018,300,",
      "A,079160,JAN,Y0,2,TOTAL,2018,290,",
      "A,079160,JAN,Y0,9,TOTAL,2018,590,",
      "A,079160,JAN,Y0,9,ITL,2018,550,",
      "A,079160,JAN,Y0,9,TOTAL,2019,580,",
    ].join("\n");

    const parsed = parsePopulationStructureCsv(csv, "reconstructed");
    expect(parsed).toHaveLength(3);
    expect(parsed.every((point) => point.period === "2018")).toBe(true);
    expect(parsed.every((point) => point.sourceStatus === "reconstructed")).toBe(
      true,
    );
    expect(parsed[0].qualityFlags).toContain("source_reconstructed");
  });
});

describe("population structure indicators", () => {
  it("derives exact age bands, dependency ratios and a five-year pyramid", async () => {
    const { summarizePopulationStructure } = await helpers();
    const rows = [] as Array<{
      period: string;
      age: `${number}` | "100+" | "TOTAL";
      sex: "male" | "female" | "total";
      value: number;
      sourceStatus: "final";
      rawStatus: null;
      qualityFlags: string[];
    }>;

    let maleTotal = 0;
    let femaleTotal = 0;
    for (let age = 0; age <= 99; age++) {
      const male = age < 15 ? 10 : age < 65 ? 20 : 15;
      const female = age < 15 ? 10 : age < 65 ? 20 : 25;
      maleTotal += male;
      femaleTotal += female;
      rows.push(
        {
          period: "2025",
          age: String(age) as `${number}`,
          sex: "male",
          value: male,
          sourceStatus: "final",
          rawStatus: null,
          qualityFlags: [],
        },
        {
          period: "2025",
          age: String(age) as `${number}`,
          sex: "female",
          value: female,
          sourceStatus: "final",
          rawStatus: null,
          qualityFlags: [],
        },
        {
          period: "2025",
          age: String(age) as `${number}`,
          sex: "total",
          value: male + female,
          sourceStatus: "final",
          rawStatus: null,
          qualityFlags: [],
        },
      );
    }
    rows.push(
      {
        period: "2025",
        age: "100+",
        sex: "male",
        value: 5,
        sourceStatus: "final",
        rawStatus: null,
        qualityFlags: [],
      },
      {
        period: "2025",
        age: "100+",
        sex: "female",
        value: 15,
        sourceStatus: "final",
        rawStatus: null,
        qualityFlags: [],
      },
      {
        period: "2025",
        age: "100+",
        sex: "total",
        value: 20,
        sourceStatus: "final",
        rawStatus: null,
        qualityFlags: [],
      },
    );
    maleTotal += 5;
    femaleTotal += 15;
    rows.push(
      {
        period: "2025",
        age: "TOTAL",
        sex: "male",
        value: maleTotal,
        sourceStatus: "final",
        rawStatus: null,
        qualityFlags: [],
      },
      {
        period: "2025",
        age: "TOTAL",
        sex: "female",
        value: femaleTotal,
        sourceStatus: "final",
        rawStatus: null,
        qualityFlags: [],
      },
      {
        period: "2025",
        age: "TOTAL",
        sex: "total",
        value: maleTotal + femaleTotal,
        sourceStatus: "final",
        rawStatus: null,
        qualityFlags: [],
      },
    );

    const snapshot = summarizePopulationStructure(rows, "2025");
    const band = (key: string) => snapshot.bands.find((item) => item.key === key)!;

    expect(snapshot.counts.total).toBe(maleTotal + femaleTotal);
    expect(band("0-14").count).toBe(300);
    expect(band("15-64").count).toBe(2000);
    expect(band("65+").count).toBe(1420);
    expect(band("80+").count).toBe(820);
    expect(snapshot.indicators.ageingIndex).toBeCloseTo((1420 / 300) * 100, 1);
    expect(snapshot.indicators.structuralDependency).toBeCloseTo(
      ((300 + 1420) / 2000) * 100,
      1,
    );
    expect(snapshot.pyramid).toHaveLength(21);
    expect(snapshot.pyramid[0]).toMatchObject({ ageGroup: "0–4", male: 50, female: 50 });
    expect(snapshot.pyramid.at(-1)).toMatchObject({ ageGroup: "100+", male: 5, female: 15 });
    expect(snapshot.quality).toMatchObject({
      exactSexReconciliation: true,
      exactAgeReconciliation: true,
    });
  });
});
