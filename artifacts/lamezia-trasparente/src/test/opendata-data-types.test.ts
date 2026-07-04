import { describe, expect, it } from "vitest";
import {
  OPEN_DATA_TYPE_LIBRARY,
  OPEN_DATA_TYPE_LIBRARY_SUMMARY,
} from "../data/opendataDataTypes";

describe("OpenData data type library", () => {
  it("keeps stable unique type identifiers", () => {
    const ids = OPEN_DATA_TYPE_LIBRARY.map((type) => type.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("daily-time-series");
    expect(ids).toContain("tabular-registers");
    expect(ids).toContain("territorial-layers");
    expect(ids).toContain("civic-indicators");
  });

  it("documents status, formats, metadata and civic reuse for every type", () => {
    for (const type of OPEN_DATA_TYPE_LIBRARY) {
      expect(type.label).toBeTruthy();
      expect(["published", "ready"]).toContain(type.status);
      expect(type.formats.length).toBeGreaterThan(0);
      expect(type.requiredMetadata.length).toBeGreaterThan(0);
      expect(type.civicUses.length).toBeGreaterThan(0);
      expect(type.updateCadence).toBeTruthy();
    }
  });

  it("marks the climate daily series as the first published OpenData type", () => {
    const published = OPEN_DATA_TYPE_LIBRARY.filter(
      (type) => type.status === "published",
    );

    expect(OPEN_DATA_TYPE_LIBRARY_SUMMARY.total).toBe(
      OPEN_DATA_TYPE_LIBRARY.length,
    );
    expect(OPEN_DATA_TYPE_LIBRARY_SUMMARY.published).toBe(published.length);
    expect(published).toHaveLength(1);
    expect(published[0]).toMatchObject({
      id: "daily-time-series",
      currentSurface: "Clima e territorio",
      href: "#clima-territorio",
    });
  });
});
