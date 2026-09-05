import type { AnacBdncpRecord } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import {
  ANAC_AUTHORITY_DISCOVERY_LIMITATIONS,
  ANAC_AUTHORITY_DISCOVERY_SCHEMA_VERSION,
  ANAC_CIG_DATASET_PATTERN_URL,
  type AnacAuthorityArchiveCoverage,
  type AnacAuthorityDiscoveryFailureCategory,
  type AnacAuthorityDiscoverySnapshot,
} from "../../artifacts/lamezia-trasparente/src/lib/anacAuthorityDiscovery";
import { ANAC_OPEN_DATA_CATALOG_URL } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import { mergeAuthorityRecords } from "./anacAuthorityCsv";

export interface SuccessfulAuthorityArchive {
  period: string;
  year: number;
  url: string;
  retrievedAt: string;
  recordsScanned: number;
  records: AnacBdncpRecord[];
}

export function buildRequestedYears(
  referenceDate: Date,
  startYear: number,
): number[] {
  if (Number.isNaN(referenceDate.getTime())) {
    throw new Error("A valid ANAC authority reference date is required");
  }
  const currentYear = referenceDate.getUTCFullYear();
  if (!Number.isInteger(startYear) || startYear < 2000 || startYear > currentYear) {
    throw new Error("ANAC authority startYear must be between 2000 and current year");
  }
  return Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => startYear + index,
  );
}

export function selectHistoricalYearsForRun(
  requestedYears: number[],
  completedYears: number[],
  currentYear: number,
  maxYears: number,
): number[] {
  if (!Number.isInteger(maxYears) || maxYears < 0 || maxYears > 10) {
    throw new Error("ANAC authority maxYears must be an integer between 0 and 10");
  }
  const completed = new Set(completedYears);
  return requestedYears
    .filter((year) => year < currentYear && !completed.has(year))
    .sort((a, b) => b - a)
    .slice(0, maxYears);
}

export function mergeAuthorityDiscoveryAttempt(input: {
  previous: AnacAuthorityDiscoverySnapshot;
  attemptedAt: string;
  requestedYears: number[];
  targetTaxId: string;
  targetLabel: string;
  successfulArchives: SuccessfulAuthorityArchive[];
  catalogPeriodsByYear: Map<number, string[]>;
  attemptedResources: number;
  failedResources: number;
  failureCategory: AnacAuthorityDiscoveryFailureCategory;
  currentYear: number;
}): AnacAuthorityDiscoverySnapshot {
  const requestedYears = uniqueNumbers(input.requestedYears).sort((a, b) => a - b);
  const successfulByPeriod = new Map(
    input.successfulArchives.map((archive) => [archive.period, archive] as const),
  );
  const completedPeriods = new Set(input.previous.completedPeriods);
  for (const archive of input.successfulArchives) completedPeriods.add(archive.period);

  const archiveCoverage = new Map<string, AnacAuthorityArchiveCoverage>(
    input.previous.consultedArchives.map((archive) => [archive.period, archive]),
  );
  for (const archive of input.successfulArchives) {
    archiveCoverage.set(archive.period, {
      period: archive.period,
      year: archive.year,
      url: archive.url,
      retrievedAt: archive.retrievedAt,
      recordsScanned: archive.recordsScanned,
      matchedRecords: archive.records.length,
    });
  }

  const records = new Map(
    input.previous.records.map((record) => [record.cig, record] as const),
  );
  for (const archive of [...input.successfulArchives].sort((a, b) =>
    a.period.localeCompare(b.period),
  )) {
    for (const record of archive.records) {
      const previous = records.get(record.cig);
      records.set(
        record.cig,
        previous ? mergeAuthorityRecords(previous, record) : record,
      );
    }
  }

  const completedYears = new Set(
    input.previous.completedYears.filter((year) => requestedYears.includes(year)),
  );
  for (const [year, periods] of input.catalogPeriodsByYear.entries()) {
    if (year >= input.currentYear || periods.length === 0) continue;
    if (periods.every((period) => completedPeriods.has(period))) {
      completedYears.add(year);
    }
  }

  const hasFreshArchive = successfulByPeriod.size > 0;
  const lastSuccessAt = hasFreshArchive
    ? input.attemptedAt
    : input.previous.lastSuccessAt;
  const status = hasFreshArchive
    ? "current"
    : lastSuccessAt
      ? "stale"
      : "degraded";
  const recordsScanned = Array.from(archiveCoverage.values()).reduce(
    (sum, archive) => sum + archive.recordsScanned,
    0,
  );

  return {
    schemaVersion: ANAC_AUTHORITY_DISCOVERY_SCHEMA_VERSION,
    generatedAt: input.attemptedAt,
    status,
    lastAttemptAt: input.attemptedAt,
    lastSuccessAt,
    failureCategory: hasFreshArchive ? null : input.failureCategory,
    targetAuthority: {
      taxId: input.targetTaxId,
      label: input.targetLabel,
    },
    source: {
      id: "anac-open-data-cig-authority",
      label: "ANAC open data — CIG per stazione appaltante",
      catalogUrl: ANAC_OPEN_DATA_CATALOG_URL,
      datasetPatternUrl: ANAC_CIG_DATASET_PATTERN_URL,
      format: "csv-in-zip",
      acquisitionMode: "contracting-authority-tax-id",
    },
    requestedYears,
    completedYears: Array.from(completedYears).sort((a, b) => a - b),
    completedPeriods: Array.from(completedPeriods).sort(),
    consultedArchives: Array.from(archiveCoverage.values()).sort((a, b) =>
      a.period.localeCompare(b.period),
    ),
    recordsScanned,
    records: Array.from(records.values()).sort((a, b) => a.cig.localeCompare(b.cig)),
    limitations: Array.from(
      new Set([
        ...input.previous.limitations,
        ...ANAC_AUTHORITY_DISCOVERY_LIMITATIONS,
        ...(input.failedResources > 0
          ? [
              `${input.failedResources}/${input.attemptedResources} risorse tentate nell'ultima esecuzione non sono state acquisite; la copertura resta esplicitamente parziale.`,
            ]
          : []),
      ]),
    ),
  };
}

export function periodsToProcess(input: {
  catalogPeriods: string[];
  completedPeriods: string[];
  currentPeriod: string;
  refreshCurrentMonths: number;
}): string[] {
  if (
    !Number.isInteger(input.refreshCurrentMonths) ||
    input.refreshCurrentMonths < 0 ||
    input.refreshCurrentMonths > 12
  ) {
    throw new Error("refreshCurrentMonths must be between 0 and 12");
  }
  const completed = new Set(input.completedPeriods);
  const refreshThreshold = shiftMonth(
    input.currentPeriod,
    -(Math.max(1, input.refreshCurrentMonths) - 1),
  );
  return input.catalogPeriods.filter(
    (period) => !completed.has(period) || period >= refreshThreshold,
  );
}

function shiftMonth(period: string, offset: number): string {
  if (!/^20\d{2}-(?:0[1-9]|1[0-2])$/u.test(period)) {
    throw new Error(`Invalid period: ${period}`);
  }
  const date = new Date(
    Date.UTC(Number(period.slice(0, 4)), Number(period.slice(5, 7)) - 1 + offset, 1),
  );
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function uniqueNumbers(values: number[]): number[] {
  return Array.from(new Set(values));
}
