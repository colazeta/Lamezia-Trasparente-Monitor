import { describe, expect, it } from "vitest";
import {
  canonicalDimensionKey,
  mapSdmxStatus,
  parseCsvRow,
  parseSdmxCsv,
  selectCurrentPoints,
} from "./demographics";

describe("demographic SDMX parsing", () => {
  it("parses quoted CSV fields without splitting embedded commas", () => {
    expect(parseCsvRow('2025,68200,"Lamezia, Terme",e')).toEqual([
      "2025",
      "68200",
      "Lamezia, Terme",
      "e",
    ]);
  });

  it("maps explicit estimate and provisional statuses", () => {
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

  it("extracts period, value and OBS_STATUS from an SDMX CSV", () => {
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
  it("canonicalises dimensions independent of input order", () => {
    expect(canonicalDimensionKey({ sex: "T", age: "TOTAL" })).toBe(
      '{"age":"TOTAL","sex":"T"}',
    );
  });

  it("selects the most recently encountered release for each period", () => {
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
