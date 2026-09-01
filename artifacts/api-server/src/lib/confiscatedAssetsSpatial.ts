import type { ConfiscatedAsset } from "@workspace/db";

const ANBSC_DATASET_URL =
  process.env.ANBSC_OPENDATA_URL ??
  "https://www.anbsc.it/opendata/beni-immobili-destinati.csv";
const ANBSC_DATASET_LABEL =
  "Beni confiscati alle mafie – Open Data ANBSC (Comune di Lamezia Terme)";
const NOMINATIM_LABEL = "Nominatim / OpenStreetMap";

export type ConfiscatedAssetsSpatialExclusionReason =
  | "missing_coordinates"
  | "invalid_coordinates"
  | "missing_geolocation_provenance"
  | "needs_review"
  | "inconsistent_geolocation_provenance"
  | "unsupported_geolocation_source";

export type ConfiscatedAssetSpatialFeature = {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    entity_id: string;
    entity_type: "confiscated_asset";
    title: string;
    public_url: string;
    geometry_id: string;
    geometry_role: "asset_location";
    spatial_precision: "street" | "unknown";
    spatial_method:
      | "official_address_geocoded"
      | "other_address_geocoded"
      | "manual_coordinates";
    spatial_confidence: "high" | "medium";
    verification_status: "verified" | "machine_geocoded";
    is_inferred: boolean;
    source_id: string | null;
    source_label: string;
    source_url: string | null;
    source_dataset: string | null;
    source_record_id: string | null;
    observed_at: null;
    valid_from: null;
    valid_to: null;
    public_note: string;
    status: ConfiscatedAsset["status"];
    tipologia: string;
    address: string | null;
    neighbourhood: string | null;
    data_source_label: string;
    data_source_url: string | null;
    geocoding_provider: string | null;
    location_updated_at: string;
  };
};

export type ConfiscatedAssetsSpatialCollection = {
  type: "FeatureCollection";
  features: ConfiscatedAssetSpatialFeature[];
  metadata: {
    layer_id: "confiscated-assets";
    entity_type: "confiscated_asset";
    input_records: number;
    published_features: number;
    excluded_records: number;
    exclusions: Record<ConfiscatedAssetsSpatialExclusionReason, number>;
    publication_policy: string;
    source_dataset_label: string;
    source_dataset_url: string;
    automatic_geocoder: string;
  };
};

function parseCoordinate(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getConfiscatedAssetSpatialExclusionReason(
  asset: ConfiscatedAsset,
): ConfiscatedAssetsSpatialExclusionReason | null {
  const latitude = parseCoordinate(asset.latitude);
  const longitude = parseCoordinate(asset.longitude);

  if (latitude === null || longitude === null) return "missing_coordinates";
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return "invalid_coordinates";
  }
  if (!asset.geoSource) return "missing_geolocation_provenance";
  if (asset.geoVerify) return "needs_review";
  if (asset.geoSource !== "auto" && asset.geoSource !== "manual") {
    return "unsupported_geolocation_source";
  }
  if (
    (asset.geoSource === "manual" && !asset.geoManual) ||
    (asset.geoSource === "auto" && asset.geoManual)
  ) {
    return "inconsistent_geolocation_provenance";
  }
  return null;
}

/**
 * Single fail-closed publication gate shared by the GeoJSON adapter and every
 * public surface that describes itself as cartographic. Keeping this predicate
 * here prevents list/count views from drifting away from the layer policy.
 */
export function isConfiscatedAssetSpatiallyPublishable(
  asset: ConfiscatedAsset,
): boolean {
  return getConfiscatedAssetSpatialExclusionReason(asset) === null;
}

