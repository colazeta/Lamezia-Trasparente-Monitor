import { createHash } from "node:crypto";

export const LAMEZIA_MUNICIPALITY = "Lamezia Terme" as const;
export const LAMEZIA_ISTAT_CODE = "079160" as const;

export type JsonObject = Record<string, unknown>;

export type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  features: unknown[];
  metadata?: JsonObject;
};

export type AnbscPublicDataset = {
  "@graph": JsonObject[];
  "dct:title"?: string;
};

export type ConfiscatedAssetsSnapshot = {
  type: "FeatureCollection";
  features: [];
  metadata: {
    layer_id: "confiscated-assets";
    entity_type: "confiscated_asset";
    input_records: number;
    published_features: 0;
    excluded_records: number;
    exclusions: {
      municipal_centroid_only: number;
      missing_asset_coordinates: number;
      asset_coordinates_pending_review: number;
    };
    publication_policy: string;
    source_dataset_label: string;
    source_dataset_url: string;
    source_modified: string;
    source_counts: {
      in_administration: number;
      destined: number;
    };
    licence: "Italian Open Data License v2.0";
    licence_url: "https://www.dati.gov.it/content/italian-open-data-license-v20";
    automatic_geocoder: "not used";
    publication_note: string;
  };
};

export type SpatialPublicationManifest = {
  schema_version: "1.0";
  generated_at: string;
  scope: {
    municipality: typeof LAMEZIA_MUNICIPALITY;
    istat_code: typeof LAMEZIA_ISTAT_CODE;
  };
  publication_policy: "default-deny";
  layers: Array<{
    layer_id: "municipal-boundary" | "census-sections" | "confiscated-assets";
    data_path: string;
    media_type: "application/geo+json";
    distribution_status: "published";
    content_status: "populated" | "empty_by_policy";
    feature_count: number;
    excluded_feature_count: number;
    sha256: string;
    source_label: string;
    licence: string;
    source_modified: string | null;
    publication_note: string;
  }>;
};

export type BuildConfiscatedAssetsSnapshotOptions = {
  inAdministration: unknown;
  destined: unknown;
  sourceModified: string;
  sourceDatasetUrl: string;
};

const ASSET_LATITUDE_KEYS = [
  "latitudine_bene",
  "latitude",
  "latitudine",
] as const;
const ASSET_LONGITUDE_KEYS = [
  "longitudine_bene",
  "longitude",
  "longitudine",
] as const;

