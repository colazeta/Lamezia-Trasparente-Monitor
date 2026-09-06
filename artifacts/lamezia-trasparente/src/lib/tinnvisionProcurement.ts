export const TINNVISION_PROCUREMENT_SCHEMA_VERSION =
  "tinnvision-procurement-census.v1" as const;

export type TinnvisionProcurementStatus =
  | "pending"
  | "current"
  | "stale"
  | "degraded";

export type TinnvisionProcurementRecord = {
  sourceId: string;
  recordYear: number;
  recordId: string;
  detailUrl: string;
  proposer: string | null;
  choiceProcedure: string | null;
  object: string;
  rawCig: string | null;
  cigCandidates: string[];
  cigs: string[];
  invalidCigs: string[];
  invitedOperators: string | null;
  awardee: string | null;
  startDate: string | null;
  endDate: string | null;
  awardAmount: number | null;
  liquidatedAmount: number | null;
  procedureType: string | null;
  procedureNumber: string | null;
  sourcePage: number;
};

export type TinnvisionProcurementSnapshot = {
  schemaVersion: typeof TINNVISION_PROCUREMENT_SCHEMA_VERSION;
  generatedAt: string;
  status: TinnvisionProcurementStatus;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  source: {
    id: "lamezia-tinnvision-procurement-index";
    label: string;
    authorityTaxId: "00301390795";
    sectionId: 216;
    urlPattern: string;
    rowsPerPage: 30;
  };
  coverage: {
    reportedTotalElements: number | null;
    reportedTotalPages: number | null;
    pagesRead: number;
    rowsParsed: number;
    uniqueRecords: number;
    duplicateSourceIds: number;
    recordsWithValidCig: number;
    recordsWithInvalidCigOnly: number;
    recordsWithoutCigCandidate: number;
    minimumRecordYear: number | null;
    maximumRecordYear: number | null;
    traversalComplete: boolean;
    reconciliationInvariantSatisfied: boolean;
  };
  records: TinnvisionProcurementRecord[];
  limitations: string[];
};

export function createPendingTinnvisionProcurementSnapshot(
  generatedAt = new Date(0).toISOString(),
): TinnvisionProcurementSnapshot {
  return {
    schemaVersion: TINNVISION_PROCUREMENT_SCHEMA_VERSION,
    generatedAt,
    status: "pending",
    lastAttemptAt: null,
    lastSuccessAt: null,
    source: {
      id: "lamezia-tinnvision-procurement-index",
      label: "Comune di Lamezia Terme — Tinnvision Bandi di gara e contratti",
      authorityTaxId: "00301390795",
      sectionId: 216,
      urlPattern:
        "https://trasparenza.tinnvision.cloud/traspamm/bandidigara/00301390795/2?idsezione=216&idannopubblicazione=-1&rows=30&page={page}",
      rowsPerPage: 30,
    },
    coverage: {
      reportedTotalElements: null,
      reportedTotalPages: null,
      pagesRead: 0,
      rowsParsed: 0,
      uniqueRecords: 0,
      duplicateSourceIds: 0,
      recordsWithValidCig: 0,
      recordsWithInvalidCigOnly: 0,
      recordsWithoutCigCandidate: 0,
      minimumRecordYear: null,
      maximumRecordYear: null,
      traversalComplete: false,
      reconciliationInvariantSatisfied: true,
    },
    records: [],
    limitations: [
      "Il censimento descrive l'indice ufficiale Tinnvision effettivamente attraversato; non equivale da solo alla completezza dell'intera storia contrattuale del Comune.",
      "I token CIG formalmente invalidi restano evidenza della fonte ma non possono creare identita contrattuali.",
      "Gli allegati e i documenti di dettaglio non entrano automaticamente nella proiezione pubblica: restano soggetti alla policy fail-closed gia applicata ai documenti dell'Albo.",
    ],
  };
}

