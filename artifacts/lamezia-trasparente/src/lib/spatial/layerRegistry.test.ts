import { describe, expect, it } from "vitest";

import {
  getActiveAtlasSpatialLayers,
  getInitialAtlasVisibleLayerIds,
  getSpatialLayer,
  SPATIAL_LAYER_REGISTRY,
} from "./layerRegistry";

describe("spatial layer registry", () => {
  it("exposes only renderer-ready layers to the Atlas selector", () => {
    const layers = getActiveAtlasSpatialLayers();

    expect(layers.map((layer) => layer.id)).toEqual([
      "municipal-boundary",
      "census-sections",
      "confiscated-assets",
    ]);
    expect(layers.every((layer) => Boolean(layer.dataPath))).toBe(true);
  });

  it("keeps default visibility in the registry", () => {
    expect(getSpatialLayer("municipal-boundary")?.defaultVisible).toBe(true);
    expect(getSpatialLayer("census-sections")?.defaultVisible).toBe(true);
    expect(getSpatialLayer("confiscated-assets")?.defaultVisible).toBe(false);
  });

  it("derives the initial Atlas selection from active registry defaults", () => {
    expect(getInitialAtlasVisibleLayerIds()).toEqual([
      "municipal-boundary",
      "census-sections",
    ]);
  });

  it("adds valid deep-linked layers without enabling planned or unknown layers", () => {
    expect(
      getInitialAtlasVisibleLayerIds([
        "confiscated-assets",
        "pnrr-projects",
        "not-a-layer",
      ]),
    ).toEqual([
      "municipal-boundary",
      "census-sections",
      "confiscated-assets",
    ]);
  });

  it("does not expose planned domains before their Atlas implementation is ready", () => {
    const activeIds = new Set(
      getActiveAtlasSpatialLayers().map((layer) => layer.id),
    );
    const plannedIds = SPATIAL_LAYER_REGISTRY.filter(
      (layer) => layer.atlasStatus === "planned",
    ).map((layer) => layer.id);

    expect(plannedIds.length).toBeGreaterThan(0);
    expect(plannedIds.every((layerId) => !activeIds.has(layerId))).toBe(true);
  });
});
