import { afterEach, describe, expect, it, vi } from "vitest";

import { loadConfiscatedAssetsSpatialLayer } from "./spatialLayers";

const fallbackCollection = {
  type: "FeatureCollection",
  features: [],
  metadata: {
    layer_id: "confiscated-assets",
    entity_type: "confiscated_asset",
    input_records: 340,
    published_features: 0,
    excluded_records: 340,
    exclusions: { municipal_centroid_only: 292, missing_asset_coordinates: 48 },
    publication_policy: "default-deny",
    source_dataset_label: "ANBSC",
    source_dataset_url: "https://benidestinati.anbsc.it/",
    automatic_geocoder: "not used",
  },
};

const primaryCollection = {
  ...fallbackCollection,
  features: [
    {
      type: "Feature",
      id: "confiscated_asset:1:location",
      geometry: { type: "Point", coordinates: [16.31, 38.97] },
      properties: {
        entity_id: "confiscated_asset:1",
        title: "Bene qualificato",
        public_url: "/beni-confiscati/bene-qualificato",
      },
    },
  ],
  metadata: {
    ...fallbackCollection.metadata,
    input_records: 1,
    published_features: 1,
    excluded_records: 0,
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("confiscated assets spatial loading", () => {
  it("keeps the database-backed API as the preferred canonical source", async () => {
    const requested: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        requested.push(String(input));
        return Response.json(primaryCollection);
      }),
    );

    const result = await loadConfiscatedAssetsSpatialLayer();

    expect(result.collection.features).toHaveLength(1);
    expect(result).toMatchObject({
      distribution: "primary",
      primaryFailure: null,
    });
    expect(requested).toEqual(["/api/beni-confiscati/geojson"]);
  });

  it("uses the declared static snapshot only when the API is unavailable", async () => {
    const requested: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        requested.push(url);
        if (url === "/api/beni-confiscati/geojson") {
          return Response.json(
            { message: "API non configurata" },
            { status: 503 },
          );
        }
        return Response.json(fallbackCollection);
      }),
    );

    const result = await loadConfiscatedAssetsSpatialLayer();

    expect(result.collection.features).toHaveLength(0);
    expect(result.collection.metadata).toMatchObject({
      input_records: 340,
      published_features: 0,
      excluded_records: 340,
    });
    expect(result).toMatchObject({
      distribution: "continuity_fallback",
      primaryFailure: { reason: "http_error", httpStatus: 503 },
    });
    expect(requested).toEqual([
      "/api/beni-confiscati/geojson",
      "/data/processed/territorio/beni_confiscati_lamezia.geojson",
    ]);
  });
});
