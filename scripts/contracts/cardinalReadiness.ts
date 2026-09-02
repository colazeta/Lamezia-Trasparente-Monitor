import type {
  AnacBdncpRecord,
  AnacBdncpSyncSnapshot,
} from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";

export const CARDINAL_TARGET_VERSION = "0.0.8";
export const CARDINAL_READINESS_SCHEMA_VERSION = "cardinal-readiness.v2";
export const CARDINAL_ADAPTER_VERSION = "anac-cardinal-readiness.v2";
export const CARDINAL_DOCS_URL = "https://cardinal.readthedocs.io/en/latest/";

export type CardinalReadinessStatus =
  | "computable"
  | "partially-supported"
  | "unsupported";

export type CardinalMappingKind =
  | "source-backed"
  | "conditional-semantic"
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
  recordCoverage: {
    totalRecords: number;
    computableRecords: number;
  };
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
  conditionallyProjectableOcdsPaths: string[];
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
    scopeNote:
      "ANAC publicationDate is used as tenderPeriod.startDate only for records that independently identify an open procedure; it is not promoted for invitation-based or otherwise ambiguous procedures.",
  },
  {
    code: "R018",
    title: "Single bid received",
    requiredOcdsPaths: [
      "/tender/numberOfTenderers",
      "/tender/procurementMethod",
    ],
    scopeNote:
      "An open ANAC procedure can be mapped to OCDS procurementMethod=open only when code and label agree. numberOfTenderers remains unavailable in the current CIG feed.",
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
      "The source CPV is not promoted to an award-item classification: a lot-level prevalent CPV and an awarded item are different semantic objects.",
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
 * `source-backed` mappings preserve source semantics directly.
 * `conditional-semantic` mappings require a record-level rule before an OCDS
 * meaning is asserted. In particular, publicationDate is not automatically a
 * tender-period start date and procedureCode is not automatically an OCDS
 * procurementMethod.
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
    note: "The authority name is source-backed.",
  },
  {
    sourceField: "contractingAuthorityCode",
    ocdsPath: null,
    mappingKind: "not-mapped",
    note: "The AUSA code is retained as a source identifier but is not silently used as an OCDS party id.",
  },
  {
    sourceField: "contractingAuthorityTaxId",
    ocdsPath: null,
    mappingKind: "not-mapped",
    note: "The authority tax identifier is retained source-side until the OCDS identifier scheme and party relationship are explicit.",
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
    note: "The ANAC procedure label is preserved as details.",
  },
  {
    sourceField: "procedureCode",
    ocdsPath: "/tender/procurementMethod",
    mappingKind: "conditional-semantic",
    note: "Only a code/label pair independently identifying an open procedure is currently projected to OCDS procurementMethod=open; other values remain unmapped.",
  },
  {
    sourceField: "publicationDate",
    ocdsPath: "/tender/tenderPeriod/startDate",
    mappingKind: "conditional-semantic",
    note: "Publication date is projected to tenderPeriod.startDate only for a verified open-procedure record.",
  },
  {
    sourceField: "submissionDeadline",
    ocdsPath: "/tender/tenderPeriod/endDate",
    mappingKind: "source-backed",
    note: "ANAC offer-submission deadline directly supplies the end of the submission period when present.",
  },
  {
    sourceField: "cpvCode",
    ocdsPath: null,
    mappingKind: "not-mapped",
    note: "The prevalent lot-level CPV is retained for benchmarking but is not represented as an award-item classification.",
  },
  {
    sourceField: "cpvDescription",
    ocdsPath: null,
    mappingKind: "not-mapped",
    note: "CPV description is retained as source metadata.",
  },
  {
    sourceField: "cpvIsPrimary",
    ocdsPath: null,
    mappingKind: "not-mapped",
    note: "The ANAC prevalent-CPV flag is retained to select the representative lot classification.",
  },
  {
    sourceField: "outcomeCode",
    ocdsPath: null,
    mappingKind: "not-mapped",
    note: "Procedure outcome code is not sufficient by itself to construct an OCDS award.",
  },
  {
    sourceField: "outcome",
    ocdsPath: null,
    mappingKind: "not-mapped",
    note: "Procedure outcome text is retained but not converted to award status without an award-level source.",
  },
  {
    sourceField: "outcomeDate",
    ocdsPath: null,
    mappingKind: "not-mapped",
    note: "Outcome communication date is retained as source metadata.",
  },
  {
    sourceField: "recordId",
    ocdsPath: null,
    mappingKind: "not-mapped",
    note: "The ANAC gara/lot identifier remains provenance metadata until a specific OCDS relationship is documented.",
  },
] as const;

