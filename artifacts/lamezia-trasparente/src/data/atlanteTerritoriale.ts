import { ATLANTE_DEMO_GEOJSON } from "./atlanteTerritorialeDemo";

export const ATLANTE_EXPECTED_GEOJSON_PATH =
  "/data/processed/territorio/istat_sezioni_censimento_lamezia.geojson";
export const ATLANTE_EXPECTED_METADATA_PATH =
  "/data/processed/territorio/istat_sezioni_censimento_lamezia.metadata.json";
export const ATLANTE_EXPECTED_INDICATOR_DICTIONARY_PATH =
  "/data/processed/territorio/istat_indicator_dictionary.json";

export type AtlanteDataStatus = "official" | "demo";

export type AtlanteIndicatorCategoryId =
  | "popolazione"
  | "eta"
  | "cittadinanza"
  | "istruzione"
  | "lavoro"
  | "famiglie"
  | "abitazioni"
  | "mobilita-auto";

export type AtlantePosition = [number, number] | [number, number, number];

export type AtlanteGeometry =
  | {
      type: "Polygon";
      coordinates: AtlantePosition[][];
    }
  | {
      type: "MultiPolygon";
      coordinates: AtlantePosition[][][];
    };

export type AtlanteFeatureProperties = {
  sezione_censimento_id?: string | number | null;
  istat_municipal_code?: string | number | null;
  municipality?: string | null;
  matched_istat_2023_variables?: boolean;
  indicator_columns?: string[];
  indicators_istat_2023?: Record<string, string | number | null | undefined>;
  [key: string]: unknown;
};

export type AtlanteFeature = {
  type: "Feature";
  properties: AtlanteFeatureProperties | null;
  geometry: AtlanteGeometry | null;
};

export type AtlanteLayerMetadata = {
  datasetStatus?: AtlanteDataStatus | "demo";
  publicLabel: string;
  sourceInstitution: string;
  sourceDataset: string;
  sourceYear: string;
  territorialLevel: string;
  verificationStatus: string;
  knownLimits: string[];
  processingDate: string | null;
  qa?: {
    reportPath?: string;
    indicatorDictionaryPath?: string;
    populationValueCoverage?: {
      totalFeatures: number;
      availableCount: number;
      availableShare?: number;
      nullCount: number;
      nullShare?: number;
      zeroCount?: number;
    };
  };
};

export type AtlanteFeatureCollection = {
  type: "FeatureCollection";
  features: AtlanteFeature[];
  metadata?: Partial<AtlanteLayerMetadata>;
};

export type AtlanteIndicatorDefinition = {
  id: string;
  categoryId: AtlanteIndicatorCategoryId;
  categoryLabel: string;
  label: string;
  sourceKeys: string[];
  unitLabel: string;
  sourceDatasetLabel: string;
};

export type AtlanteLoadedLayer = {
  collection: AtlanteFeatureCollection;
  dataStatus: AtlanteDataStatus;
  metadata: AtlanteLayerMetadata;
  loadedFrom: string;
};

export const ATLANTE_INDICATOR_CATEGORIES: Array<{
  id: AtlanteIndicatorCategoryId;
  label: string;
}> = [
  { id: "popolazione", label: "popolazione" },
  { id: "eta", label: "eta" },
  { id: "cittadinanza", label: "cittadinanza" },
  { id: "istruzione", label: "istruzione" },
  { id: "lavoro", label: "lavoro" },
  { id: "famiglie", label: "famiglie" },
  { id: "abitazioni", label: "abitazioni" },
  { id: "mobilita-auto", label: "mobilita/auto" },
];

export const ATLANTE_INDICATORS: AtlanteIndicatorDefinition[] = [
  {
    id: "popolazione-residente",
    categoryId: "popolazione",
    categoryLabel: "popolazione",
    label: "Popolazione residente",
    sourceKeys: [
      "popolazione_totale",
      "popolazione_residente",
      "residenti",
      "p1",
      "popolazione_demo",
    ],
    unitLabel: "persone",
    sourceDatasetLabel:
      "Dati per sezioni di censimento - Censimento permanente 2023",
  },
];

export const ATLANTE_DEFAULT_METADATA: AtlanteLayerMetadata = {
  publicLabel: "Dato ufficiale ISTAT per sezione censuaria",
  sourceInstitution: "ISTAT",
  sourceDataset: "Basi territoriali 2021 e dati per sezioni di censimento 2023",
  sourceYear: "geometrie 2021, indicatori 2023",
  territorialLevel: "sezione di censimento",
  verificationStatus:
    "Fonte identificata; pubblicazione da validare contro le sezioni censuarie ISTAT ufficiali.",
  knownLimits: [
    "Gli indicatori saranno attivati solo dopo controllo dei campi ISTAT.",
    "Le sezioni catastali, OMI, CAP, fiscali o comunali non sono usate come base censuaria.",
    "Il layer Zornade resta un livello accessorio/non censuario e non viene usato in questa mappa.",
  ],
  processingDate: null,
};

const ATLANTE_DEMO_METADATA: AtlanteLayerMetadata = {
  ...ATLANTE_DEFAULT_METADATA,
  ...ATLANTE_DEMO_GEOJSON.metadata,
  datasetStatus: "demo",
  publicLabel: "Dato dimostrativo — non usare per analisi",
  sourceInstitution: "ISTAT",
  sourceDataset:
    "Dati dimostrativi per la pagina Atlante territoriale; non contiene sezioni censuarie reali.",
  sourceYear: "demo",
  territorialLevel: "sezione censuaria dimostrativa",
  verificationStatus:
    "Dimostrativo: il file ISTAT processato non e' ancora disponibile nella versione pubblica.",
  knownLimits:
    ATLANTE_DEMO_GEOJSON.metadata?.knownLimits ??
    ATLANTE_DEFAULT_METADATA.knownLimits,
  processingDate: ATLANTE_DEMO_GEOJSON.metadata?.processingDate ?? null,
};

