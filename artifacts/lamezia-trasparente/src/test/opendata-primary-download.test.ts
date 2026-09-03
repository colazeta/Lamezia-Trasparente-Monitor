import { describe, expect, it } from "vitest";

import { OPEN_DATA_DATASET_REGISTRY } from "@/data/openDataDatasetRegistry";
import { getOpenDataPrimaryDownload } from "@/data/openDataPrimaryDownload";

describe("Open Data primary download contract", () => {
  it("provides one simple primary download for every canonical dataset", () => {
    expect(OPEN_DATA_DATASET_REGISTRY).toHaveLength(9);

    for (const dataset of OPEN_DATA_DATASET_REGISTRY) {
      const download = getOpenDataPrimaryDownload(dataset);
      expect(download, dataset.id).not.toBeNull();
      expect(download?.url).toBeTruthy();
      expect(download?.downloadName).toBeTruthy();
    }
  });

  it("uses the first declared distribution for generic multi-format datasets", () => {
    const assets = OPEN_DATA_DATASET_REGISTRY.find(
      (dataset) => dataset.id === "beni-confiscati-lamezia-documentati",
    );
    const census = OPEN_DATA_DATASET_REGISTRY.find(
      (dataset) => dataset.id === "istat-census-sections-lamezia-2023",
    );

    expect(assets).toBeDefined();
    expect(census).toBeDefined();
    expect(getOpenDataPrimaryDownload(assets!)).toMatchObject({
      url: "/data/curated/territorio/beni_confiscati_lamezia_pilot.json",
      format: "JSON",
    });
    expect(getOpenDataPrimaryDownload(census!)).toMatchObject({
      url: "/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
      format: "GeoJSON",
    });
  });
});
