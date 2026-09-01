import { classifyProcurementIdentifier } from "./procurementIdentifiers";

export const ANAC_BDNCP_SYNC_SCHEMA_VERSION = "anac-bdncp-sync.v1";
export const ANAC_BDNCP_CONNECTION_SCHEMA_VERSION = "anac-bdncp-connection.v1";

export const ANAC_OPEN_DATA_CATALOG_URL =
  "https://dati.anticorruzione.it/opendata";
export const ANAC_CIG_DELTA_DATASET_URL =
  "https://dati.anticorruzione.it/opendata/dataset/cig";
export const ANAC_BDNCP_PUBLICITY_URL =
  "https://pubblicitalegale.anticorruzione.it/bdncp";

export type AnacBdncpSyncStatus = "pending" | "current" | "stale" | "degraded";

export type AnacBdncpFailureCategory =
  | "source-unavailable"
  | "unexpected-format"
  | "no-published-archive"
  | null;

export interface AnacBdncpRecord {
  cig: string;
  title: string | null;
  contractingAuthority: string | null;
  tenderAmount: number | null;
  procedureType: string | null;
  recordId: string | null;
  sourceArchiveUrl: string;
  sourcePeriod: string;
  acquiredAt: string;
}

export interface AnacBdncpConsultedArchive {
  period: string;
  url: string;
  retrievedAt: string;
  recordsScanned: number;
  matchedRecords: number;
}

export interface AnacBdncpSyncSnapshot {
  schemaVersion: typeof ANAC_BDNCP_SYNC_SCHEMA_VERSION;
  generatedAt: string;
  status: AnacBdncpSyncStatus;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  failureCategory: AnacBdncpFailureCategory;
  source: {
    id: "anac-open-data-cig-delta";
    label: string;
    datasetUrl: string;
    catalogUrl: string;
    bdncpUrl: string;
    format: "csv-in-zip";
    lookbackMonths: number;
  };
  attemptedArchives: number;
  unavailableArchives: number;
  trackedCigs: string[];
  consultedArchives: AnacBdncpConsultedArchive[];
  records: AnacBdncpRecord[];
  limitations: string[];
}

export interface AnacBdncpConnectionStatus {
  schemaVersion: typeof ANAC_BDNCP_CONNECTION_SCHEMA_VERSION;
  status: AnacBdncpSyncStatus;
  generatedAt: string;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  failureCategory: AnacBdncpFailureCategory;
  source: AnacBdncpSyncSnapshot["source"];
  coverage: {
    trackedUniqueCigs: number;
    directCigLinks: number;
    structuredMatches: number;
    unmatchedInConsultedWindow: number;
    consultedArchives: number;
    consultedPeriods: string[];
  };
  matchedCigs: string[];
  unmatchedCigs: string[];
  matches: AnacBdncpRecord[];
  limitations: string[];
}

export const ANAC_BDNCP_PUBLIC_LIMITATIONS = [
  "La copertura strutturata riguarda soltanto i pacchetti mensili ANAC effettivamente consultati e non costituisce uno storico completo della BDNCP.",
  "Un CIG non trovato nei pacchetti consultati non risulta per questo assente dalla BDNCP.",
  "Un'indisponibilita temporanea della fonte ANAC non implica assenza di contratti: viene conservato l'ultimo snapshot valido.",
  "Gli importi ANAC, quando presenti, sono importi del lotto e non vengono sommati agli importi ricavati dagli atti dell'Albo.",
] as const;

export function createPendingAnacBdncpSnapshot(
  generatedAt = new Date(0).toISOString(),
): AnacBdncpSyncSnapshot {
  return {
    schemaVersion: ANAC_BDNCP_SYNC_SCHEMA_VERSION,
    generatedAt,
    status: "pending",
    lastAttemptAt: null,
    lastSuccessAt: null,
    failureCategory: null,
    source: {
      id: "anac-open-data-cig-delta",
      label: "ANAC open data — aggiornamenti CIG",
      datasetUrl: ANAC_CIG_DELTA_DATASET_URL,
      catalogUrl: ANAC_OPEN_DATA_CATALOG_URL,
      bdncpUrl: ANAC_BDNCP_PUBLICITY_URL,
      format: "csv-in-zip",
      lookbackMonths: 12,
    },
    attemptedArchives: 0,
    unavailableArchives: 0,
    trackedCigs: [],
    consultedArchives: [],
    records: [],
    limitations: [...ANAC_BDNCP_PUBLIC_LIMITATIONS],
  };
}

