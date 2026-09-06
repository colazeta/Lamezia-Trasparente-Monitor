import {
  TINNVISION_PROCUREMENT_SCHEMA_VERSION,
  createPendingTinnvisionProcurementSnapshot,
  type TinnvisionProcurementRecord,
  type TinnvisionProcurementSnapshot,
} from "../../artifacts/lamezia-trasparente/src/lib/tinnvisionProcurement";
import type { ParsedTinnvisionPage } from "./tinnvisionProcurementHtml";

export function buildTinnvisionProcurementSnapshot(input: {
  attemptedAt: string;
  pages: ParsedTinnvisionPage[];
  requestedPages: number[];
  failedPages?: number[];
}): TinnvisionProcurementSnapshot {
  const base = createPendingTinnvisionProcurementSnapshot(input.attemptedAt);
  const pages = [...input.pages].sort((a, b) => a.page - b.page);
  const failedPages = uniqueNumbers(input.failedPages ?? []).sort((a, b) => a - b);
  const requestedPages = uniqueNumbers(input.requestedPages).sort((a, b) => a - b);
  const rawRecords = pages.flatMap((page) => page.records);
  const recordsById = new Map<string, TinnvisionProcurementRecord>();
  let duplicateSourceIds = 0;
  for (const record of rawRecords) {
    if (recordsById.has(record.sourceId)) duplicateSourceIds += 1;
    else recordsById.set(record.sourceId, record);
  }
  const records = Array.from(recordsById.values()).sort(compareRecords);
  const reportedTotals = uniqueNumbers(
    pages
      .map((page) => page.reportedTotalElements)
      .filter((value): value is number => value !== null),
  );
  const reportedPages = uniqueNumbers(
    pages
      .map((page) => page.reportedTotalPages)
      .filter((value): value is number => value !== null),
  );
  const reportedTotalElements = reportedTotals.length === 1 ? reportedTotals[0] : null;
  const reportedTotalPages = reportedPages.length === 1 ? reportedPages[0] : null;
  const pageNumbers = pages.map((page) => page.page);
  const everyRequestedPageRead = requestedPages.every((page) => pageNumbers.includes(page));
  const expectedPagesRead =
    reportedTotalPages !== null &&
    requestedPages.length === reportedTotalPages &&
    requestedPages[0] === 1 &&
    requestedPages.at(-1) === reportedTotalPages;
  const countMatches =
    reportedTotalElements !== null && records.length === reportedTotalElements;
  const metadataConsistent = reportedTotals.length <= 1 && reportedPages.length <= 1;
  const traversalComplete =
    failedPages.length === 0 &&
    everyRequestedPageRead &&
    expectedPagesRead &&
    countMatches &&
    metadataConsistent;
  const years = records.map((record) => record.recordYear);
  const status = traversalComplete ? "current" : "degraded";

  return {
    ...base,
    generatedAt: input.attemptedAt,
    status,
    lastAttemptAt: input.attemptedAt,
    lastSuccessAt: traversalComplete ? input.attemptedAt : null,
    coverage: {
      reportedTotalElements,
      reportedTotalPages,
      pagesRead: pages.length,
      rowsParsed: rawRecords.length,
      uniqueRecords: records.length,
      duplicateSourceIds,
      recordsWithValidCig: records.filter((record) => record.cigs.length > 0).length,
      recordsWithInvalidCigOnly: records.filter(
        (record) => record.cigCandidates.length > 0 && record.cigs.length === 0,
      ).length,
      recordsWithoutCigCandidate: records.filter(
        (record) => record.cigCandidates.length === 0,
      ).length,
      minimumRecordYear: years.length > 0 ? Math.min(...years) : null,
      maximumRecordYear: years.length > 0 ? Math.max(...years) : null,
      traversalComplete,
      reconciliationInvariantSatisfied:
        records.filter((record) => record.cigs.length > 0).length +
          records.filter(
            (record) => record.cigCandidates.length > 0 && record.cigs.length === 0,
          ).length +
          records.filter((record) => record.cigCandidates.length === 0).length ===
        records.length,
    },
    records,
    limitations: [
      ...base.limitations,
      ...(failedPages.length > 0
        ? [`Pagine non acquisite nell'ultima esecuzione: ${failedPages.join(", ")}.`]
        : []),
      ...(!metadataConsistent
        ? ["Le pagine acquisite riportano metadati di paginazione non coerenti tra loro."]
        : []),
      ...(reportedTotalElements !== null && !countMatches
        ? [
            `Il sito riporta ${reportedTotalElements} elementi ma il traversal ha materializzato ${records.length} record unici.`,
          ]
        : []),
    ],
  };
}

export function initialTinnvisionPages(firstPage: ParsedTinnvisionPage): number[] {
  if (firstPage.page !== 1) {
    throw new Error("Tinnvision discovery must start from page 1");
  }
  const totalPages = firstPage.reportedTotalPages;
  if (!Number.isInteger(totalPages) || totalPages === null || totalPages < 1) {
    throw new Error("Tinnvision page 1 does not expose a usable total page count");
  }
  if (totalPages > 200) {
    throw new Error(`Tinnvision total page count exceeds safety cap: ${totalPages}`);
  }
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

function compareRecords(
  a: TinnvisionProcurementRecord,
  b: TinnvisionProcurementRecord,
): number {
  return b.recordYear - a.recordYear || a.recordId.localeCompare(b.recordId, "it", {
    numeric: true,
  });
}

function uniqueNumbers(values: number[]): number[] {
  return Array.from(new Set(values));
}
