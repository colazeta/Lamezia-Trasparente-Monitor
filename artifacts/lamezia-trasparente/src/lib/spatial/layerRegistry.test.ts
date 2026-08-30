import { describe, expect, it } from "vitest";

import {
  getActiveAtlasSpatialLayers,
  getInitialAtlasLayerIds,
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
    expect(getInitialAtlasLayerIds()).toEqual([
      "municipal-boundary",
      "census-sections",
    ]);
  });

  it("adds only active requested layers to the initial visibility set", () => {
    expect(
      getInitialAtlasLayerIds([
        "confiscated-assets",
        "public-works",
        "unknown-layer",
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
