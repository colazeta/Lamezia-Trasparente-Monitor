import type {
  AnacBdncpRecord,
  AnacBdncpSyncSnapshot,
} from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";

export const CARDINAL_TARGET_VERSION = "0.0.8";
export const CARDINAL_READINESS_SCHEMA_VERSION = "cardinal-readiness.v1";
export const CARDINAL_ADAPTER_VERSION = "anac-cardinal-readiness.v1";
export const CARDINAL_DOCS_URL = "https://cardinal.readthedocs.io/en/latest/";

export type CardinalReadinessStatus =
  | "computable"
  | "partially-supported"
  | "unsupported";

export type CardinalMappingKind =
  | "source-backed"
  | "derived-local"
  | "not-mapped";

export interface CardinalIndicatorDefinition {
  code:
    | "R003"
    | "R018"
    | "R024"
    | "R025"
    | "R028"
    | "R030"
    | "R035"
    | "R036"
    | "R038"
    | "R048"
    | "R058";
  title: string;
  requiredOcdsPaths: readonly string[];
  optionalOcdsPaths?: readonly string[];
  scopeNote?: string;
}

export interface CardinalSourceFieldMapping {
  sourceField: keyof AnacBdncpRecord;
  ocdsPath: string | null;
  mappingKind: CardinalMappingKind;
  note: string;
}

export interface CardinalFieldCoverage extends CardinalSourceFieldMapping {
  nonNullRecords: number;
  totalRecords: number;
}

export interface CardinalIndicatorReadiness {
  code: CardinalIndicatorDefinition["code"];
  title: string;
  status: CardinalReadinessStatus;
  requiredOcdsPaths: string[];
  availableRequiredOcdsPaths: string[];
  missingRequiredOcdsPaths: string[];
  optionalOcdsPaths: string[];
  scopeNote: string | null;
}

export interface CardinalReadinessReport {
  schemaVersion: typeof CARDINAL_READINESS_SCHEMA_VERSION;
  generatedAt: string;
  target: {
    name: "OCDS Cardinal";
    version: typeof CARDINAL_TARGET_VERSION;
    ocdsVersion: "1.1";
    docsUrl: typeof CARDINAL_DOCS_URL;
  };
  adapter: {
    version: typeof CARDINAL_ADAPTER_VERSION;
    mode: "readiness-only";
  };
  source: {
    schemaVersion: AnacBdncpSyncSnapshot["schemaVersion"];
    status: AnacBdncpSyncSnapshot["status"];
    generatedAt: string;
    lastSuccessAt: string | null;
    failureCategory: AnacBdncpSyncSnapshot["failureCategory"];
    recordCount: number;
  };
  sourceFieldCoverage: CardinalFieldCoverage[];
  safelyProjectableOcdsPaths: string[];
  locallyDerivedOcdsPaths: string[];
  indicators: CardinalIndicatorReadiness[];
  summary: Record<CardinalReadinessStatus, number>;
  executionGate: {
    canRunIndicators: boolean;
    reason: string;
  };
  limitations: string[];
}

/**
 * Minimum source-backed OCDS fields needed to calculate each Cardinal 0.0.8
 * red flag. Global Cardinal requirements (for example a string `ocid`) are
 * handled separately so that a locally-derived process identifier does not
 * make an otherwise unsupported indicator look partially computable.
 */