function asObject(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label}: expected an object`);
  }
  return value as JsonObject;
}

function readDataset(value: unknown, label: string): AnbscPublicDataset {
  const dataset = asObject(value, label);
  if (!Array.isArray(dataset["@graph"])) {
    throw new Error(`${label}: expected an @graph array`);
  }
  return dataset as AnbscPublicDataset;
}

function nonEmptyValue(record: JsonObject, keys: readonly string[]): unknown {
  for (const key of keys) {
    const value = record[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
}

function hasFinitePair(
  record: JsonObject,
  latitudeKeys: readonly string[],
  longitudeKeys: readonly string[],
): boolean {
  const rawLatitude = nonEmptyValue(record, latitudeKeys);
  const rawLongitude = nonEmptyValue(record, longitudeKeys);
  if (rawLatitude === null || rawLongitude === null) return false;
  const latitude = Number(rawLatitude);
  const longitude = Number(rawLongitude);
  return (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function validateDatasetRecords(
  dataset: AnbscPublicDataset,
  expectedIter: "In Amministrazione" | "Destinato",
  seenIds: Set<string>,
): JsonObject[] {
  return dataset["@graph"].map((rawRecord, index) => {
    const record = asObject(rawRecord, `${expectedIter}[${index}]`);
    if (record.comune !== LAMEZIA_MUNICIPALITY) {
      throw new Error(
        `${expectedIter}[${index}]: record outside ${LAMEZIA_MUNICIPALITY}`,
      );
    }
    if (record.iter_amministrativo !== expectedIter) {
      throw new Error(
        `${expectedIter}[${index}]: unexpected iter_amministrativo`,
      );
    }

    const sourceId = String(
      nonEmptyValue(record, ["bene_id", "mbene", "cbene", "sbene"]) ?? "",
    ).trim();
    if (!sourceId) {
      throw new Error(
        `${expectedIter}[${index}]: missing ANBSC source identifier`,
      );
    }
    if (seenIds.has(sourceId)) {
      throw new Error(`Duplicate ANBSC source identifier ${sourceId}`);
    }
    seenIds.add(sourceId);
    return record;
  });
}

/**
 * Costruisce lo snapshot pubblico dei beni confiscati con una regola
 * intenzionalmente fail-closed. L'API ANBSC pubblica `latitudine_comune` e
 * `longitudine_comune`: sono coordinate del Comune e non del singolo bene.
 * Non vengono quindi trasformate in punti asset_location.
 */
export function buildConfiscatedAssetsSnapshot({
  inAdministration,
  destined,
  sourceModified,
  sourceDatasetUrl,
}: BuildConfiscatedAssetsSnapshotOptions): ConfiscatedAssetsSnapshot {
  if (!sourceModified.trim()) {
    throw new Error("ANBSC catalog is missing dct:modified");
  }

  const inAdministrationDataset = readDataset(
    inAdministration,
    "ANBSC in_amministrazione",
  );
  const destinedDataset = readDataset(destined, "ANBSC destinato");
  const seenIds = new Set<string>();
  const inAdministrationRecords = validateDatasetRecords(
    inAdministrationDataset,
    "In Amministrazione",
    seenIds,
  );
  const destinedRecords = validateDatasetRecords(
    destinedDataset,
    "Destinato",
    seenIds,
  );
  const records = [...inAdministrationRecords, ...destinedRecords];

  const exclusions = {
    municipal_centroid_only: 0,
    missing_asset_coordinates: 0,
    asset_coordinates_pending_review: 0,
  };

  for (const record of records) {
    if (hasFinitePair(record, ASSET_LATITUDE_KEYS, ASSET_LONGITUDE_KEYS)) {
      exclusions.asset_coordinates_pending_review += 1;
      continue;
    }
    if (hasFinitePair(record, ["latitudine_comune"], ["longitudine_comune"])) {
      exclusions.municipal_centroid_only += 1;
      continue;
    }
    exclusions.missing_asset_coordinates += 1;
  }

  return {
    type: "FeatureCollection",
    features: [],
    metadata: {
      layer_id: "confiscated-assets",
      entity_type: "confiscated_asset",
      input_records: records.length,
      published_features: 0,
      excluded_records: records.length,
      exclusions,
      publication_policy:
        "Fail-closed: le coordinate comunali ANBSC non sono posizioni dei singoli beni. Sono pubblicate solo localizzazioni asset-level con provenienza e verifica coerenti; nessun record della presente fotografia supera ancora il criterio.",
      source_dataset_label:
        "ANBSC — beni immobili in amministrazione e destinati (Comune di Lamezia Terme)",
      source_dataset_url: sourceDatasetUrl,
      source_modified: sourceModified,
      source_counts: {
        in_administration: inAdministrationRecords.length,
        destined: destinedRecords.length,
      },
      licence: "Italian Open Data License v2.0",
      licence_url:
        "https://www.dati.gov.it/content/italian-open-data-license-v20",
      automatic_geocoder: "not used",
      publication_note:
        "Snapshot tecnicamente disponibile ma privo di feature: collocare ogni bene sul centroide comunale produrrebbe una localizzazione falsa. I conteggi descrivono la fonte ANBSC, non una mappa puntuale.",
    },
  };
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function buildSpatialPublicationManifest(options: {
  generatedAt: string;
  municipalBoundaryJson: string;
  municipalFeatureCount: number;
  censusSectionsJson: string;
  censusFeatureCount: number;
  confiscatedAssetsJson: string;
  confiscatedAssetsSnapshot: ConfiscatedAssetsSnapshot;
}): SpatialPublicationManifest {
  if (!Number.isFinite(Date.parse(options.generatedAt))) {
    throw new Error("generatedAt must be an ISO date-time");
  }

  return {
    schema_version: "1.0",
    generated_at: options.generatedAt,
    scope: {
      municipality: LAMEZIA_MUNICIPALITY,
      istat_code: LAMEZIA_ISTAT_CODE,
    },
    publication_policy: "default-deny",
    layers: [
      {
        layer_id: "municipal-boundary",
        data_path:
          "/data/processed/territorio/lamezia_confine_comunale.geojson",
        media_type: "application/geo+json",
        distribution_status: "published",
        content_status: "populated",
        feature_count: options.municipalFeatureCount,
        excluded_feature_count: 0,
        sha256: sha256(options.municipalBoundaryJson),
        source_label: "OpenStreetMap / Nominatim",
        licence: "ODbL 1.0",
        source_modified: null,
        publication_note:
          "Perimetro amministrativo di riferimento; non sostituisce una base ufficiale più autorevole che dovesse diventare disponibile.",
      },
      {
        layer_id: "census-sections",
        data_path:
          "/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson",
        media_type: "application/geo+json",
        distribution_status: "published",
        content_status: "populated",
        feature_count: options.censusFeatureCount,
        excluded_feature_count: 0,
        sha256: sha256(options.censusSectionsJson),
        source_label:
          "ISTAT — Basi territoriali 2021 e dati per sezioni di censimento 2023",
        licence: "CC BY 4.0 unless otherwise indicated by ISTAT",
        source_modified: "geometrie 2021; indicatori 2023",
        publication_note:
          "I valori mancanti restano distinti dallo zero; la copertura degli indicatori è documentata nei metadati associati.",
      },
      {
        layer_id: "confiscated-assets",
        data_path: "/data/processed/territorio/beni_confiscati_lamezia.geojson",
        media_type: "application/geo+json",
        distribution_status: "published",
        content_status: "empty_by_policy",
        feature_count: 0,
        excluded_feature_count:
          options.confiscatedAssetsSnapshot.metadata.excluded_records,
        sha256: sha256(options.confiscatedAssetsJson),
        source_label:
          options.confiscatedAssetsSnapshot.metadata.source_dataset_label,
        licence: options.confiscatedAssetsSnapshot.metadata.licence,
        source_modified:
          options.confiscatedAssetsSnapshot.metadata.source_modified,
        publication_note:
          options.confiscatedAssetsSnapshot.metadata.publication_note,
      },
    ],
  };
}

export function isFeatureCollection(
  value: unknown,
): value is GeoJsonFeatureCollection {
  if (!value || typeof value !== "object") return false;
  const collection = value as Partial<GeoJsonFeatureCollection>;
  return (
    collection.type === "FeatureCollection" &&
    Array.isArray(collection.features)
  );
}
