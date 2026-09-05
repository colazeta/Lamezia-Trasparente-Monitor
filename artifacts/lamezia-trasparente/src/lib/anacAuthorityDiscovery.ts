import {
  ANAC_OPEN_DATA_CATALOG_URL,
  type AnacBdncpRecord,
  type AnacBdncpSyncStatus,
} from "./anacBdncpSync";

export const ANAC_AUTHORITY_DISCOVERY_SCHEMA_VERSION =
  "anac-authority-discovery.v1" as const;

export const LAMEZIA_CONTRACTING_AUTHORITY_TAX_ID = "00301390795" as const;

export const ANAC_CIG_DATASET_PATTERN_URL =
  "https://dati.anticorruzione.it/opendata/dataset/cig-{year}";

export type AnacAuthorityDiscoveryFailureCategory =
  | "source-unavailable"
  | "unexpected-format"
  | "no-published-resource"
  | null;

export interface AnacAuthorityArchiveCoverage {
  period: string;
  year: number;
  url: string;
  retrievedAt: string;
  recordsScanned: number;
  matchedRecords: number;
}

export interface AnacAuthorityDiscoverySnapshot {
  schemaVersion: typeof ANAC_AUTHORITY_DISCOVERY_SCHEMA_VERSION;
  generatedAt: string;
  status: AnacBdncpSyncStatus;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  failureCategory: AnacAuthorityDiscoveryFailureCategory;
  targetAuthority: {
    taxId: string;
    label: string;
  };
  source: {
    id: "anac-open-data-cig-authority";
    label: string;
    catalogUrl: string;
    datasetPatternUrl: string;
    format: "csv-in-zip";
    acquisitionMode: "contracting-authority-tax-id";
  };
  requestedYears: number[];
  completedYears: number[];
  completedPeriods: string[];
  consultedArchives: AnacAuthorityArchiveCoverage[];
  recordsScanned: number;
  records: AnacBdncpRecord[];
  limitations: string[];
}

export const ANAC_AUTHORITY_DISCOVERY_LIMITATIONS = [
  "La discovery per stazione appaltante dipende dai dataset CIG ufficiali ANAC effettivamente pubblicati e consultati; la completezza storica viene dichiarata solo per gli anni completati.",
  "Un anno o mese non ancora acquisito resta esplicitamente fuori copertura e non viene interpretato come assenza di contratti.",
  "Il matching usa il codice fiscale della stazione appaltante dichiarato nel dataset ANAC; record con identificativo mancante o differente restano fuori dalla discovery automatica.",
  "I record CIG documentano procedure o lotti presenti nella fonte ANAC e non dimostrano da soli esecuzione, pagamenti, SAL o collaudo.",
] as const;

export function createPendingAnacAuthorityDiscoverySnapshot(
  generatedAt = new Date(0).toISOString(),
  taxId: string = LAMEZIA_CONTRACTING_AUTHORITY_TAX_ID,
): AnacAuthorityDiscoverySnapshot {
  return {
    schemaVersion: ANAC_AUTHORITY_DISCOVERY_SCHEMA_VERSION,
    generatedAt,
    status: "pending",
    lastAttemptAt: null,
    lastSuccessAt: null,
    failureCategory: null,
    targetAuthority: {
      taxId: normalizeTaxId(taxId),
      label: "Comune di Lamezia Terme",
    },
    source: {
      id: "anac-open-data-cig-authority",
      label: "ANAC open data — CIG per stazione appaltante",
      catalogUrl: ANAC_OPEN_DATA_CATALOG_URL,
      datasetPatternUrl: ANAC_CIG_DATASET_PATTERN_URL,
      format: "csv-in-zip",
      acquisitionMode: "contracting-authority-tax-id",
    },
    requestedYears: [],
    completedYears: [],
    completedPeriods: [],
    consultedArchives: [],
    recordsScanned: 0,
    records: [],
    limitations: [...ANAC_AUTHORITY_DISCOVERY_LIMITATIONS],
  };
}