export const CARDINAL_RED_FLAGS: readonly CardinalIndicatorDefinition[] = [
  {
    code: "R003",
    title: "Short submission period",
    requiredOcdsPaths: [
      "/tender/tenderPeriod/startDate",
      "/tender/tenderPeriod/endDate",
    ],
    optionalOcdsPaths: [
      "/tender/procurementMethod",
      "/tender/procurementMethodDetails",
    ],
  },
  {
    code: "R018",
    title: "Single bid received",
    requiredOcdsPaths: [
      "/tender/numberOfTenderers",
      "/tender/procurementMethod",
    ],
    scopeNote:
      "The ANAC procedure label is not treated as an OCDS procurementMethod until an explicit code mapping is documented.",
  },
  {
    code: "R024",
    title: "Price close to winning bid",
    requiredOcdsPaths: [
      "/bids/details[]/status",
      "/bids/details[]/value/amount",
      "/bids/details[]/value/currency",
      "/bids/details[]/tenderers[]/id",
      "/awards[]/status",
      "/awards[]/suppliers[]/id",
    ],
  },
  {
    code: "R025",
    title: "Excessive unsuccessful bids",
    requiredOcdsPaths: [
      "/bids/details[]/status",
      "/bids/details[]/tenderers[]/id",
      "/awards[]/status",
      "/awards[]/suppliers[]/id",
    ],
    scopeNote:
      "This is a cross-process tenderer indicator and requires enough observations to estimate its outlier fences meaningfully.",
  },
  {
    code: "R028",
    title: "Identical bid prices",
    requiredOcdsPaths: [
      "/bids/details[]/status",
      "/bids/details[]/value/amount",
      "/bids/details[]/value/currency",
      "/bids/details[]/tenderers[]/id",
    ],
  },
  {
    code: "R030",
    title: "Late bid won",
    requiredOcdsPaths: [
      "/bids/details[]/status",
      "/bids/details[]/date",
      "/bids/details[]/tenderers[]/id",
      "/tender/tenderPeriod/endDate",
      "/awards[]/status",
      "/awards[]/suppliers[]/id",
    ],
  },
  {
    code: "R035",
    title: "All except winning bid disqualified",
    requiredOcdsPaths: [
      "/bids/details[]/status",
      "/bids/details[]/tenderers[]/id",
      "/awards[]/status",
      "/awards[]/suppliers[]/id",
    ],
  },
  {
    code: "R036",
    title: "Lowest bid disqualified",
    requiredOcdsPaths: [
      "/bids/details[]/status",
      "/bids/details[]/value/amount",
      "/bids/details[]/value/currency",
      "/awards[]/status",
    ],
    scopeNote:
      "Price-comparison exclusions must be configured for procedures in which comparing bid prices is methodologically inappropriate.",
  },
  {
    code: "R038",
    title: "Excessive disqualified bids",
    requiredOcdsPaths: [
      "/bids/details[]/status",
      "/bids/details[]/tenderers[]/id",
    ],
    optionalOcdsPaths: ["/buyer/id", "/tender/procuringEntity/id"],
    scopeNote:
      "Buyer and procuring-entity outputs additionally require their identifiers; tenderer-level output can be assessed independently.",
  },
  {
    code: "R048",
    title: "Heterogeneous supplier",
    requiredOcdsPaths: [
      "/awards[]/status",
      "/awards[]/suppliers[]/id",
      "/awards[]/items[]/classification/id",
      "/awards[]/items[]/classification/scheme",
    ],
    scopeNote:
      "The classification must be a known hierarchical numeric taxonomy such as CPV or UNSPSC; no scheme is inferred from the code alone.",
  },
  {
    code: "R058",
    title: "Heavily discounted bid",
    requiredOcdsPaths: [
      "/bids/details[]/status",
      "/bids/details[]/value/amount",
      "/bids/details[]/value/currency",
      "/bids/details[]/tenderers[]/id",
      "/awards[]/status",
      "/awards[]/suppliers[]/id",
    ],
  },
] as const;

/**
 * Fields that can be projected without changing their source meaning.
 * `ocid` is deliberately classified as local/derived: a CIG can provide a
 * deterministic analysis key, but it is not presented as a registered OCDS
 * identifier issued by an OCDS publisher.
 */
export const ANAC_CARDINAL_FIELD_MAPPINGS: readonly CardinalSourceFieldMapping[] = [
  {
    sourceField: "cig",
    ocdsPath: "/ocid",
    mappingKind: "derived-local",
    note: "CIG can seed a deterministic local analysis key only; it is not published as an official OCDS OCID.",
  },
  {
    sourceField: "title",
    ocdsPath: "/tender/title",
    mappingKind: "source-backed",
    note: "ANAC lot subject can be preserved as the tender title when present.",
  },
  {
    sourceField: "contractingAuthority",
    ocdsPath: "/buyer/name",
    mappingKind: "source-backed",
    note: "The authority name is source-backed, but the current source does not provide the organization identifier Cardinal needs for organization-level outputs.",
  },
  {
    sourceField: "tenderAmount",
    ocdsPath: "/tender/value/amount",
    mappingKind: "source-backed",
    note: "ANAC lot amount is preserved as an amount; currency must be sourced separately before monetary Cardinal indicators can run.",
  },
  {
    sourceField: "procedureType",
    ocdsPath: "/tender/procurementMethodDetails",
    mappingKind: "source-backed",
    note: "The local ANAC procedure label is preserved as details. It is not silently converted to the OCDS procurementMethod codelist.",
  },
  {
    sourceField: "recordId",
    ocdsPath: null,
    mappingKind: "not-mapped",
    note: "The ANAC record/gara/lot identifier remains provenance metadata until a specific OCDS relationship is documented.",
  },
] as const;

