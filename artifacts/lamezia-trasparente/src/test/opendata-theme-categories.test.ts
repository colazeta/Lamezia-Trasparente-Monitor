import { describe, expect, it } from "vitest";
import {
  DEFAULT_OPEN_DATA_THEME_ID,
  OPEN_DATA_THEME_LIBRARY,
  OPEN_DATA_THEME_LIBRARY_SUMMARY,
} from "../data/opendataThemeCategories";

describe("OpenData thematic category library", () => {
  it("keeps stable unique theme identifiers", () => {
    const ids = OPEN_DATA_THEME_LIBRARY.map((theme) => theme.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("climate-territory");
    expect(ids).toContain("mobility-connections");
    expect(ids).toContain("population-society");
    expect(ids).toContain("contracts-spending");
    expect(ids).toContain("administration-acts");
    expect(ids).toContain("assets-confiscated-property");
    expect(ids).toContain("participation-access");
    expect(DEFAULT_OPEN_DATA_THEME_ID).toBe("climate-territory");
  });

  it("documents civic questions, data types and reuse for every theme", () => {
    for (const theme of OPEN_DATA_THEME_LIBRARY) {
      expect(theme.label).toBeTruthy();
      expect(["published", "ready"]).toContain(theme.status);
      expect(theme.civicQuestion).toBeTruthy();
      expect(theme.dataTypes.length).toBeGreaterThan(0);
      expect(theme.civicUses.length).toBeGreaterThan(0);
    }
  });

  it("places published visual datasets inside their thematic categories", () => {
    const published = OPEN_DATA_THEME_LIBRARY.filter(
      (theme) => theme.status === "published",
    );
    const climateTheme = OPEN_DATA_THEME_LIBRARY.find(
      (theme) => theme.id === "climate-territory",
    );
    const mobilityTheme = OPEN_DATA_THEME_LIBRARY.find(
      (theme) => theme.id === "mobility-connections",
    );
    const populationTheme = OPEN_DATA_THEME_LIBRARY.find(
      (theme) => theme.id === "population-society",
    );

    expect(OPEN_DATA_THEME_LIBRARY_SUMMARY.total).toBe(
      OPEN_DATA_THEME_LIBRARY.length,
    );
    expect(OPEN_DATA_THEME_LIBRARY_SUMMARY.published).toBe(published.length);
    expect(climateTheme?.datasets).toHaveLength(1);
    expect(climateTheme?.datasets[0]).toMatchObject({
      id: "lamezia-climate-daily",
      dataType: "Serie temporale giornaliera",
      detailKind: "climate-daily",
    });
    expect(mobilityTheme?.datasets).toHaveLength(1);
    expect(mobilityTheme?.datasets[0]).toMatchObject({
      id: "lamezia-air-traffic-monthly",
      dataType: "Serie temporale mensile",
      detailKind: "air-traffic-monthly",
    });
    expect(populationTheme?.datasets).toHaveLength(2);
    expect(populationTheme?.datasets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "lamezia-demographic-trend",
          dataType: "Serie temporale annuale",
          detailKind: "demographic-trend",
        }),
        expect.objectContaining({
          id: "lamezia-foreign-residents-age-sex",
          dataType: "Distribuzione per classi d'eta",
          detailKind: "foreign-residents-age-sex",
        }),
      ]),
    );
  });
});
