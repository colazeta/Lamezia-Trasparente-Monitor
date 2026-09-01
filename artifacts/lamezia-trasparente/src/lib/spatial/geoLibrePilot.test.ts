import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  getActiveAtlasSpatialLayers,
  type SpatialLayerDefinition,
  type SpatialLayerId,
} from "./layerRegistry";
import {
  buildGeoLibreViewerUrl,
  checkGeoLibreLayerAvailability,
  isGeoLibrePilotEnabled,
  resolveSpatialDataUrl,
} from "./geoLibrePilot";

function layer(id: SpatialLayerId, dataPath: string): SpatialLayerDefinition {
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
  it("keeps the reviewed production pilot enabled", () => {
    const productionEnv = readFileSync(
      path.resolve(process.cwd(), ".env.production"),
      "utf8",
    );

    expect(productionEnv).toMatch(/^VITE_ATLAS_GEOLIBRE_ENABLED=true$/m);
  });

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

  it("preserves an API base path prefix", () => {
    expect(
      resolveSpatialDataUrl(
        "/api/gis/comune",
        "https://lamezia.example",
        "https://gateway.example/lamezia-backend",
      ),
    ).toBe("https://gateway.example/lamezia-backend/api/gis/comune");
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
          layer("municipal-boundary", "/api/gis/comune"),
          layer(
            "census-sections",
            "/data/processed/territorio/sezioni.geojson",
          ),
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

  it("passes only reachable GeoJSON feeds to the pilot", async () => {
    const requested: Array<{ method: string | undefined; url: string }> = [];
    const fetcher: typeof fetch = async (input, init) => {
      const url = input instanceof Request ? input.url : String(input);
      requested.push({ method: init?.method, url });

      if (url.endsWith("/api/gis/comune")) {
        return new Response(null, {
          status: 503,
          headers: { "content-type": "application/json" },
        });
      }
      if (url.endsWith("/api/beni-confiscati/geojson")) {
        throw new TypeError("CORS blocked");
      }
      return new Response(null, {
        status: 200,
        headers: { "content-type": "application/geo+json; charset=utf-8" },
      });
    };

    const availability = await checkGeoLibreLayerAvailability({
      layers: [
        layer("municipal-boundary", "/api/gis/comune"),
        layer("census-sections", "/data/processed/territorio/sezioni.geojson"),
        layer("confiscated-assets", "/api/beni-confiscati/geojson"),
      ],
      siteOrigin: "https://lamezia.example",
      apiBaseUrl: "https://api.lamezia.example",
      fetcher,
    });

    expect(
      availability.map(({ layer: item, status, reason }) => ({
        id: item.id,
        status,
        reason,
      })),
    ).toEqual([
      {
        id: "municipal-boundary",
        status: "unavailable",
        reason: "http_error",
      },
      { id: "census-sections", status: "ready", reason: null },
      {
        id: "confiscated-assets",
        status: "unavailable",
        reason: "network_error",
      },
    ]);
    expect(requested).toEqual([
      {
        method: "HEAD",
        url: "https://api.lamezia.example/api/gis/comune",
      },
      {
        method: "HEAD",
        url: "https://lamezia.example/data/processed/territorio/sezioni.geojson",
      },
      {
        method: "HEAD",
        url: "https://api.lamezia.example/api/beni-confiscati/geojson",
      },
    ]);
  });

  it("rejects a successful response that is not GeoJSON", async () => {
    const availability = await checkGeoLibreLayerAvailability({
      layers: [layer("municipal-boundary", "/api/gis/comune")],
      siteOrigin: "https://lamezia.example",
      fetcher: async () =>
        new Response(null, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
    });

    expect(availability[0]).toMatchObject({
      status: "unavailable",
      httpStatus: 200,
      reason: "invalid_content_type",
    });
  });

  it("keeps the GeoLibre pilot aligned with the active canonical Atlas registry", () => {
    const activeLayers = getActiveAtlasSpatialLayers();

    expect(activeLayers.map((item) => item.id)).toEqual([
      "municipal-boundary",
      "census-sections",
      "confiscated-assets",
    ]);

    const url = new URL(
      buildGeoLibreViewerUrl({
        viewerBaseUrl: "https://web.geolibre.app/",
        layers: activeLayers,
        siteOrigin: "https://lamezia.example",
        apiBaseUrl: "https://api.lamezia.example",
      }),
    );

    expect(url.searchParams.getAll("data")).toEqual([
      "https://api.lamezia.example/api/gis/comune",
      "https://lamezia.example/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
      "https://api.lamezia.example/api/beni-confiscati/geojson",
    ]);
  });
});
