import type { ConfiscatedAsset } from "@workspace/api-client-react";
import {
  directReferenceToFeature,
  type SpatialConfidence,
  type SpatialFeature,
  type SpatialFeatureCollection,
  type SpatialMethod,
  type SpatialPrecision,
  type SpatialSourceReference,
  type SpatialVerificationStatus,
} from "./contract";

export type ConfiscatedAssetSpatialMetadata = {
  source: SpatialSourceReference;
  precision: SpatialPrecision;
  method: SpatialMethod;
  confidence: SpatialConfidence;
  verificationStatus: SpatialVerificationStatus;
  isInferred: boolean;
  publicNote?: string | null;
};

export type ConfiscatedAssetSpatialMetadataResolver = (
  asset: ConfiscatedAsset,
) => ConfiscatedAssetSpatialMetadata | null;

function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function isValidLatitude(value: number): boolean {
  return value >= -90 && value <= 90;
}

function isValidLongitude(value: number): boolean {
  return value >= -180 && value <= 180;
}

/**
 * Trasforma un bene confiscato in una feature canonica dell'Atlante.
 *
 * La funzione è intenzionalmente fail-closed: coordinate valide non bastano.
 * Senza metadati territoriali espliciti (fonte, precisione, metodo e verifica)
 * il bene non viene pubblicato come feature spaziale.
 */
export function confiscatedAssetToSpatialFeature(
  asset: ConfiscatedAsset,
  metadata: ConfiscatedAssetSpatialMetadata | null,
): SpatialFeature | null {
  if (!metadata) return null;

  const latitude = parseCoordinate(asset.latitude);
  const longitude = parseCoordinate(asset.longitude);

  if (
    latitude === null ||
    longitude === null ||
    !isValidLatitude(latitude) ||
    !isValidLongitude(longitude)
  ) {
    return null;
  }

  const entityId = `confiscated_asset:${asset.id}`;
  const title =
    asset.denominazione?.trim() ||
    asset.geoAddress?.trim() ||
    asset.indirizzo?.trim() ||
    `Bene confiscato ${asset.id}`;

  return directReferenceToFeature(
    {
      entityId,
      entityType: "confiscated_asset",
      title,
      publicUrl: asset.slug ? `/beni-confiscati/${asset.slug}` : null,
    },
    {
      kind: "direct",
      geometryId: `${entityId}:location`,
      geometry: {
        type: "Point",
        // GeoJSON usa l'ordine [longitudine, latitudine].
        coordinates: [longitude, latitude],
      },
      geometryRole: "asset_location",
      precision: metadata.precision,
      method: metadata.method,
      confidence: metadata.confidence,
      verificationStatus: metadata.verificationStatus,
      source: metadata.source,
      isInferred: metadata.isInferred,
      publicNote: metadata.publicNote ?? null,
    },
    {
      status: asset.status,
      address: asset.geoAddress || asset.indirizzo || null,
      neighbourhood: asset.geoQuartiere || null,
      source_asset_id: asset.id,
      slug: asset.slug || null,
    },
  );
}

export function confiscatedAssetsToFeatureCollection(
  assets: ConfiscatedAsset[],
  resolveMetadata: ConfiscatedAssetSpatialMetadataResolver,
): SpatialFeatureCollection {
  const features = assets.flatMap((asset) => {
    const feature = confiscatedAssetToSpatialFeature(
      asset,
      resolveMetadata(asset),
    );
    return feature ? [feature] : [];
  });

  return {
    type: "FeatureCollection",
    features,
    metadata: {
      layer_id: "confiscated-assets",
      entity_type: "confiscated_asset",
      input_records: assets.length,
      published_features: features.length,
      excluded_records: assets.length - features.length,
      publication_policy:
        "Coordinate valide e metadati territoriali espliciti sono entrambi obbligatori.",
    },
  };
}