function toFeature(asset: ConfiscatedAsset): ConfiscatedAssetSpatialFeature {
  const latitude = Number(asset.latitude);
  const longitude = Number(asset.longitude);
  const entityId = `confiscated_asset:${asset.id}`;
  const geometryId = `${entityId}:location`;
  const manualLocation = asset.geoSource === "manual";
  const anbscBacked = Boolean(asset.sourceId?.startsWith("anbsc-"));

  const dataSourceLabel = anbscBacked
    ? ANBSC_DATASET_LABEL
    : asset.source === "manual"
      ? "Scheda curata dalla redazione di Lamezia Trasparente"
      : "Fonte del bene non qualificata";
  const dataSourceUrl =
    asset.officialUrl || (anbscBacked ? ANBSC_DATASET_URL : null);

  return {
    type: "Feature",
    id: geometryId,
    geometry: {
      type: "Point",
      // GeoJSON usa [longitudine, latitudine].
      coordinates: [longitude, latitude],
    },
    properties: {
      entity_id: entityId,
      entity_type: "confiscated_asset",
      title:
        asset.denominazione.trim() ||
        asset.geoAddress?.trim() ||
        asset.indirizzo.trim() ||
        `Bene confiscato ${asset.id}`,
      public_url: `/beni-confiscati/${asset.slug}`,
      geometry_id: geometryId,
      geometry_role: "asset_location",
      spatial_precision: manualLocation ? "unknown" : "street",
      spatial_method: manualLocation
        ? "manual_coordinates"
        : anbscBacked
          ? "official_address_geocoded"
          : "other_address_geocoded",
      spatial_confidence: manualLocation ? "medium" : "high",
      verification_status: manualLocation ? "verified" : "machine_geocoded",
      is_inferred: !manualLocation,
      source_id: asset.geoSource,
      source_label: manualLocation
        ? "Localizzazione fissata dalla redazione di Lamezia Trasparente"
        : `${NOMINATIM_LABEL} – geocodifica automatica`,
      source_url: manualLocation
        ? null
        : "https://nominatim.openstreetmap.org/",
      source_dataset: manualLocation ? null : NOMINATIM_LABEL,
      source_record_id: null,
      observed_at: null,
      valid_from: null,
      valid_to: null,
      public_note: manualLocation
        ? "Posizione fissata manualmente dalla redazione; il livello di precisione puntuale non è deducibile dai metadati legacy."
        : "Coordinate ricavate automaticamente da un riferimento stradale con Nominatim/OpenStreetMap; non equivalgono a una validazione umana della posizione.",
      status: asset.status,
      tipologia: asset.tipologia,
      address: asset.geoAddress || asset.indirizzo || null,
      neighbourhood: asset.geoQuartiere,
      data_source_label: dataSourceLabel,
      data_source_url: dataSourceUrl,
      geocoding_provider: manualLocation ? null : NOMINATIM_LABEL,
      location_updated_at: asset.updatedAt.toISOString(),
    },
  };
}

export function buildConfiscatedAssetsSpatialCollection(
  assets: ConfiscatedAsset[],
): ConfiscatedAssetsSpatialCollection {
  const exclusions: Record<ConfiscatedAssetsSpatialExclusionReason, number> = {
    missing_coordinates: 0,
    invalid_coordinates: 0,
    missing_geolocation_provenance: 0,
    needs_review: 0,
    inconsistent_geolocation_provenance: 0,
    unsupported_geolocation_source: 0,
  };
  const features: ConfiscatedAssetSpatialFeature[] = [];

  for (const asset of assets) {
    const exclusion = getConfiscatedAssetSpatialExclusionReason(asset);
    if (exclusion) {
      exclusions[exclusion] += 1;
      continue;
    }
    features.push(toFeature(asset));
  }

  return {
    type: "FeatureCollection",
    features,
    metadata: {
      layer_id: "confiscated-assets",
      entity_type: "confiscated_asset",
      input_records: assets.length,
      published_features: features.length,
      excluded_records: assets.length - features.length,
      exclusions,
      publication_policy:
        "Fail-closed: sono pubblicate solo posizioni con coordinate valide, provenienza geografica coerente e geoVerify=false. I record approssimati o ancora da verificare restano esclusi dal layer pubblico.",
      source_dataset_label: ANBSC_DATASET_LABEL,
      source_dataset_url: ANBSC_DATASET_URL,
      automatic_geocoder: NOMINATIM_LABEL,
    },
  };
}
