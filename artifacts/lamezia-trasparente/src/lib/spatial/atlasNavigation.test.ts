import { describe, expect, it } from "vitest";

import { buildAtlasHref, parseAtlasNavigation } from "./atlasNavigation";

describe("atlas navigation helpers", () => {
  it("builds a stable deep link for a canonical entity", () => {
    expect(
      buildAtlasHref({
        layerIds: ["confiscated-assets"],
        entity: { entityType: "confiscated_asset", entityId: "asset-123" },
      }),
    ).toBe(
      "/atlante-territoriale?layers=confiscated-assets&entity=confiscated_asset%3Aasset-123",
    );
  });

  it("deduplicates layers and parses the entity reference", () => {
    expect(
      parseAtlasNavigation(
        "?layers=confiscated-assets,confiscated-assets,census-sections&entity=confiscated_asset%3Aasset-123",
      ),
    ).toEqual({
      layerIds: ["confiscated-assets", "census-sections"],
      entity: { entityType: "confiscated_asset", entityId: "asset-123" },
    });
  });

  it("ignores malformed entity references", () => {
    expect(parseAtlasNavigation("?entity=confiscated_asset")).toEqual({
      layerIds: [],
      entity: null,
    });
  });
});
