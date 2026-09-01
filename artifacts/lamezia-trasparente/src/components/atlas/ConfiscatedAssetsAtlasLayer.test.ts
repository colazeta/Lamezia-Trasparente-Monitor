import { describe, expect, it } from "vitest";

import type { ConfiscatedAssetsSpatialCollection } from "@/data/spatialLayers";
import { getConfiscatedAssetsCoverageLabel } from "./ConfiscatedAssetsAtlasLayer";

const fallbackCollection: ConfiscatedAssetsSpatialCollection = {
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

describe("confiscated assets Atlas coverage", () => {
  it("discloses the static fallback and separates ANBSC counts from database coverage", () => {
    const label = getConfiscatedAssetsCoverageLabel({
      status: "ready",
      collection: fallbackCollection,
      distribution: "continuity_fallback",
      primaryFailure: { reason: "http_error", httpStatus: 503 },
      message: null,
    });

    expect(label).toContain("Fallback statico ANBSC attivo");
    expect(label).toContain(
      "feed database primario non disponibile (HTTP 503)",
    );
    expect(label).toContain(
      "Questi conteggi non rappresentano la copertura corrente del database",
    );
  });

  it("keeps the ordinary coverage label for the primary database feed", () => {
    const label = getConfiscatedAssetsCoverageLabel({
      status: "ready",
      collection: {
        ...fallbackCollection,
        metadata: {
          ...fallbackCollection.metadata,
          input_records: 5,
          published_features: 3,
          excluded_records: 2,
        },
      },
      distribution: "primary",
      primaryFailure: null,
      message: null,
    });

    expect(label).toBe(
      "3 in mappa su 5; 2 esclusi perché la localizzazione non supera ancora i criteri di pubblicazione",
    );
  });
});