export function validateAnacBdncpSyncSnapshot(
  value: unknown,
): AnacBdncpSyncSnapshot {
  if (!isRecord(value)) {
    throw new Error("ANAC/BDNCP sync snapshot must be an object");
  }
  if (value.schemaVersion !== ANAC_BDNCP_SYNC_SCHEMA_VERSION) {
    throw new Error("ANAC/BDNCP sync snapshot has an unsupported schema");
  }
  if (!isSyncStatus(value.status)) {
    throw new Error("ANAC/BDNCP sync snapshot has an invalid status");
  }
  if (!isIso(value.generatedAt)) {
    throw new Error("ANAC/BDNCP sync snapshot has an invalid generatedAt");
  }
  if (
    !isNullableIso(value.lastAttemptAt) ||
    !isNullableIso(value.lastSuccessAt)
  ) {
    throw new Error("ANAC/BDNCP sync snapshot has invalid attempt metadata");
  }
  if (!isFailureCategory(value.failureCategory)) {
    throw new Error("ANAC/BDNCP sync snapshot has an invalid failure category");
  }
  if (!isRecord(value.source)) {
    throw new Error("ANAC/BDNCP sync snapshot has no source metadata");
  }
  if (
    value.source.id !== "anac-open-data-cig-delta" ||
    value.source.format !== "csv-in-zip" ||
    !isOfficialAnacUrl(value.source.datasetUrl) ||
    !isOfficialAnacUrl(value.source.catalogUrl) ||
    !isOfficialAnacUrl(value.source.bdncpUrl) ||
    !isNonEmptyString(value.source.label) ||
    !isPositiveInteger(value.source.lookbackMonths) ||
    value.source.lookbackMonths > 60
  ) {
    throw new Error("ANAC/BDNCP sync snapshot has invalid source metadata");
  }
  if (
    !isNonNegativeInteger(value.attemptedArchives) ||
    !isNonNegativeInteger(value.unavailableArchives) ||
    !Array.isArray(value.trackedCigs) ||
    !Array.isArray(value.consultedArchives) ||
    !Array.isArray(value.records) ||
    !Array.isArray(value.limitations)
  ) {
    throw new Error("ANAC/BDNCP sync snapshot has invalid collections");
  }

  const snapshot = value as unknown as AnacBdncpSyncSnapshot;
  if (
    (snapshot.status === "pending" &&
      (snapshot.lastAttemptAt !== null || snapshot.lastSuccessAt !== null)) ||
    (snapshot.status === "current" && snapshot.lastSuccessAt === null) ||
    (snapshot.status === "stale" && snapshot.lastSuccessAt === null) ||
    (snapshot.status === "degraded" && snapshot.lastAttemptAt === null) ||
    (snapshot.status === "current" && snapshot.failureCategory !== null)
  ) {
    throw new Error(
      "ANAC/BDNCP sync snapshot has inconsistent status metadata",
    );
  }
  if (snapshot.unavailableArchives > snapshot.attemptedArchives) {
    throw new Error("ANAC/BDNCP sync snapshot has invalid archive totals");
  }
  if (new Set(snapshot.trackedCigs).size !== snapshot.trackedCigs.length) {
    throw new Error("ANAC/BDNCP sync snapshot has duplicate tracked CIGs");
  }
  for (const cig of snapshot.trackedCigs) {
    if (normalizeFormalCig(cig) !== cig) {
      throw new Error(`ANAC/BDNCP sync snapshot has invalid CIG: ${cig}`);
    }
  }
  for (const archive of snapshot.consultedArchives) {
    if (
      !/^\d{4}-\d{2}$/u.test(archive.period) ||
      !isOfficialAnacUrl(archive.url) ||
      !isIso(archive.retrievedAt) ||
      !isNonNegativeInteger(archive.recordsScanned) ||
      !isNonNegativeInteger(archive.matchedRecords) ||
      archive.matchedRecords > archive.recordsScanned
    ) {
      throw new Error("ANAC/BDNCP sync snapshot has an invalid archive entry");
    }
  }
  for (const record of snapshot.records) {
    if (
      normalizeFormalCig(record.cig) !== record.cig ||
      !isOfficialAnacUrl(record.sourceArchiveUrl) ||
      !/^\d{4}-\d{2}$/u.test(record.sourcePeriod) ||
      !isIso(record.acquiredAt) ||
      !isNullableString(record.title) ||
      !isNullableString(record.contractingAuthority) ||
      !isNullableString(record.procedureType) ||
      !isNullableString(record.recordId) ||
      (record.tenderAmount !== null &&
        (!Number.isFinite(record.tenderAmount) || record.tenderAmount < 0))
    ) {
      throw new Error("ANAC/BDNCP sync snapshot has an invalid record");
    }
  }
  if (!snapshot.limitations.every(isNonEmptyString)) {
    throw new Error("ANAC/BDNCP sync snapshot has invalid limitations");
  }

  return snapshot;
}

