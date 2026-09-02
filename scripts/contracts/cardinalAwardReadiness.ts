import type { AnacBdncpRecord, AnacBdncpSyncSnapshot } from "../../artifacts/lamezia-trasparente/src/lib/anacBdncpSync";
import type { AnacAwardsSnapshot } from "./anacAwards";
import {
  buildCardinalReadinessReport,
  inferOcdsProcurementMethod,
  type CardinalReadinessReport,
} from "./cardinalReadiness";

export interface AwardAwareCardinalReadinessReport extends CardinalReadinessReport {
  awardEnrichment: {
    schemaVersion: AnacAwardsSnapshot["schemaVersion"];
    generatedAt: string;
    recordCount: number;
    matchedProcurements: number;
    numberOfTenderersAvailable: number;
    sourceDatasetUrl: string;
    sourceArchiveUrl: string;
  };
}

export function buildAwardAwareCardinalReadinessReport(
  procurementSnapshot: AnacBdncpSyncSnapshot,
  awardsSnapshot: AnacAwardsSnapshot,
  generatedAt = new Date().toISOString(),
): AwardAwareCardinalReadinessReport {
  const base = buildCardinalReadinessReport(procurementSnapshot, generatedAt);
  const awardsByCig = new Map(awardsSnapshot.records.map((record) => [record.cig, record] as const));
  let matchedProcurements = 0;
  let numberOfTenderersAvailable = 0;
  let computableRecords = 0;

  for (const record of procurementSnapshot.records) {
    const award = awardsByCig.get(record.cig);
    if (!award) continue;
    matchedProcurements += 1;
    if (award.numberOfTenderers !== null) numberOfTenderersAvailable += 1;
    if (isR018Computable(record, award.numberOfTenderers)) computableRecords += 1;
  }

  const r018 = base.indicators.find((indicator) => indicator.code === "R018");
  if (!r018) throw new Error("Cardinal R018 definition is missing");

  const hasOpenProcedure = procurementSnapshot.records.some(
    (record) => inferOcdsProcurementMethod(record) === "open",
  );
  const available = new Set(r018.availableRequiredOcdsPaths);
  if (numberOfTenderersAvailable > 0) available.add("/tender/numberOfTenderers");
  if (hasOpenProcedure) available.add("/tender/procurementMethod");
  r018.availableRequiredOcdsPaths = r018.requiredOcdsPaths.filter((path) => available.has(path));
  r018.missingRequiredOcdsPaths = r018.requiredOcdsPaths.filter((path) => !available.has(path));
  r018.recordCoverage = {
    totalRecords: procurementSnapshot.records.length,
    computableRecords,
  };
  r018.status =
    computableRecords > 0
      ? "computable"
      : r018.availableRequiredOcdsPaths.length > 0
        ? "partially-supported"
        : "unsupported";
  r018.scopeNote =
    "numberOfTenderers is sourced from ANAC Aggiudicazioni `num_imprese_offerenti`; R018 is computable only when that count co-occurs with a semantically validated OCDS open procedure on the same CIG.";

  base.summary = { computable: 0, "partially-supported": 0, unsupported: 0 };
  for (const indicator of base.indicators) base.summary[indicator.status] += 1;
  base.executionGate = {
    canRunIndicators: base.summary.computable > 0,
    reason:
      base.summary.computable > 0
        ? "At least one current procurement record satisfies all minimum prerequisites of at least one Cardinal red flag, including award enrichment where required."
        : "No current procurement record satisfies all minimum prerequisites of a Cardinal red flag after award enrichment.",
  };
  base.limitations = [
    "ANAC Aggiudicazioni is a separate source surface from the CIG dataset; its provenance is preserved separately in awardEnrichment.",
    "num_imprese_offerenti is mapped to OCDS tender.numberOfTenderers because it explicitly counts firms that submitted offers; numero_offerte_ammesse is not used as a substitute.",
    ...base.limitations,
    ...awardsSnapshot.limitations,
  ];

  return {
    ...base,
    awardEnrichment: {
      schemaVersion: awardsSnapshot.schemaVersion,
      generatedAt: awardsSnapshot.generatedAt,
      recordCount: awardsSnapshot.records.length,
      matchedProcurements,
      numberOfTenderersAvailable,
      sourceDatasetUrl: awardsSnapshot.source.datasetUrl,
      sourceArchiveUrl: awardsSnapshot.source.archiveUrl,
    },
  };
}

export function isR018Computable(
  procurement: AnacBdncpRecord,
  numberOfTenderers: number | null,
): boolean {
  return (
    numberOfTenderers !== null &&
    Number.isSafeInteger(numberOfTenderers) &&
    numberOfTenderers >= 0 &&
    inferOcdsProcurementMethod(procurement) === "open"
  );
}