export function buildCardinalReadinessReport(
  snapshot: AnacBdncpSyncSnapshot,
  generatedAt = new Date().toISOString(),
): CardinalReadinessReport {
  const sourceFieldCoverage = buildSourceFieldCoverage(snapshot.records);
  const safelyProjectableOcdsPaths = uniqueMappedPaths("source-backed");
  const conditionallyProjectableOcdsPaths = uniqueMappedPaths(
    "conditional-semantic",
  );
  const locallyDerivedOcdsPaths = uniqueMappedPaths("derived-local");
  const indicators = CARDINAL_RED_FLAGS.map((definition) =>
    assessIndicatorAcrossRecords(definition, snapshot.records),
  );
  const summary: CardinalReadinessReport["summary"] = {
    computable: 0,
    "partially-supported": 0,
    unsupported: 0,
  };
  for (const indicator of indicators) summary[indicator.status] += 1;

  const canRunIndicators = summary.computable > 0;
  const reason =
    snapshot.records.length === 0
      ? "No structured ANAC/BDNCP records are currently available in the snapshot."
      : summary.computable === 0
        ? "No current record satisfies all minimum source-backed and semantically validated prerequisites of a Cardinal red flag."
        : "At least one current record satisfies all minimum prerequisites of at least one Cardinal red flag.";

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
    conditionallyProjectableOcdsPaths,
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
      "Readiness is evaluated at record level: required paths must co-occur on the same procurement record before an indicator is marked computable.",
      "ANAC publication date is not treated as a tender-period start date unless code and label independently support an open-procedure interpretation.",
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
  const result = assessPaths(definition, availableOcdsPaths);
  return {
    ...result,
    recordCoverage: {
      totalRecords: 1,
      computableRecords: result.status === "computable" ? 1 : 0,
    },
  };
}

export function assessIndicatorAcrossRecords(
  definition: CardinalIndicatorDefinition,
  records: readonly AnacBdncpRecord[],
): CardinalIndicatorReadiness {
  const union = new Set<string>();
  let computableRecords = 0;

  for (const record of records) {
    const paths = buildCardinalRecordOcdsPaths(record);
    for (const path of paths) union.add(path);
    if (definition.requiredOcdsPaths.every((path) => paths.has(path))) {
      computableRecords += 1;
    }
  }

  const pathAssessment = assessPaths(definition, union);
  const status: CardinalReadinessStatus =
    computableRecords > 0
      ? "computable"
      : pathAssessment.availableRequiredOcdsPaths.length > 0
        ? "partially-supported"
        : "unsupported";

  return {
    ...pathAssessment,
    status,
    recordCoverage: {
      totalRecords: records.length,
      computableRecords,
    },
  };
}

export function buildCardinalRecordOcdsPaths(
  record: AnacBdncpRecord,
): ReadonlySet<string> {
  const paths = new Set<string>();

  for (const mapping of ANAC_CARDINAL_FIELD_MAPPINGS) {
    if (
      mapping.mappingKind === "source-backed" &&
      mapping.ocdsPath &&
      hasSourceValue(record[mapping.sourceField])
    ) {
      paths.add(mapping.ocdsPath);
    }
  }

  if (inferOcdsProcurementMethod(record) === "open") {
    paths.add("/tender/procurementMethod");
    if (hasValidDate(record.publicationDate)) {
      paths.add("/tender/tenderPeriod/startDate");
    }
  }

  return paths;
}

export function inferOcdsProcurementMethod(
  record: AnacBdncpRecord,
): "open" | null {
  const code = record.procedureCode?.trim().toLowerCase() ?? "";
  const label = normalizeProcedureLabel(record.procedureType);
  const labelIsOpen = label === "APERTA" || label === "PROCEDURA APERTA";
  const codeIsOpen = code === "open" || code === "1";
  return codeIsOpen && labelIsOpen ? "open" : null;
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

function assessPaths(
  definition: CardinalIndicatorDefinition,
  availableOcdsPaths: ReadonlySet<string>,
): Omit<CardinalIndicatorReadiness, "recordCoverage"> {
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

function uniqueMappedPaths(kind: CardinalMappingKind): string[] {
  return Array.from(
    new Set(
      ANAC_CARDINAL_FIELD_MAPPINGS.filter(
        (mapping) => mapping.mappingKind === kind && mapping.ocdsPath,
      ).map((mapping) => mapping.ocdsPath as string),
    ),
  ).sort();
}

function hasSourceValue(value: AnacBdncpRecord[keyof AnacBdncpRecord]): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "boolean") return true;
  return Number.isFinite(value);
}

function hasValidDate(value: string | null): boolean {
  return value !== null && !Number.isNaN(Date.parse(value));
}

function normalizeProcedureLabel(value: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .trim()
    .replace(/\s+/gu, " ")
    .toUpperCase();
}