export function buildAnacBdncpConnectionStatus(
  snapshot: AnacBdncpSyncSnapshot,
  cigValues: Array<string | null | undefined>,
): AnacBdncpConnectionStatus {
  const trackedCigs = Array.from(
    new Set(cigValues.map(normalizeFormalCig).filter(isNonNull)),
  ).sort();
  const trackedSet = new Set(trackedCigs);
  const latestByCig = new Map<string, AnacBdncpRecord>();

  for (const record of snapshot.records) {
    if (!trackedSet.has(record.cig)) continue;
    const previous = latestByCig.get(record.cig);
    if (!previous || previous.acquiredAt < record.acquiredAt) {
      latestByCig.set(record.cig, record);
    }
  }

  const matches = Array.from(latestByCig.values()).sort((a, b) =>
    a.cig.localeCompare(b.cig),
  );
  const matchedCigs = matches.map((record) => record.cig);
  const matchedSet = new Set(matchedCigs);
  const unmatchedCigs = trackedCigs.filter((cig) => !matchedSet.has(cig));
  const limitations = Array.from(
    new Set([...snapshot.limitations, ...ANAC_BDNCP_PUBLIC_LIMITATIONS]),
  );

  return {
    schemaVersion: ANAC_BDNCP_CONNECTION_SCHEMA_VERSION,
    status: snapshot.status,
    generatedAt: snapshot.generatedAt,
    lastAttemptAt: snapshot.lastAttemptAt,
    lastSuccessAt: snapshot.lastSuccessAt,
    failureCategory: snapshot.failureCategory,
    source: snapshot.source,
    coverage: {
      trackedUniqueCigs: trackedCigs.length,
      directCigLinks: trackedCigs.length,
      structuredMatches: matchedCigs.length,
      unmatchedInConsultedWindow: unmatchedCigs.length,
      consultedArchives: snapshot.consultedArchives.length,
      consultedPeriods: snapshot.consultedArchives.map(
        (archive) => archive.period,
      ),
    },
    matchedCigs,
    unmatchedCigs,
    matches,
    limitations,
  };
}

function normalizeFormalCig(value: string | null | undefined): string | null {
  const classification = classifyProcurementIdentifier(value);
  return classification.type === "cig" && classification.formallyValid
    ? classification.normalized
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNull<T>(value: T | null): value is T {
  return value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIso(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isNullableIso(value: unknown): value is string | null {
  return value === null || isIso(value);
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isOfficialAnacUrl(value: unknown): value is string {
  if (!isHttpUrl(value)) return false;
  const hostname = new URL(value).hostname;
  return (
    hostname === "anticorruzione.it" || hostname.endsWith(".anticorruzione.it")
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isSyncStatus(value: unknown): value is AnacBdncpSyncStatus {
  return ["pending", "current", "stale", "degraded"].includes(String(value));
}

function isFailureCategory(value: unknown): value is AnacBdncpFailureCategory {
  return (
    value === null ||
    value === "source-unavailable" ||
    value === "unexpected-format" ||
    value === "no-published-archive"
  );
}