export function validateTinnvisionProcurementSnapshot(
  value: unknown,
): TinnvisionProcurementSnapshot {
  if (!isRecord(value)) throw new Error("Tinnvision snapshot must be an object");
  if (value.schemaVersion !== TINNVISION_PROCUREMENT_SCHEMA_VERSION) {
    throw new Error("Tinnvision snapshot has unsupported schema");
  }
  if (!isStatus(value.status) || !isIso(value.generatedAt)) {
    throw new Error("Tinnvision snapshot has invalid status metadata");
  }
  if (!isNullableIso(value.lastAttemptAt) || !isNullableIso(value.lastSuccessAt)) {
    throw new Error("Tinnvision snapshot has invalid attempt metadata");
  }
  if (!isRecord(value.source) || !isRecord(value.coverage) || !Array.isArray(value.records)) {
    throw new Error("Tinnvision snapshot has invalid structure");
  }
  if (
    value.source.id !== "lamezia-tinnvision-procurement-index" ||
    value.source.authorityTaxId !== "00301390795" ||
    value.source.sectionId !== 216 ||
    value.source.rowsPerPage !== 30 ||
    !isOfficialTinnvisionUrl(value.source.urlPattern)
  ) {
    throw new Error("Tinnvision snapshot has invalid source metadata");
  }
  if (!Array.isArray(value.limitations) || !value.limitations.every(isNonEmptyString)) {
    throw new Error("Tinnvision snapshot has invalid limitations");
  }

  const snapshot = value as unknown as TinnvisionProcurementSnapshot;
  if (
    (snapshot.status === "pending" &&
      (snapshot.lastAttemptAt !== null || snapshot.lastSuccessAt !== null)) ||
    (snapshot.status === "current" && snapshot.lastSuccessAt === null) ||
    (snapshot.status === "stale" && snapshot.lastSuccessAt === null) ||
    (snapshot.status === "degraded" && snapshot.lastAttemptAt === null)
  ) {
    throw new Error("Tinnvision snapshot has inconsistent status metadata");
  }

  for (const key of [
    "pagesRead",
    "rowsParsed",
    "uniqueRecords",
    "duplicateSourceIds",
    "recordsWithValidCig",
    "recordsWithInvalidCigOnly",
    "recordsWithoutCigCandidate",
  ] as const) {
    if (!isNonNegativeInteger(snapshot.coverage[key])) {
      throw new Error(`Tinnvision coverage.${key} must be a non-negative integer`);
    }
  }
  if (!isNullableNonNegativeInteger(snapshot.coverage.reportedTotalElements)) {
    throw new Error("Tinnvision reportedTotalElements is invalid");
  }
  if (!isNullableNonNegativeInteger(snapshot.coverage.reportedTotalPages)) {
    throw new Error("Tinnvision reportedTotalPages is invalid");
  }
  if (
    snapshot.coverage.uniqueRecords !== snapshot.records.length ||
    snapshot.coverage.recordsWithValidCig +
        snapshot.coverage.recordsWithInvalidCigOnly +
        snapshot.coverage.recordsWithoutCigCandidate !==
      snapshot.records.length ||
    snapshot.coverage.reconciliationInvariantSatisfied !== true
  ) {
    throw new Error("Tinnvision coverage does not reconcile with records");
  }
  if (
    snapshot.coverage.traversalComplete &&
    snapshot.coverage.reportedTotalElements !== null &&
    snapshot.coverage.reportedTotalElements !== snapshot.records.length
  ) {
    throw new Error("Tinnvision complete traversal does not match reported total");
  }

  const ids = new Set<string>();
  for (const record of snapshot.records) {
    if (
      !record.sourceId ||
      ids.has(record.sourceId) ||
      record.sourceId !== `tinn:${record.recordYear}:${record.recordId}` ||
      !Number.isInteger(record.recordYear) ||
      record.recordYear < 2000 ||
      record.recordYear > 2100 ||
      !isNonEmptyString(record.recordId) ||
      !isOfficialTinnvisionUrl(record.detailUrl) ||
      !isNonEmptyString(record.object) ||
      !Number.isInteger(record.sourcePage) ||
      record.sourcePage < 1 ||
      !Array.isArray(record.cigCandidates) ||
      !Array.isArray(record.cigs) ||
      !Array.isArray(record.invalidCigs) ||
      record.cigs.some((cig) => !record.cigCandidates.includes(cig)) ||
      record.invalidCigs.some((cig) => !record.cigCandidates.includes(cig))
    ) {
      throw new Error(`Tinnvision record is invalid: ${record.sourceId || "unknown"}`);
    }
    ids.add(record.sourceId);
  }
  return snapshot;
}

function isStatus(value: unknown): value is TinnvisionProcurementStatus {
  return ["pending", "current", "stale", "degraded"].includes(String(value));
}

function isOfficialTinnvisionUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const candidate = value.replace("{page}", "1");
  try {
    const url = new URL(candidate);
    return (
      url.protocol === "https:" &&
      (url.hostname === "trasparenza.tinnvision.cloud" ||
        url.hostname === "trasparenza.tinnservice.com")
    );
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function isNullableNonNegativeInteger(value: unknown): value is number | null {
  return value === null || isNonNegativeInteger(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
