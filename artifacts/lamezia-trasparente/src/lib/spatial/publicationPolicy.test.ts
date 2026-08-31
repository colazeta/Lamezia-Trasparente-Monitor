import { describe, expect, it } from "vitest";

import { getActiveAtlasSpatialLayers } from "./layerRegistry";
import {
  isAtlasLayerPublicationEligible,
  NON_PUBLIC_SPATIAL_DATASETS,
  SPATIAL_LAYER_PUBLICATION_POLICY,
} from "./publicationPolicy";

describe("spatial publication policy", () => {
  it("allows only explicitly eligible active Atlas layers", () => {
    const activeLayers = getActiveAtlasSpatialLayers();

    expect(activeLayers.map((layer) => layer.id)).toEqual([
      "municipal-boundary",
      "census-sections",
      "confiscated-assets",
    ]);

    for (const layer of activeLayers) {
      expect(isAtlasLayerPublicationEligible(layer.id)).toBe(true);
      expect(SPATIAL_LAYER_PUBLICATION_POLICY[layer.id].eligibility).not.toBe(
        "planned",
      );
    }
  });

  it("keeps known non-public spatial artifacts outside active Atlas feeds", () => {
    const activeDataPaths = getActiveAtlasSpatialLayers()
      .map((layer) => layer.dataPath)
      .filter((path): path is string => Boolean(path));

    for (const dataset of NON_PUBLIC_SPATIAL_DATASETS) {
      expect(dataset.atlasEligible).toBe(false);
      for (const artifact of dataset.artifacts) {
        expect(activeDataPaths).not.toContain(artifact);
        expect(activeDataPaths).not.toContain(`/${artifact}`);
      }
    }
  });

  it("classifies electoral polygons as inferred review-only geometries", () => {
    const electoral = NON_PUBLIC_SPATIAL_DATASETS.find(
      (dataset) => dataset.id === "electoral-sections-candidate-2025",
    );

    expect(electoral).toBeDefined();
    expect(electoral?.disposition).toBe("review_only");
    expect(electoral?.atlasEligible).toBe(false);
    expect(electoral && "geometryStatus" in electoral
      ? electoral.geometryStatus
      : undefined).toBe("candidate_inferred");
    expect(electoral?.artifacts).toEqual([
      "data/processed/geo/electoral_sections_candidate_2025_v1.gpkg",
      "data/processed/geo/electoral_sections_candidate_2025_v2.gpkg",
      "data/processed/geo/electoral_sections_candidate_2025_v3_census.gpkg",
    ]);
  });

  it("keeps ANNCSU civic datasets as internal support rather than public layers", () => {
    const anncsuDatasets = NON_PUBLIC_SPATIAL_DATASETS.filter((dataset) =>
      dataset.id.startsWith("anncsu-"),
    );

    expect(anncsuDatasets).toHaveLength(2);
    for (const dataset of anncsuDatasets) {
      expect(dataset.disposition).toBe("internal_support");
      expect(dataset.atlasEligible).toBe(false);
    }
  });
});
