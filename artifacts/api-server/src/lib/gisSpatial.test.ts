import { describe, expect, it } from "vitest";

import {
  historicCircumscriptionCentroidsSpatialCollection,
  municipalBoundarySpatialCollection,
} from "./gisSpatial";

describe("GIS reference geography publication metadata", () => {
  it("publishes the municipal polygon as an administrative boundary with provenance", () => {
    expect(municipalBoundarySpatialCollection.type).toBe("FeatureCollection");
    expect(municipalBoundarySpatialCollection.features.length).toBeGreaterThan(0);
    expect(municipalBoundarySpatialCollection.metadata).toMatchObject({
      layer_id: "municipal-boundary",
      geometry_role: "administrative_boundary",
      representation: "municipal_boundary",
      source_label: "OpenStreetMap / Nominatim",
      attribution: "© OpenStreetMap contributors",
      licence: "ODbL 1.0",
    });
  });

  it("explicitly prevents historic-centroid points from being presented as boundaries", () => {
    expect(historicCircumscriptionCentroidsSpatialCollection.features).toHaveLength(3);
    expect(historicCircumscriptionCentroidsSpatialCollection.metadata).toMatchObject({
      layer_id: "historic-circumscription-centroids",
      representation: "reference_centroids",
      is_boundary: false,
      source_label: "OpenStreetMap / Nominatim",
      licence: "ODbL 1.0",
    });
    expect(
      historicCircumscriptionCentroidsSpatialCollection.features.every(
        (feature) => feature.geometry.type === "Point",
      ),
    ).toBe(true);
  });
});
