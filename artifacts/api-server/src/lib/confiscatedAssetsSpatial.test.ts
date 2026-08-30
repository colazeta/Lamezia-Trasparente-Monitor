import { describe, expect, it } from "vitest";
import type { ConfiscatedAsset } from "@workspace/db";
import { buildConfiscatedAssetsSpatialCollection } from "./confiscatedAssetsSpatial";

function asset(
  overrides: Partial<ConfiscatedAsset> = {},
): ConfiscatedAsset {
  return {
    id: 1,
    slug: "bene-test",
    denominazione: "Bene test",
    description: "",
    tipologia: "Immobile",
    status: "confiscato",
    indirizzo: "Via Roma 1, Lamezia Terme",
    assegnatario: "",
    destinazioneUso: "",
    datiCatastali: "",
    officialUrl: null,
    source: "auto",
    sourceId: "anbsc-123",
    latitude: "38.9650000",
    longitude: "16.3100000",
    geoAddress: "Via Roma 1",
    geoQuartiere: "nicastro",
    geoSource: "auto",
    geoManual: false,
    geoVerify: false,
    notes: "",
    createdAt: new Date("2026-08-01T10:00:00Z"),
    updatedAt: new Date("2026-08-30T10:00:00Z"),
    ...overrides,
  };
}

describe("buildConfiscatedAssetsSpatialCollection", () => {
  it("pubblica una geocodifica automatica non approssimata senza chiamarla verificata", () => {
    const collection = buildConfiscatedAssetsSpatialCollection([asset()]);

    expect(collection.features).toHaveLength(1);
    expect(collection.metadata.published_features).toBe(1);
    expect(collection.metadata.excluded_records).toBe(0);

    const feature = collection.features[0];
    expect(feature.geometry.coordinates).toEqual([16.31, 38.965]);
    expect(feature.properties.spatial_method).toBe(
      "official_address_geocoded",
    );
    expect(feature.properties.verification_status).toBe("machine_geocoded");
    expect(feature.properties.spatial_precision).toBe("street");
    expect(feature.properties.is_inferred).toBe(true);
    expect(feature.properties.geocoding_provider).toBe(
      "Nominatim / OpenStreetMap",
    );
  });

  it("esclude una posizione automatica ancora da verificare", () => {
    const collection = buildConfiscatedAssetsSpatialCollection([
      asset({ geoVerify: true }),
    ]);

    expect(collection.features).toHaveLength(0);
    expect(collection.metadata.excluded_records).toBe(1);
    expect(collection.metadata.exclusions.needs_review).toBe(1);
  });

  it("pubblica una posizione fissata manualmente come metodo manuale, non come geocodifica", () => {
    const collection = buildConfiscatedAssetsSpatialCollection([
      asset({
        source: "manual",
        sourceId: null,
        geoSource: "manual",
        geoManual: true,
        geoVerify: false,
      }),
    ]);

    expect(collection.features).toHaveLength(1);
    const feature = collection.features[0];
    expect(feature.properties.spatial_method).toBe("manual_coordinates");
    expect(feature.properties.verification_status).toBe("verified");
    expect(feature.properties.spatial_precision).toBe("unknown");
    expect(feature.properties.is_inferred).toBe(false);
    expect(feature.properties.geocoding_provider).toBeNull();
  });

  it("esclude metadati di provenienza geografica incoerenti", () => {
    const collection = buildConfiscatedAssetsSpatialCollection([
      asset({ geoSource: "manual", geoManual: false }),
      asset({ id: 2, slug: "bene-2", geoSource: "auto", geoManual: true }),
    ]);

    expect(collection.features).toHaveLength(0);
    expect(
      collection.metadata.exclusions.inconsistent_geolocation_provenance,
    ).toBe(2);
  });

  it("distingue coordinate mancanti, non valide e provenienza mancante", () => {
    const collection = buildConfiscatedAssetsSpatialCollection([
      asset({ latitude: null }),
      asset({ id: 2, slug: "bene-2", latitude: "99.0000000" }),
      asset({ id: 3, slug: "bene-3", geoSource: null }),
    ]);

    expect(collection.features).toHaveLength(0);
    expect(collection.metadata.exclusions.missing_coordinates).toBe(1);
    expect(collection.metadata.exclusions.invalid_coordinates).toBe(1);
    expect(collection.metadata.exclusions.missing_geolocation_provenance).toBe(
      1,
    );
    expect(collection.metadata.excluded_records).toBe(3);
  });

  it("mantiene distinta la fonte del dato dalla fonte della coordinata", () => {
    const collection = buildConfiscatedAssetsSpatialCollection([asset()]);
    const properties = collection.features[0].properties;

    expect(properties.source_label).toContain("Nominatim");
    expect(properties.data_source_label).toContain("ANBSC");
    expect(properties.data_source_url).toContain("anbsc.it");
  });
});
