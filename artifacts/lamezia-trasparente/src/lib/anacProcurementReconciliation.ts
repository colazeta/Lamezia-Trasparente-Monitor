import type { AnacAuthorityDiscoverySnapshot } from "./anacAuthorityDiscovery";
import type { CanonicalContractsDataset } from "./canonicalContractsDataset";

export const ANAC_PROCUREMENT_RECONCILIATION_DATA_PATH =
  "data/processed/contracts/anac-authority-reconciliation-current.json";
export const ANAC_PROCUREMENT_RECONCILIATION_SCHEMA_VERSION =
  "anac-procurement-reconciliation.v1" as const;

export type ProcurementReconciliationClass =
  | "both"
  | "anac_only"
  | "albo_only";

export type ProcurementReconciliationRecord = {
  cig: string;
  classification: ProcurementReconciliationClass;
  canonicalContractId: string | null;
  canonicalNumericId: number | null;
  alboEventIds: string[];
  anac: {
    title: string | null;
    contractingAuthority: string | null;
    contractingAuthorityTaxId: string | null;
    tenderAmount: number | null;
    procedureType: string | null;
    publicationDate: string | null;
    outcome: string | null;
    outcomeDate: string | null;
    sourcePeriod: string | null;
    sourceArchiveUrl: string | null;
  } | null;
};

export type AnacProcurementReconciliation = {
  schemaVersion: typeof ANAC_PROCUREMENT_RECONCILIATION_SCHEMA_VERSION;
  generatedAt: string;
  authority: {
    taxId: string;
    label: string;
  };
  authorityDiscovery: {
    status: AnacAuthorityDiscoverySnapshot["status"];
    lastAttemptAt: string | null;
    lastSuccessAt: string | null;
    requestedYears: number[];
    completedYears: number[];
    completedPeriods: string[];
    recordsScanned: number;
    discoveredUniqueCigs: number;
  };
  coverage: {
    canonicalAlboContracts: number;
    anacAuthorityContracts: number;
    both: number;
    anacOnly: number;
    alboOnly: number;
    unresolvedAlboProcurementEvents: number;
    unionUniqueCigs: number;
    overlapShareOfAlbo: number | null;
    overlapShareOfAnac: number | null;
    historicalBackfillComplete: boolean;
    reconciliationInvariantSatisfied: boolean;
  };
  records: ProcurementReconciliationRecord[];
  unresolvedAlboEvents: Array<{
    eventId: string;
    publicationNumber: string | null;
    date: string | null;
    title: string;
    procurementRelevance: "possible" | "confirmed";
    taxonomyStatus: "classified" | "review_required" | "insufficient_evidence";
  }>;
  limitations: string[];
};

export function buildAnacProcurementReconciliation(
  contracts: CanonicalContractsDataset,
  authority: AnacAuthorityDiscoverySnapshot,
): AnacProcurementReconciliation {
  const canonicalByCig = new Map(
    contracts.contractEntities.map((entity) => [entity.cig, entity] as const),
  );
  const authorityByCig = new Map(
    authority.records.map((record) => [record.cig, record] as const),
  );
  const allCigs = Array.from(
    new Set([...canonicalByCig.keys(), ...authorityByCig.keys()]),
  ).sort();

  const records = allCigs.map((cig): ProcurementReconciliationRecord => {
    const canonical = canonicalByCig.get(cig) ?? null;
    const anac = authorityByCig.get(cig) ?? null;
    const classification: ProcurementReconciliationClass = canonical
      ? anac
        ? "both"
        : "albo_only"
      : "anac_only";
    return {
      cig,
      classification,
      canonicalContractId: canonical?.canonicalId ?? null,
      canonicalNumericId: canonical?.id ?? null,
      alboEventIds: canonical?.eventIds ?? [],
      anac: anac
        ? {
            title: anac.title,
            contractingAuthority: anac.contractingAuthority,
            contractingAuthorityTaxId: anac.contractingAuthorityTaxId,
            tenderAmount: anac.tenderAmount,
            procedureType: anac.procedureType,
            publicationDate: anac.publicationDate,
            outcome: anac.outcome,
            outcomeDate: anac.outcomeDate,
            sourcePeriod: anac.sourcePeriod,
            sourceArchiveUrl: anac.sourceArchiveUrl,
          }
        : null,
    };
  });

  const both = records.filter((record) => record.classification === "both").length;
  const anacOnly = records.filter(
    (record) => record.classification === "anac_only",
  ).length;
  const alboOnly = records.filter(
    (record) => record.classification === "albo_only",
  ).length;
  const referenceYear = new Date(authority.generatedAt).getUTCFullYear();
  const requestedClosedYears = authority.requestedYears.filter(
    (year) => year < referenceYear,
  );
  const completedClosedYears = new Set(
    authority.completedYears.filter((year) => year < referenceYear),
  );
  const historicalBackfillComplete =
    requestedClosedYears.length > 0 &&
    requestedClosedYears.every((year) => completedClosedYears.has(year)) &&
    authority.status !== "degraded";

  const canonicalCount = canonicalByCig.size;
  const authorityCount = authorityByCig.size;
  const reconciliationInvariantSatisfied =
    both + alboOnly === canonicalCount &&
    both + anacOnly === authorityCount &&
    both + alboOnly + anacOnly === allCigs.length;

  return {
    schemaVersion: ANAC_PROCUREMENT_RECONCILIATION_SCHEMA_VERSION,
    generatedAt: laterIso(contracts.generatedAt, authority.generatedAt),
    authority: { ...authority.targetAuthority },
    authorityDiscovery: {
      status: authority.status,
      lastAttemptAt: authority.lastAttemptAt,
      lastSuccessAt: authority.lastSuccessAt,
      requestedYears: [...authority.requestedYears],
      completedYears: [...authority.completedYears],
      completedPeriods: [...authority.completedPeriods],
      recordsScanned: authority.recordsScanned,
      discoveredUniqueCigs: authority.records.length,
    },
    coverage: {
      canonicalAlboContracts: canonicalCount,
      anacAuthorityContracts: authorityCount,
      both,
      anacOnly,
      alboOnly,
      unresolvedAlboProcurementEvents: contracts.unresolvedEvents.length,
      unionUniqueCigs: allCigs.length,
      overlapShareOfAlbo: share(both, canonicalCount),
      overlapShareOfAnac: share(both, authorityCount),
      historicalBackfillComplete,
      reconciliationInvariantSatisfied,
    },
    records,
    unresolvedAlboEvents: contracts.unresolvedEvents.map((event) => ({
      eventId: event.eventId,
      publicationNumber: event.publicationNumber,
      date: event.date,
      title: event.title,
      procurementRelevance: event.procurementRelevance,
      taxonomyStatus: event.taxonomyStatus,
    })),
    limitations: unique([
      ...authority.limitations,
      "ANAC-only indica che il CIG e' stato individuato nella discovery ufficiale per codice fiscale della stazione appaltante ma non e' collegato ad alcun atto nel corpus Albo pubblico corrente; non implica che l'atto non sia mai stato pubblicato.",
      "Albo-only indica che il CIG e' presente nel corpus Albo pubblico corrente ma non nello snapshot ANAC per stazione appaltante finora acquisito; finche' il backfill storico non e' completo non va interpretato come assenza dalla BDNCP.",
      "Gli eventi procurement Albo senza CIG restano una popolazione separata da risolvere e non vengono forzati su un contratto ANAC per similarita' testuale.",
    ]),
  };
}

function share(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function laterIso(first: string, second: string): string {
  return Date.parse(first) >= Date.parse(second) ? first : second;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