export function validateAnacAuthorityDiscoverySnapshot(
  value: unknown,
): AnacAuthorityDiscoverySnapshot {
  if (!isRecord(value)) {
    throw new Error("ANAC authority discovery snapshot must be an object");
  }
  if (value.schemaVersion !== ANAC_AUTHORITY_DISCOVERY_SCHEMA_VERSION) {
    throw new Error("ANAC authority discovery snapshot has an unsupported schema");
  }
  if (!isSyncStatus(value.status) || !isIso(value.generatedAt)) {
    throw new Error("ANAC authority discovery snapshot has invalid status metadata");
  }
  if (!isNullableIso(value.lastAttemptAt) || !isNullableIso(value.lastSuccessAt)) {
    throw new Error("ANAC authority discovery snapshot has invalid attempt metadata");
  }
  if (!isFailureCategory(value.failureCategory)) {
    throw new Error("ANAC authority discovery snapshot has an invalid failure category");
  }
  if (!isRecord(value.targetAuthority) || !isRecord(value.source)) {
    throw new Error("ANAC authority discovery snapshot has invalid source metadata");
  }
  if (
    normalizeTaxId(value.targetAuthority.taxId) !== value.targetAuthority.taxId ||
    !isNonEmptyString(value.targetAuthority.label) ||
    value.source.id !== "anac-open-data-cig-authority" ||
    value.source.format !== "csv-in-zip" ||
    value.source.acquisitionMode !== "contracting-authority-tax-id" ||
    !isOfficialAnacUrl(value.source.catalogUrl) ||
    !isOfficialAnacDatasetPattern(value.source.datasetPatternUrl) ||
    !isNonEmptyString(value.source.label)
  ) {
    throw new Error("ANAC authority discovery snapshot has invalid source metadata");
  }
  if (
    !Array.isArray(value.requestedYears) ||
    !Array.isArray(value.completedYears) ||
    !Array.isArray(value.completedPeriods) ||
    !Array.isArray(value.consultedArchives) ||
    !Array.isArray(value.records) ||
    !Array.isArray(value.limitations) ||
    !isNonNegativeInteger(value.recordsScanned)
  ) {
    throw new Error("ANAC authority discovery snapshot has invalid collections");
  }

  const snapshot = value as unknown as AnacAuthorityDiscoverySnapshot;
  if (
    (snapshot.status === "pending" &&
      (snapshot.lastAttemptAt !== null || snapshot.lastSuccessAt !== null)) ||
    (snapshot.status === "current" && snapshot.lastSuccessAt === null) ||
    (snapshot.status === "stale" && snapshot.lastSuccessAt === null) ||
    (snapshot.status === "degraded" && snapshot.lastAttemptAt === null) ||
    (snapshot.status === "current" && snapshot.failureCategory !== null)
  ) {
    throw new Error("ANAC authority discovery snapshot has inconsistent status metadata");
  }

  assertUniqueSortedYears(snapshot.requestedYears, "requestedYears");
  assertUniqueSortedYears(snapshot.completedYears, "completedYears");
  if (
    snapshot.completedYears.some((year) => !snapshot.requestedYears.includes(year))
  ) {
    throw new Error("ANAC authority discovery completedYears exceed requestedYears");
  }
  assertUniqueSortedPeriods(snapshot.completedPeriods);

  const seenArchives = new Set<string>();
  for (const archive of snapshot.consultedArchives) {
    if (
      !/^20\d{2}-\d{2}$/u.test(archive.period) ||
      archive.year !== Number(archive.period.slice(0, 4)) ||
      !isOfficialAnacUrl(archive.url) ||
      !isIso(archive.retrievedAt) ||
      !isNonNegativeInteger(archive.recordsScanned) ||
      !isNonNegativeInteger(archive.matchedRecords) ||
      archive.matchedRecords > archive.recordsScanned ||
      seenArchives.has(archive.period)
    ) {
      throw new Error("ANAC authority discovery snapshot has an invalid archive entry");
    }
    seenArchives.add(archive.period);
  }

  const seenCigs = new Set<string>();
  for (const record of snapshot.records) {
    if (
      !isFormalCig(record.cig) ||
      seenCigs.has(record.cig) ||
      normalizeTaxId(record.contractingAuthorityTaxId) !==
        snapshot.targetAuthority.taxId ||
      !isOfficialAnacUrl(record.sourceArchiveUrl) ||
      !/^20\d{2}-\d{2}$/u.test(record.sourcePeriod) ||
      !isIso(record.acquiredAt)
    ) {
      throw new Error("ANAC authority discovery snapshot has an invalid record");
    }
    seenCigs.add(record.cig);
  }
  if (!snapshot.limitations.every(isNonEmptyString)) {
    throw new Error("ANAC authority discovery snapshot has invalid limitations");
  }
  return snapshot;
}

export function anacAuthorityHistoricalCoverage(
  snapshot: AnacAuthorityDiscoverySnapshot,
) {
  const referenceYear = new Date(snapshot.generatedAt).getUTCFullYear();
  const requestedClosedYears = snapshot.requestedYears.filter(
    (year) => year < referenceYear,
  );
  const requested = new Set(requestedClosedYears);
  const completed = new Set(
    snapshot.completedYears.filter((year) => year < referenceYear),
  );
  const missingYears = requestedClosedYears.filter((year) => !completed.has(year));
  return {
    requestedYears: requested.size,
    completedYears: completed.size,
    missingYears,
    historicalBackfillComplete:
      requested.size > 0 && missingYears.length === 0 && snapshot.status !== "degraded",
    discoveredUniqueCigs: snapshot.records.length,
  };
}

function normalizeTaxId(value: unknown): string {
  return typeof value === "string"
    ? value.replace(/\s+/gu, "").trim().toUpperCase()
    : "";
}

function isFormalCig(value: unknown): value is string {
  return typeof value === "string" && /^[A-Z0-9]{10}$/u.test(value);
}

function assertUniqueSortedYears(value: number[], label: string): void {
  if (
    value.some((year) => !Number.isInteger(year) || year < 2000 || year > 2100) ||
    new Set(value).size !== value.length ||
    value.some((year, index) => index > 0 && value[index - 1] > year)
  ) {
    throw new Error(`ANAC authority discovery ${label} must be unique and sorted`);
  }
}

function assertUniqueSortedPeriods(value: string[]): void {
  if (
    value.some((period) => !/^20\d{2}-(?:0[1-9]|1[0-2])$/u.test(period)) ||
    new Set(value).size !== value.length ||
    value.some((period, index) => index > 0 && value[index - 1] > period)
  ) {
    throw new Error("ANAC authority discovery completedPeriods must be unique and sorted");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSyncStatus(value: unknown): value is AnacBdncpSyncStatus {
  return ["pending", "current", "stale", "degraded"].includes(String(value));
}

function isFailureCategory(
  value: unknown,
): value is AnacAuthorityDiscoveryFailureCategory {
  return (
    value === null ||
    value === "source-unavailable" ||
    value === "unexpected-format" ||
    value === "no-published-resource"
  );
}

function isIso(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isNullableIso(value: unknown): value is string | null {
  return value === null || isIso(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOfficialAnacUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "anticorruzione.it" ||
        url.hostname.endsWith(".anticorruzione.it"))
    );
  } catch {
    return false;
  }
}

function isOfficialAnacDatasetPattern(value: unknown): value is string {
  return isOfficialAnacUrl(value) && value.includes("{year}");
}
