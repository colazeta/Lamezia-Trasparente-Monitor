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
  sourcePages?: {
    geometries?: string;
    variables?: string;
    legalNotes?: string;
  };
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

export type AtlanteDistributionBin = {
  index: number;
  min: number;
  max: number;
  count: number;
  label: string;
};

export type AtlanteDistributionSummary = {
  bins: AtlanteDistributionBin[];
  totalCount: number;
  availableCount: number;
  missingCount: number;
  zeroCount: number;
  sum: number | null;
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
};

export const ATLANTE_INDICATOR_CATEGORIES: Array<{
  id: AtlanteIndicatorCategoryId;
  label: string;
}> = [
  { id: "popolazione", label: "Popolazione" },
  { id: "eta", label: "Età" },
  { id: "cittadinanza", label: "Cittadinanza" },
  { id: "istruzione", label: "Istruzione" },
  { id: "lavoro", label: "Lavoro" },
  { id: "famiglie", label: "Famiglie" },
  { id: "abitazioni", label: "Abitazioni" },
  { id: "mobilita-auto", label: "Mobilità/auto" },
];

export const ATLANTE_INDICATORS: AtlanteIndicatorDefinition[] = [
  {
    id: "popolazione-residente",
    categoryId: "popolazione",
    categoryLabel: "Popolazione",
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
  {
    id: "quota-0-14",
    categoryId: "eta",
    categoryLabel: "Età",
    label: "Quota 0-14 anni",
    sourceKeys: ["quota_0_14"],
    unitLabel: "%",
    sourceDatasetLabel:
      "Dati per sezioni di censimento - Censimento permanente 2023",
  },
  {
    id: "quota-anziani",
    categoryId: "eta",
    categoryLabel: "Età",
    label: "Quota 65 anni e più",
    sourceKeys: ["quota_65_piu", "quota_anziani"],
    unitLabel: "%",
    sourceDatasetLabel:
      "Dati per sezioni di censimento - Censimento permanente 2023",
  },
  {
    id: "quota-stranieri",
    categoryId: "cittadinanza",
    categoryLabel: "Cittadinanza",
    label: "Quota residenti stranieri",
    sourceKeys: ["quota_stranieri"],
    unitLabel: "%",
    sourceDatasetLabel:
      "Dati per sezioni di censimento - Censimento permanente 2023",
  },
  {
    id: "quota-titoli-terziari",
    categoryId: "istruzione",
    categoryLabel: "Istruzione",
    label: "Quota titoli terziari",
    sourceKeys: ["quota_titoli_terziari"],
    unitLabel: "%",
    sourceDatasetLabel:
      "Dati per sezioni di censimento - Censimento permanente 2023",
  },
  {
    id: "occupati-15-64",
    categoryId: "lavoro",
    categoryLabel: "Lavoro",
    label: "Occupati 15-64 anni",
    sourceKeys: ["occupati_15_64", "p101"],
    unitLabel: "persone",
    sourceDatasetLabel:
      "Dati per sezioni di censimento - Censimento permanente 2023",
  },
  {
    id: "famiglie",
    categoryId: "famiglie",
    categoryLabel: "Famiglie",
    label: "Famiglie residenti",
    sourceKeys: ["famiglie_totale", "pf1"],
    unitLabel: "famiglie",
    sourceDatasetLabel:
      "Dati per sezioni di censimento - Censimento permanente 2023",
  },
  {
    id: "abitazioni",
    categoryId: "abitazioni",
    categoryLabel: "Abitazioni",
    label: "Abitazioni totali",
    sourceKeys: ["abitazioni_totali", "a8"],
    unitLabel: "abitazioni",
    sourceDatasetLabel:
      "Dati per sezioni di censimento - Censimento permanente 2023",
  },
  {
    id: "automobili",
    categoryId: "mobilita-auto",
    categoryLabel: "Mobilità/auto",
    label: "Automobili",
    sourceKeys: ["automobili_totale", "na1"],
    unitLabel: "automobili",
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
    "Dimostrativo: il file ISTAT processato non è ancora disponibile nella versione pubblica.",
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

export function getSectionPublicLabel(
  feature: AtlanteFeature | null | undefined,
) {
  const properties = getFeatureProperties(feature);
  const label =
    properties.area_territoriale ??
    properties.nome_area ??
    properties.quartiere ??
    properties.localita ??
    properties.toponimo_prevalente ??
    properties.label_public;

  if (typeof label === "string" && label.trim()) {
    return label.trim();
  }

  return formatSectionFallbackLabel(getSectionId(feature));
}

function formatSectionFallbackLabel(sectionId: string) {
  const trimmed = sectionId.trim();
  if (!trimmed || trimmed === "sezione non identificata") {
    return "Area censuaria non identificata";
  }

  const numericId = trimmed.replace(/\D/g, "");
  const shortId = numericId ? numericId.slice(-4) : trimmed.slice(-6);
  return `Area censuaria ${shortId}`;
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

export function buildAtlanteDistribution(
  values: Array<number | null>,
  requestedBinCount = 5,
): AtlanteDistributionSummary {
  const numericValues = values.filter(
    (value): value is number => value !== null && Number.isFinite(value),
  );
  const totalCount = values.length;
  const missingCount = totalCount - numericValues.length;
  const zeroCount = numericValues.filter((value) => value === 0).length;

  if (numericValues.length === 0) {
    return {
      bins: [],
      totalCount,
      availableCount: 0,
      missingCount,
      zeroCount,
      sum: null,
      min: null,
      max: null,
      mean: null,
      median: null,
    };
  }

  const sortedValues = [...numericValues].sort((a, b) => a - b);
  const min = sortedValues[0];
  const max = sortedValues[sortedValues.length - 1];
  const sum = sortedValues.reduce((total, value) => total + value, 0);
  const mean = sum / sortedValues.length;
  const median = calculateMedian(sortedValues);

  if (min === max) {
    return {
      bins: [
        {
          index: 0,
          min,
          max,
          count: numericValues.length,
          label: formatDistributionRange(min, max),
        },
      ],
      totalCount,
      availableCount: numericValues.length,
      missingCount,
      zeroCount,
      sum,
      min,
      max,
      mean,
      median,
    };
  }

  const bins = buildQuantileBins(sortedValues, requestedBinCount);

  return {
    bins,
    totalCount,
    availableCount: numericValues.length,
    missingCount,
    zeroCount,
    sum,
    min,
    max,
    mean,
    median,
  };
}

function buildQuantileBins(sortedValues: number[], requestedBinCount: number) {
  const targetBinCount = Math.max(
    1,
    Math.min(
      requestedBinCount,
      new Set(sortedValues).size,
      sortedValues.length,
    ),
  );
  const thresholds: number[] = [];

  for (let index = 1; index <= targetBinCount; index += 1) {
    const thresholdIndex =
      index === targetBinCount
        ? sortedValues.length - 1
        : Math.max(
            0,
            Math.ceil((index / targetBinCount) * sortedValues.length) - 1,
          );
    const threshold = sortedValues[thresholdIndex];
    const previousThreshold = thresholds[thresholds.length - 1];
    if (
      thresholds.length === 0 ||
      threshold > previousThreshold ||
      index === targetBinCount
    ) {
      thresholds.push(threshold);
    }
  }

  thresholds[thresholds.length - 1] = sortedValues[sortedValues.length - 1];

  const bins = thresholds.map<AtlanteDistributionBin>((threshold, index) => ({
    index,
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
    count: 0,
    label: "",
  }));

  for (const value of sortedValues) {
    const targetIndex = thresholds.findIndex((threshold) => value <= threshold);
    const bin = bins[Math.max(0, targetIndex)];
    bin.count += 1;
    bin.min = Math.min(bin.min, value);
    bin.max = Math.max(bin.max, value);
  }

  return bins
    .filter((bin) => bin.count > 0)
    .map((bin, index) => ({
      ...bin,
      index,
      label: formatDistributionRange(bin.min, bin.max),
    }));
}

function calculateMedian(sortedValues: number[]) {
  const midpoint = Math.floor(sortedValues.length / 2);
  return sortedValues.length % 2 === 0
    ? (sortedValues[midpoint - 1] + sortedValues[midpoint]) / 2
    : sortedValues[midpoint];
}

export function findAtlanteDistributionBin(
  value: number | null,
  bins: AtlanteDistributionBin[],
) {
  if (value === null) {
    return null;
  }

  const match = bins.find((bin, index) =>
    index === bins.length - 1
      ? value >= bin.min && value <= bin.max
      : value >= bin.min && value < bin.max,
  );

  return match?.index ?? null;
}

export function describeAtlanteDistributionPosition(
  value: number | null,
  bins: AtlanteDistributionBin[],
) {
  if (value === null) {
    return "Dato non disponibile per questa sezione.";
  }

  const binIndex = findAtlanteDistributionBin(value, bins);
  if (binIndex === null) {
    return "Valore fuori dalle fasce calcolate.";
  }

  if (bins.length <= 1) {
    return "Questa sezione ha lo stesso valore delle sezioni con dato disponibile.";
  }

  const position = (binIndex + 0.5) / bins.length;
  const band = position < 0.34 ? "bassa" : position < 0.67 ? "media" : "alta";
  return `Questa sezione rientra nella fascia ${band} della distribuzione tra le sezioni con dato disponibile.`;
}

function formatDistributionRange(min: number, max: number) {
  const formatter = new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: 0,
  });

  if (min === max) {
    return formatter.format(min);
  }

  return `${formatter.format(Math.ceil(min))} - ${formatter.format(
    Math.floor(max),
  )}`;
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

  const formatted = new Intl.NumberFormat("it-IT", {
    maximumFractionDigits: unitLabel === "%" ? 1 : 2,
  }).format(value);

  return unitLabel === "%" ? `${formatted}%` : `${formatted} ${unitLabel}`;
}
