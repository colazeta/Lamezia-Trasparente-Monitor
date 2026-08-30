import { describe, expect, it } from "vitest";

// `@workspace/db` valida DATABASE_URL all'import. Questi test non interrogano
// il database, ma importano lo stesso modulo dell'ingestione per testarne i
// parser; un URL sintatticamente valido evita di trasformare test puri in una
// dipendenza da un database CI realmente in ascolto.
process.env.DATABASE_URL ??= "postgresql://localhost/lamezia_demographics_test";

async function helpers() {
  return import("./demographics");
}

describe("demographic SDMX parsing", () => {
  it("parses quoted CSV fields without splitting embedded commas", async () => {
    const { parseCsvRow } = await helpers();
    expect(parseCsvRow('2025,68200,"Lamezia, Terme",e')).toEqual([
      "2025",
      "68200",
      "Lamezia, Terme",
      "e",
    ]);
  });

  it("maps explicit estimate and provisional statuses", async () => {
    const { mapSdmxStatus } = await helpers();
    expect(mapSdmxStatus("e", "final")).toEqual({
      status: "estimated",
      qualityFlags: ["source_estimate"],
    });
    expect(mapSdmxStatus("P", "final")).toEqual({
      status: "provisional",
      qualityFlags: ["source_provisional"],
    });
    expect(mapSdmxStatus(null, "final")).toEqual({
      status: "final",
      qualityFlags: [],
    });
  });

  it("extracts period, value and OBS_STATUS from an SDMX CSV", async () => {
    const { parseSdmxCsv } = await helpers();
    const csv = [
      "TIME_PERIOD,OBS_VALUE,OBS_STATUS",
      "2024,68000,",
      "2025,67500,e",
    ].join("\n");

    expect(parseSdmxCsv(csv, "final")).toEqual([
      {
        period: "2024",
        value: 68000,
        rawStatus: null,
        sourceStatus: "final",
        qualityFlags: [],
      },
      {
        period: "2025",
        value: 67500,
        rawStatus: "e",
        sourceStatus: "estimated",
        qualityFlags: ["source_estimate"],
      },
    ]);
  });
});

describe("demographic versioning helpers", () => {
  it("canonicalises dimensions independent of input order", async () => {
    const { canonicalDimensionKey } = await helpers();
    expect(canonicalDimensionKey({ sex: "T", age: "TOTAL" })).toBe(
      '{"age":"TOTAL","sex":"T"}',
    );
  });

  it("selects the most recently encountered release for each period", async () => {
    const { selectCurrentPoints } = await helpers();
    const older = new Date("2026-03-01T00:00:00Z");
    const newer = new Date("2026-07-01T00:00:00Z");

    const current = selectCurrentPoints([
      {
        period: "2024",
        value: 68000,
        sourceStatus: "final",
        sourceObservationStatus: null,
        releaseId: 1,
        acquiredAt: older,
      },
      {
        period: "2025",
        value: 67550,
        sourceStatus: "provisional",
        sourceObservationStatus: "p",
        releaseId: 1,
        acquiredAt: older,
      },
      {
        period: "2025",
        value: 67520,
        sourceStatus: "final",
        sourceObservationStatus: null,
        releaseId: 2,
        acquiredAt: newer,
      },
    ]);

    expect(current.map((point) => [point.period, point.value, point.releaseId])).toEqual([
      ["2024", 68000, 1],
      ["2025", 67520, 2],
    ]);
  });
});
