import { describe, expect, it } from "vitest";

import type { SpatialLayerDefinition } from "./layerRegistry";
import {
  buildGeoLibreViewerUrl,
  isGeoLibrePilotEnabled,
  resolveSpatialDataUrl,
} from "./geoLibrePilot";

function layer(id: string, dataPath: string): SpatialLayerDefinition {
  return {
    id,
    title: id,
    description: id,
    group: "reference",
    status: "existing",
    atlasStatus: "active",
    geometryTypes: ["Polygon"],
    allowedGeometryRoles: ["administrative_boundary"],
    entityTypes: ["municipality"],
    sourceLabel: "test",
    dataPath,
    defaultVisible: true,
    publicationRule: "test",
    caveats: [],
  };
}

describe("GeoLibre pilot helpers", () => {
  it("enables the pilot only for an explicit true value", () => {
    expect(isGeoLibrePilotEnabled("true")).toBe(true);
    expect(isGeoLibrePilotEnabled(" TRUE ")).toBe(true);
    expect(isGeoLibrePilotEnabled("false")).toBe(false);
    expect(isGeoLibrePilotEnabled(undefined)).toBe(false);
  });

  it("resolves API layers against the configured API origin", () => {
    expect(
      resolveSpatialDataUrl(
        "/api/gis/comune",
        "https://lamezia.example",
        "https://api.lamezia.example",
      ),
    ).toBe("https://api.lamezia.example/api/gis/comune");
  });

  it("resolves static layers against the public site origin", () => {
    expect(
      resolveSpatialDataUrl(
        "/data/processed/territorio/sezioni.geojson",
        "https://lamezia.example",
        "https://api.lamezia.example",
      ),
    ).toBe(
      "https://lamezia.example/data/processed/territorio/sezioni.geojson",
    );
  });

  it("builds a read-only GeoLibre URL with repeated canonical data parameters", () => {
    const url = new URL(
      buildGeoLibreViewerUrl({
        viewerBaseUrl: "https://web.geolibre.app/",
        layers: [
          layer("boundary", "/api/gis/comune"),
          layer("census", "/data/processed/territorio/sezioni.geojson"),
        ],
        siteOrigin: "https://lamezia.example",
        apiBaseUrl: "https://api.lamezia.example",
        theme: "dark",
      }),
    );

    expect(url.origin).toBe("https://web.geolibre.app");
    expect(url.searchParams.get("layout")).toBe("viewer");
    expect(url.searchParams.get("panels")).toBe("collapsed");
    expect(url.searchParams.get("theme")).toBe("dark");
    expect(url.searchParams.getAll("data")).toEqual([
      "https://api.lamezia.example/api/gis/comune",
      "https://lamezia.example/data/processed/territorio/sezioni.geojson",
    ]);
  });
});
