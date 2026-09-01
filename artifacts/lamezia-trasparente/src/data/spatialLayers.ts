import { getSpatialLayer } from "@/lib/spatial";

export type MunicipalBoundarySpatialFeature = {
  type: "Feature";
  properties: {
    name?: string;
    kind?: string;
    [key: string]: unknown;
  } | null;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: unknown;
  };
};

export type MunicipalBoundarySpatialCollection = {
  type: "FeatureCollection";
  features: MunicipalBoundarySpatialFeature[];
  metadata: {
    layer_id: "municipal-boundary";
    geometry_role: "administrative_boundary";
    representation: "municipal_boundary";
    source_label: string;
    attribution: string;
    licence: string;
    publication_note: string;
  };
};

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
    status: "sequestrato" | "confiscato" | "assegnato" | "riutilizzato";
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
    exclusions: Record<string, number>;
    publication_policy: string;
    source_dataset_label: string;
    source_dataset_url: string;
    automatic_geocoder: string;
  };
};

export async function loadMunicipalBoundarySpatialLayer(): Promise<MunicipalBoundarySpatialCollection> {
  const definition = getSpatialLayer("municipal-boundary");
  if (!definition?.dataPath) {
    throw new Error("Confine comunale non configurato");
  }

  const response = await fetch(definition.dataPath, {
    headers: { Accept: "application/geo+json, application/json" },
  });
  if (!response.ok) {
    throw new Error(`Confine comunale non disponibile (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  if (!isMunicipalBoundarySpatialCollection(payload)) {
    throw new Error("Formato del confine comunale non valido");
  }

  return payload;
}

export async function loadConfiscatedAssetsSpatialLayer(): Promise<ConfiscatedAssetsSpatialCollection> {
  const definition = getSpatialLayer("confiscated-assets");
  if (!definition?.dataPath) {
    throw new Error("Layer beni confiscati non configurato");
  }

  const dataPaths = [definition.dataPath, definition.fallbackDataPath].filter(
    (dataPath): dataPath is string => Boolean(dataPath),
  );
  let lastError: Error | null = null;

  for (const dataPath of dataPaths) {
    try {
      return await fetchConfiscatedAssetsSpatialCollection(dataPath);
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error("Layer beni confiscati non disponibile");
    }
  }

  throw lastError ?? new Error("Layer beni confiscati non disponibile");
}

async function fetchConfiscatedAssetsSpatialCollection(
  dataPath: string,
): Promise<ConfiscatedAssetsSpatialCollection> {
  const response = await fetch(dataPath, {
    headers: { Accept: "application/geo+json, application/json" },
  });
  if (!response.ok) {
    throw new Error(
      `Layer beni confiscati non disponibile (${response.status})`,
    );
  }

  const payload = (await response.json()) as unknown;
  if (!isConfiscatedAssetsSpatialCollection(payload)) {
    throw new Error("Formato del layer beni confiscati non valido");
  }

  return payload;
}

function isMunicipalBoundarySpatialCollection(
  value: unknown,
): value is MunicipalBoundarySpatialCollection {
  if (!value || typeof value !== "object") return false;
  const collection = value as Partial<MunicipalBoundarySpatialCollection>;
  if (
    collection.type !== "FeatureCollection" ||
    !Array.isArray(collection.features)
  ) {
    return false;
  }
  if (
    collection.metadata?.layer_id !== "municipal-boundary" ||
    collection.metadata.geometry_role !== "administrative_boundary" ||
    collection.metadata.representation !== "municipal_boundary" ||
    typeof collection.metadata.source_label !== "string" ||
    typeof collection.metadata.attribution !== "string" ||
    typeof collection.metadata.licence !== "string"
  ) {
    return false;
  }

  return (
    collection.features.length > 0 &&
    collection.features.every((feature) => {
      const geometryType = feature?.geometry?.type;
      return (
        feature?.type === "Feature" &&
        (geometryType === "Polygon" || geometryType === "MultiPolygon") &&
        Array.isArray(feature.geometry.coordinates)
      );
    })
  );
}

function isConfiscatedAssetsSpatialCollection(
  value: unknown,
): value is ConfiscatedAssetsSpatialCollection {
  if (!value || typeof value !== "object") return false;
  const collection = value as Partial<ConfiscatedAssetsSpatialCollection>;
  if (
    collection.type !== "FeatureCollection" ||
    !Array.isArray(collection.features)
  ) {
    return false;
  }
  if (
    !collection.metadata ||
    collection.metadata.layer_id !== "confiscated-assets"
  ) {
    return false;
  }

  return collection.features.every((feature) => {
    const coordinates = feature?.geometry?.coordinates;
    return (
      feature?.type === "Feature" &&
      feature.geometry?.type === "Point" &&
      Array.isArray(coordinates) &&
      coordinates.length >= 2 &&
      Number.isFinite(coordinates[0]) &&
      Number.isFinite(coordinates[1]) &&
      typeof feature.properties?.entity_id === "string" &&
      typeof feature.properties?.title === "string" &&
      typeof feature.properties?.public_url === "string"
    );
  });
}
