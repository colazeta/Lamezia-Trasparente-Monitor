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
  loadSpatialPublicationManifest,
  resolveSpatialDataUrl,
} from "./geoLibrePilot";

function layer(
  id: SpatialLayerId,
  dataPath: string,
  fallbackDataPath?: string,
): SpatialLayerDefinition {
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
    fallbackDataPath,
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
    ).toBe("https://lamezia.example/data/processed/territorio/sezioni.geojson");
  });

  it("preserves the deployment base path for static layers", () => {
    expect(
      resolveSpatialDataUrl(
        "/data/processed/territorio/sezioni.geojson",
        "https://lamezia.example/Lamezia-Trasparente-Monitor/",
        "https://api.lamezia.example",
      ),
    ).toBe(
      "https://lamezia.example/Lamezia-Trasparente-Monitor/data/processed/territorio/sezioni.geojson",
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

  it("uses a declared static fallback without replacing the canonical API path", async () => {
    const requested: string[] = [];
    const availability = await checkGeoLibreLayerAvailability({
      layers: [
        layer(
          "confiscated-assets",
          "/api/beni-confiscati/geojson",
          "/data/processed/territorio/beni_confiscati_lamezia.geojson",
        ),
      ],
      siteOrigin: "https://lamezia.example",
      fetcher: async (input) => {
        const url = input instanceof Request ? input.url : String(input);
        requested.push(url);
        return new Response(null, {
          status: url.includes("/api/") ? 503 : 200,
          headers: { "content-type": "application/geo+json" },
        });
      },
    });

    expect(availability[0]).toMatchObject({
      dataUrl:
        "https://lamezia.example/data/processed/territorio/beni_confiscati_lamezia.geojson",
      status: "ready",
      reason: null,
      distribution: "continuity_fallback",
      primaryDataUrl: "https://lamezia.example/api/beni-confiscati/geojson",
      primaryHttpStatus: 503,
      primaryReason: "http_error",
    });
    expect(requested).toEqual([
      "https://lamezia.example/api/beni-confiscati/geojson",
      "https://lamezia.example/data/processed/territorio/beni_confiscati_lamezia.geojson",
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

  it("keeps valid layers available when the configured API base URL is malformed", async () => {
    const requested: string[] = [];
    const availability = await checkGeoLibreLayerAvailability({
      layers: [
        layer("municipal-boundary", "/api/gis/comune"),
        layer("census-sections", "/data/processed/territorio/sezioni.geojson"),
      ],
      siteOrigin: "https://lamezia.example",
      apiBaseUrl: "http://[invalid",
      fetcher: async (input) => {
        requested.push(input instanceof Request ? input.url : String(input));
        return new Response(null, {
          status: 200,
          headers: { "content-type": "application/geo+json" },
        });
      },
    });

    expect(availability).toMatchObject([
      {
        dataUrl: null,
        status: "unavailable",
        reason: "invalid_url",
      },
      {
        dataUrl:
          "https://lamezia.example/data/processed/territorio/sezioni.geojson",
        status: "ready",
        reason: null,
      },
    ]);
    expect(requested).toEqual([
      "https://lamezia.example/data/processed/territorio/sezioni.geojson",
    ]);
  });

  it("bounds a stalled feed and reports it as unavailable", async () => {
    const availability = await checkGeoLibreLayerAvailability({
      layers: [layer("municipal-boundary", "/api/gis/comune")],
      siteOrigin: "https://lamezia.example",
      timeoutMs: 5,
      fetcher: () => new Promise<Response>(() => undefined),
    });

    expect(availability[0]).toMatchObject({
      status: "unavailable",
      httpStatus: null,
      reason: "timeout",
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
      "https://lamezia.example/data/processed/territorio/lamezia_confine_comunale.geojson",
      "https://lamezia.example/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
      "https://api.lamezia.example/api/beni-confiscati/geojson",
    ]);
  });

  it("accepts a default-deny manifest aligned with every active layer", async () => {
    const activeLayers = getActiveAtlasSpatialLayers();
    const manifest = {
      schema_version: "1.0",
      generated_at: "2026-09-01T18:00:00.000Z",
      scope: { municipality: "Lamezia Terme", istat_code: "079160" },
      publication_policy: "default-deny",
      layers: activeLayers.map((item, index) => ({
        layer_id: item.id,
        primary_data_path: item.dataPath,
        data_path: item.fallbackDataPath ?? item.dataPath,
        distribution_role: item.fallbackDataPath
          ? "continuity_fallback"
          : "primary",
        media_type: "application/geo+json",
        distribution_status: "published",
        content_status: index === 2 ? "empty_by_policy" : "populated",
        feature_count: index === 0 ? 1 : index === 1 ? 317 : 0,
        excluded_feature_count: index === 2 ? 340 : 0,
        sha256: "a".repeat(64),
        source_label: item.sourceLabel,
        licence: "test",
        source_modified: null,
        publication_note: "test",
      })),
    };

    const loaded = await loadSpatialPublicationManifest({
      layers: activeLayers,
      siteOrigin: "https://lamezia.example",
      fetcher: async (input, init) => {
        expect(input).toBe(
          "https://lamezia.example/data/processed/territorio/spatial_layer_manifest.json",
        );
        expect(init?.method).toBe("GET");
        return Response.json(manifest, {
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },
    });

    expect(loaded.layers[2]).toMatchObject({
      layer_id: "confiscated-assets",
      content_status: "empty_by_policy",
      excluded_feature_count: 340,
    });
  });

  it("rejects a manifest whose data path diverges from the registry", async () => {
    const activeLayers = getActiveAtlasSpatialLayers();
    const manifest = {
      schema_version: "1.0",
      generated_at: "2026-09-01T18:00:00.000Z",
      scope: { municipality: "Lamezia Terme", istat_code: "079160" },
      publication_policy: "default-deny",
      layers: activeLayers.map((item) => ({
        layer_id: item.id,
        primary_data_path: item.dataPath,
        data_path:
          item.id === "municipal-boundary"
            ? "/data/processed/territorio/wrong.geojson"
            : (item.fallbackDataPath ?? item.dataPath),
        distribution_role: item.fallbackDataPath
          ? "continuity_fallback"
          : "primary",
        media_type: "application/geo+json",
        distribution_status: "published",
        content_status: "populated",
        feature_count: 1,
        excluded_feature_count: 0,
        sha256: "b".repeat(64),
        source_label: item.sourceLabel,
        licence: "test",
        source_modified: null,
        publication_note: "test",
      })),
    };

    await expect(
      loadSpatialPublicationManifest({
        layers: activeLayers,
        siteOrigin: "https://lamezia.example",
        fetcher: async () =>
          Response.json(manifest, {
            headers: { "content-type": "application/json" },
          }),
      }),
    ).rejects.toThrow(/manifest mismatch for municipal-boundary/);
  });
});