export function buildCardinalReadinessReport(
  snapshot: AnacBdncpSyncSnapshot,
  generatedAt = new Date().toISOString(),
): CardinalReadinessReport {
  const sourceFieldCoverage = buildSourceFieldCoverage(snapshot.records);
  const safelyProjectableOcdsPaths = ANAC_CARDINAL_FIELD_MAPPINGS.filter(
    (mapping) => mapping.mappingKind === "source-backed" && mapping.ocdsPath,
  )
    .map((mapping) => mapping.ocdsPath as string)
    .sort();
  const locallyDerivedOcdsPaths = ANAC_CARDINAL_FIELD_MAPPINGS.filter(
    (mapping) => mapping.mappingKind === "derived-local" && mapping.ocdsPath,
  )
    .map((mapping) => mapping.ocdsPath as string)
    .sort();
  const available = new Set(safelyProjectableOcdsPaths);
  const indicators = CARDINAL_RED_FLAGS.map((definition) =>
    assessIndicatorReadiness(definition, available),
  );
  const summary: CardinalReadinessReport["summary"] = {
    computable: 0,
    "partially-supported": 0,
    unsupported: 0,
  };
  for (const indicator of indicators) summary[indicator.status] += 1;

  const canRunIndicators =
    snapshot.records.length > 0 && summary.computable > 0;
  const reason =
    snapshot.records.length === 0
      ? "No structured ANAC/BDNCP records are currently available in the snapshot."
      : summary.computable === 0
        ? "The current source-backed field set does not satisfy the minimum prerequisites of any Cardinal red flag."
        : "At least one Cardinal red flag has all minimum source-backed prerequisites.";

  return {
    schemaVersion: CARDINAL_READINESS_SCHEMA_VERSION,
    generatedAt,
    target: {
      name: "OCDS Cardinal",
      version: CARDINAL_TARGET_VERSION,
      ocdsVersion: "1.1",
      docsUrl: CARDINAL_DOCS_URL,
    },
    adapter: {
      version: CARDINAL_ADAPTER_VERSION,
      mode: "readiness-only",
    },
    source: {
      schemaVersion: snapshot.schemaVersion,
      status: snapshot.status,
      generatedAt: snapshot.generatedAt,
      lastSuccessAt: snapshot.lastSuccessAt,
      failureCategory: snapshot.failureCategory,
      recordCount: snapshot.records.length,
    },
    sourceFieldCoverage,
    safelyProjectableOcdsPaths,
    locallyDerivedOcdsPaths,
    indicators,
    summary,
    executionGate: {
      canRunIndicators,
      reason,
    },
    limitations: [
      "This report measures data readiness only. It does not calculate Cardinal indicators or infer procurement risk.",
      "A Cardinal red flag is a screening signal, not evidence of wrongdoing, corruption, favouritism or individual responsibility.",
      "Readiness is based on source-backed minimum fields. Local labels are not silently mapped to OCDS codelists.",
      "A locally-derived analysis identifier can support processing but is not represented as an official publisher-issued OCDS OCID.",
      "Statistical outlier indicators additionally require a sufficiently broad and comparable population; field completeness alone is not enough for substantive interpretation.",
      ...snapshot.limitations,
    ],
  };
}

export function assessIndicatorReadiness(
  definition: CardinalIndicatorDefinition,
  availableOcdsPaths: ReadonlySet<string>,
): CardinalIndicatorReadiness {
  const availableRequiredOcdsPaths = definition.requiredOcdsPaths.filter((path) =>
    availableOcdsPaths.has(path),
  );
  const missingRequiredOcdsPaths = definition.requiredOcdsPaths.filter(
    (path) => !availableOcdsPaths.has(path),
  );
  const status: CardinalReadinessStatus =
    missingRequiredOcdsPaths.length === 0
      ? "computable"
      : availableRequiredOcdsPaths.length > 0
        ? "partially-supported"
        : "unsupported";

  return {
    code: definition.code,
    title: definition.title,
    status,
    requiredOcdsPaths: [...definition.requiredOcdsPaths],
    availableRequiredOcdsPaths,
    missingRequiredOcdsPaths,
    optionalOcdsPaths: [...(definition.optionalOcdsPaths ?? [])],
    scopeNote: definition.scopeNote ?? null,
  };
}

export function buildSourceFieldCoverage(
  records: readonly AnacBdncpRecord[],
): CardinalFieldCoverage[] {
  return ANAC_CARDINAL_FIELD_MAPPINGS.map((mapping) => ({
    ...mapping,
    nonNullRecords: records.filter((record) =>
      hasSourceValue(record[mapping.sourceField]),
    ).length,
    totalRecords: records.length,
  }));
}

function hasSourceValue(value: AnacBdncpRecord[keyof AnacBdncpRecord]): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return Number.isFinite(value);
}