export function isAtlanteFeatureCollection(
  value: unknown,
): value is AtlanteFeatureCollection {
  const candidate = value as Partial<AtlanteFeatureCollection> | null;
  return (
    candidate?.type === "FeatureCollection" && Array.isArray(candidate.features)
  );
}

export function normalizeAtlanteMetadata(
  collection: AtlanteFeatureCollection,
  dataStatus: AtlanteDataStatus,
  externalMetadata?: Partial<AtlanteLayerMetadata>,
): AtlanteLayerMetadata {
  if (dataStatus === "demo") {
    return ATLANTE_DEMO_METADATA;
  }

  const metadata = {
    ...(collection.metadata ?? {}),
    ...(externalMetadata ?? {}),
  };
  return {
    ...ATLANTE_DEFAULT_METADATA,
    ...metadata,
    datasetStatus: "official",
    publicLabel: coerceMetadataString(
      metadata.publicLabel,
      ATLANTE_DEFAULT_METADATA.publicLabel,
    ),
    sourceInstitution: coerceMetadataString(
      metadata.sourceInstitution,
      ATLANTE_DEFAULT_METADATA.sourceInstitution,
    ),
    sourceDataset: coerceMetadataString(
      metadata.sourceDataset,
      ATLANTE_DEFAULT_METADATA.sourceDataset,
    ),
    sourceYear: coerceMetadataString(
      metadata.sourceYear,
      ATLANTE_DEFAULT_METADATA.sourceYear,
    ),
    territorialLevel: coerceMetadataString(
      metadata.territorialLevel,
      ATLANTE_DEFAULT_METADATA.territorialLevel,
    ),
    verificationStatus: coerceMetadataString(
      metadata.verificationStatus,
      ATLANTE_DEFAULT_METADATA.verificationStatus,
    ),
    knownLimits:
      metadata.knownLimits && metadata.knownLimits.length > 0
        ? metadata.knownLimits
        : ATLANTE_DEFAULT_METADATA.knownLimits,
    processingDate:
      typeof metadata.processingDate === "string"
        ? metadata.processingDate
        : ATLANTE_DEFAULT_METADATA.processingDate,
  };
}

function coerceMetadataString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

async function loadAtlanteMetadata() {
  try {
    const response = await fetch(ATLANTE_EXPECTED_METADATA_PATH, {
      cache: "no-store",
    });
    if (!response.ok) {
      return undefined;
    }
    const parsed: unknown = await response.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return undefined;
    }
    return parsed as Partial<AtlanteLayerMetadata>;
  } catch {
    return undefined;
  }
}

export async function loadAtlanteLayer(): Promise<AtlanteLoadedLayer> {
  if (typeof fetch !== "function") {
    return buildDemoLayer();
  }

  try {
    const response = await fetch(ATLANTE_EXPECTED_GEOJSON_PATH, {
      cache: "no-store",
    });

    if (!response.ok) {
      return buildDemoLayer();
    }

    const parsed: unknown = await response.json();
    if (!isAtlanteFeatureCollection(parsed)) {
      return buildDemoLayer();
    }

    const metadata = await loadAtlanteMetadata();

    return {
      collection: parsed,
      dataStatus: "official",
      metadata: normalizeAtlanteMetadata(parsed, "official", metadata),
      loadedFrom: ATLANTE_EXPECTED_GEOJSON_PATH,
    };
  } catch {
    return buildDemoLayer();
  }
}

export function buildDemoLayer(): AtlanteLoadedLayer {
  return {
    collection: ATLANTE_DEMO_GEOJSON,
    dataStatus: "demo",
    metadata: normalizeAtlanteMetadata(ATLANTE_DEMO_GEOJSON, "demo"),
    loadedFrom: "src/data/atlanteTerritorialeDemo.ts",
  };
}

export function getFeatureProperties(
  feature: AtlanteFeature | null | undefined,
) {
  return feature?.properties ?? {};
}

export function getSectionId(feature: AtlanteFeature | null | undefined) {
  const properties = getFeatureProperties(feature);
  return String(
    properties.sezione_censimento_id ??
      properties.section_id ??
      properties.id ??
      "sezione non identificata",
  );
}

export function readIndicatorValue(
  feature: AtlanteFeature,
  definition: AtlanteIndicatorDefinition,
): number | null {
  const properties = getFeatureProperties(feature);
  const indicators = properties.indicators_istat_2023 ?? {};

  for (const key of definition.sourceKeys) {
    const directValue = indicators[key] ?? properties[key];
    const parsed = parseNumericValue(directValue);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
}

export function parseNumericValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function featureHasIndicator(
  feature: AtlanteFeature,
  definition: AtlanteIndicatorDefinition,
) {
  return readIndicatorValue(feature, definition) !== null;
}

export function getAvailableIndicators(collection: AtlanteFeatureCollection) {
  return ATLANTE_INDICATORS.filter((definition) =>
    collection.features.some((feature) =>
      featureHasIndicator(feature, definition),
    ),
  );
}

export function formatAtlanteValue(value: number | null, unitLabel: string) {
  if (value === null) {
    return "dato non disponibile";
  }

  return `${new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 2,
  }).format(value)} ${unitLabel}`;
}
