import type {
  Contract,
  ContractStoryline,
  FeedStatus,
  StorylineIndicators,
} from "@workspace/api-client-react";

import {
  anacAuthorityHistoricalCoverage,
  createPendingAnacAuthorityDiscoverySnapshot,
  type AnacAuthorityDiscoverySnapshot,
} from "./anacAuthorityDiscovery";
import type { AnacBdncpRecord, AnacBdncpSyncSnapshot } from "./anacBdncpSync";
import { bdncpUrlForCig } from "./bdncp";
import {
  buildCanonicalContractsDataset,
  contractIdForCig,
  type CanonicalContractsCoverage,
  type CanonicalContractsDataset,
} from "./canonicalContractsDataset";
import type { AlboPublicSnapshot } from "./contractsSource";

export const MULTI_SOURCE_CONTRACTS_SCHEMA_VERSION =
  "lamezia-contracts-multisource.v1" as const;

export type ContractSourceResolution =
  | "albo_and_anac"
  | "albo_only"
  | "anac_only";

export type ProcurementCensusReconciliation = {
  authorityTaxId: string;
  authorityLabel: string;
  authorityDiscoveryStatus: AnacAuthorityDiscoverySnapshot["status"];
  authorityDiscoveryGeneratedAt: string;
  requestedYears: number;
  completedYears: number;
  missingYears: number[];
  historicalBackfillComplete: boolean;
  localCanonicalCigs: number;
  anacAuthorityCigs: number;
  unionCigs: number;
  overlapCigs: string[];
  alboOnlyCigs: string[];
  anacOnlyCigs: string[];
  unresolvedAlboEvents: number;
  sourceResolutionInvariantSatisfied: boolean;
};

export type MultiSourceContractsDataset = Omit<
  CanonicalContractsDataset,
  "schemaVersion" | "source" | "coverage" | "feedStatus" | "contracts" | "storylines"
> & {
  schemaVersion: typeof MULTI_SOURCE_CONTRACTS_SCHEMA_VERSION;
  source: {
    id: "multi_source_procurement_census";
    label: string;
    url: string;
    scope: "known-public-sources";
    publicClaim: "contratti individuati dalle fonti pubbliche integrate";
    limitations: string[];
  };
  coverage: CanonicalContractsCoverage & {
    multiSourceContracts: number;
    overlapContracts: number;
    alboOnlyContracts: number;
    anacOnlyContracts: number;
    anacAuthorityDiscoveredContracts: number;
    anacAuthorityWithTenderAmount: number;
    authorityRequestedYears: number;
    authorityCompletedYears: number;
    authorityHistoricalBackfillComplete: boolean;
    unionInvariantSatisfied: boolean;
  };
  feedStatus: FeedStatus;
  authorityDiscovery: AnacAuthorityDiscoverySnapshot;
  reconciliation: ProcurementCensusReconciliation;
  contracts: Contract[];
  storylines: Record<string, ContractStoryline>;
};

export function buildMultiSourceContractsDataset(
  alboSnapshot: AlboPublicSnapshot,
  trackedAnacSnapshot: AnacBdncpSyncSnapshot,
  authoritySnapshot: AnacAuthorityDiscoverySnapshot =
    createPendingAnacAuthorityDiscoverySnapshot(),
): MultiSourceContractsDataset {
  const canonical = buildCanonicalContractsDataset(
    alboSnapshot,
    trackedAnacSnapshot,
  );
  const localByCig = new Map(
    canonical.contracts
      .filter((contract) => Boolean(contract.cig))
      .map((contract) => [contract.cig!, contract] as const),
  );
  const authorityByCig = new Map(
    authoritySnapshot.records.map((record) => [record.cig, record] as const),
  );
  const localCigs = Array.from(localByCig.keys()).sort();
  const authorityCigs = Array.from(authorityByCig.keys()).sort();
  const localSet = new Set(localCigs);
  const authoritySet = new Set(authorityCigs);
  const overlapCigs = localCigs.filter((cig) => authoritySet.has(cig));
  const alboOnlyCigs = localCigs.filter((cig) => !authoritySet.has(cig));
  const anacOnlyCigs = authorityCigs.filter((cig) => !localSet.has(cig));
  const anacOnlyContracts = anacOnlyCigs.map((cig) =>
    buildAnacOnlyContract(authorityByCig.get(cig)!),
  );
  const anacOnlyContractByCig = new Map(
    anacOnlyContracts.map((contract) => [contract.cig!, contract] as const),
  );
  const contracts = [...canonical.contracts, ...anacOnlyContracts].sort(
    compareContractsNewestFirst,
  );
  const anacOnlyStorylines = Object.fromEntries(
    anacOnlyCigs.map((cig) => {
      const contract = anacOnlyContractByCig.get(cig)!;
      return [
        String(contract.id),
        buildAnacDiscoveryStoryline(contract, authorityByCig.get(cig)!),
      ];
    }),
  );
  const storylines = {
    ...canonical.storylines,
    ...anacOnlyStorylines,
  };
  const historical = anacAuthorityHistoricalCoverage(authoritySnapshot);
  const unionCigs = new Set([...localCigs, ...authorityCigs]);
  const reconciliation: ProcurementCensusReconciliation = {
    authorityTaxId: authoritySnapshot.targetAuthority.taxId,
    authorityLabel: authoritySnapshot.targetAuthority.label,
    authorityDiscoveryStatus: authoritySnapshot.status,
    authorityDiscoveryGeneratedAt: authoritySnapshot.generatedAt,
    requestedYears: historical.requestedYears,
    completedYears: historical.completedYears,
    missingYears: historical.missingYears,
    historicalBackfillComplete: historical.historicalBackfillComplete,
    localCanonicalCigs: localCigs.length,
    anacAuthorityCigs: authorityCigs.length,
    unionCigs: unionCigs.size,
    overlapCigs,
    alboOnlyCigs,
    anacOnlyCigs,
    unresolvedAlboEvents: canonical.unresolvedEvents.length,
    sourceResolutionInvariantSatisfied:
      overlapCigs.length + alboOnlyCigs.length === localCigs.length &&
      overlapCigs.length + anacOnlyCigs.length === authorityCigs.length &&
      overlapCigs.length + alboOnlyCigs.length + anacOnlyCigs.length ===
        unionCigs.size,
  };
  const limitations = uniqueStrings([
    "Il censimento integra il corpus canonico dell'Albo con una discovery ANAC indipendente per codice fiscale della stazione appaltante; un record ANAC-only e' mostrato come contratto/procedura individuata, non come fascicolo locale completo.",
    "Gli atti procurement dell'Albo senza CIG restano eventi irrisolti separati: non vengono eliminati e non vengono associati artificialmente a un CIG ANAC.",
    "Per i record ANAC-only l'importo del lotto/base di gara resta un fatto della fonte ANAC e non viene trasformato nel campo amount del contratto, che richiede evidenza locale o di aggiudicazione compatibile.",
    historical.historicalBackfillComplete
      ? "La finestra storica ANAC richiesta risulta acquisita secondo il ledger dei periodi pubblicati e consultati; cio' non sostituisce le ulteriori fonti locali e di esecuzione."
      : "Il backfill storico ANAC e' ancora in corso: gli anni non completati sono dichiarati nel ledger e non vengono interpretati come anni senza contratti.",
    ...canonical.source.limitations,
    ...authoritySnapshot.limitations,
  ]);
  const generatedAt = newestIso(
    canonical.generatedAt,
    authoritySnapshot.generatedAt,
  );
  const feedStatus: FeedStatus = {
    ...canonical.feedStatus,
    source: "multi_source_procurement_census",
    label: "Censimento contratti — Albo canonico + ANAC per stazione appaltante",
    status: historical.historicalBackfillComplete
      ? "multi-source-current"
      : "multi-source-backfill",
    itemsTotal: contracts.length,
    lastUpdatedAt: generatedAt,
  };

  return {
    ...canonical,
    schemaVersion: MULTI_SOURCE_CONTRACTS_SCHEMA_VERSION,
    generatedAt,
    source: {
      id: "multi_source_procurement_census",
      label: "Comune di Lamezia Terme — censimento contratti da fonti pubbliche",
      url: canonical.source.url,
      scope: "known-public-sources",
      publicClaim: "contratti individuati dalle fonti pubbliche integrate",
      limitations,
    },
    coverage: {
      ...canonical.coverage,
      multiSourceContracts: contracts.length,
      overlapContracts: overlapCigs.length,
      alboOnlyContracts: alboOnlyCigs.length,
      anacOnlyContracts: anacOnlyCigs.length,
      anacAuthorityDiscoveredContracts: authorityCigs.length,
      anacAuthorityWithTenderAmount: authoritySnapshot.records.filter(
        (record) => record.tenderAmount !== null,
      ).length,
      authorityRequestedYears: historical.requestedYears,
      authorityCompletedYears: historical.completedYears,
      authorityHistoricalBackfillComplete: historical.historicalBackfillComplete,
      unionInvariantSatisfied:
        reconciliation.sourceResolutionInvariantSatisfied &&
        contracts.length === unionCigs.size,
    },
    feedStatus,
    authorityDiscovery: authoritySnapshot,
    reconciliation,
    contracts,
    storylines,
  };
}

export function contractSourceResolution(
  cig: string,
  reconciliation: ProcurementCensusReconciliation,
): ContractSourceResolution | null {
  if (reconciliation.overlapCigs.includes(cig)) return "albo_and_anac";
  if (reconciliation.alboOnlyCigs.includes(cig)) return "albo_only";
  if (reconciliation.anacOnlyCigs.includes(cig)) return "anac_only";
  return null;
}

function buildAnacOnlyContract(record: AnacBdncpRecord): Contract {
  const description =
    record.title?.trim() || `Procedura ANAC/BDNCP con CIG ${record.cig}`;
  const procedureType = record.procedureType?.trim();
  const referenceDate = sourceDate(record);
  return {
    id: contractIdForCig(record.cig),
    title: truncate(description, 180),
    description,
    supplier: "Non disponibile nel dataset CIG ANAC",
    amount: 0,
    procedureType: procedureType
      ? `ANAC: ${procedureType}`
      : "Non disponibile nel dataset CIG ANAC",
    status: "Individuato in ANAC/BDNCP; lifecycle locale da ricostruire",
    awardDate: `${referenceDate}T00:00:00.000Z`,
    cig: record.cig,
    cup: null,
    stazioneAppaltante:
      record.contractingAuthority ?? "Comune di Lamezia Terme (CF 00301390795)",
    acquisitionTool: null,
    withoutTender: /AFFIDAMENTO\s+DIRETTO/iu.test(procedureType ?? ""),
    withoutMepa: false,
    anacUrl: bdncpUrlForCig(record.cig),
    themeId: null,
    macrotema: deriveMacrotema(record),
    macrotemaManual: false,
    latitude: null,
    longitude: null,
    geoAddress: null,
    geoQuartiere: null,
    geoSource: null,
    geoManual: false,
    geoVerify: false,
  };
}

function buildAnacDiscoveryStoryline(
  contract: Contract,
  record: AnacBdncpRecord,
): ContractStoryline {
  const officialUrl = bdncpUrlForCig(record.cig);
  if (!officialUrl) {
    throw new Error(`Cannot build official BDNCP URL for ANAC CIG ${record.cig}`);
  }
  const evidenceDate = contract.awardDate;
  const indicators: StorylineIndicators = {
    evidenceCount: 1,
    phaseCounts: { altro: 1 },
    firstEvidenceDate: evidenceDate,
    lastEvidenceDate: evidenceDate,
    daysToFirstLiquidazione: null,
    daysToLastLiquidazione: null,
    awardedAmount: 0,
    extraAmount: null,
    extraAmountIsEstimate: false,
    costOverrunPct: null,
    liquidatedAmount: null,
    liquidatedAmountIsEstimate: false,
    status: "nessuna_liquidazione",
  };
  return {
    contract,
    timeline: [
      {
        publicationId: contract.id,
        progressivo: `ANAC:${record.cig}`,
        phase: "altro",
        matchedBy: "cig",
        tipologia: "Record strutturato ANAC/BDNCP",
        oggetto:
          record.title?.trim() || `Procedura ANAC/BDNCP con CIG ${record.cig}`,
        date: evidenceDate,
        estimatedAmount: record.tenderAmount,
        attachments: [
          {
            name: `Scheda ANAC/BDNCP ${record.cig}`,
            tipo: "Fonte ufficiale ANAC",
            officialUrl,
            storagePath: null,
            contentType: null,
            size: null,
          },
        ],
      },
    ],
    indicators,
  };
}

function sourceDate(record: AnacBdncpRecord): string {
  for (const value of [record.publicationDate, record.outcomeDate]) {
    if (value && /^\d{4}-\d{2}-\d{2}/u.test(value)) return value.slice(0, 10);
  }
  if (/^\d{4}-\d{2}$/u.test(record.sourcePeriod)) {
    return `${record.sourcePeriod}-01`;
  }
  return "1970-01-01";
}

function deriveMacrotema(
  record: AnacBdncpRecord,
): NonNullable<Contract["macrotema"]> {
  const text = `${record.title ?? ""} ${record.cpvDescription ?? ""}`;
  if (/SCUOL|ASILO|MENSA|BIBLIOTEC|ISTRUZ/iu.test(text)) return "scuole";
  if (/STRAD|VIABILIT|EDIFIC|LAVORI|COSTRUZ|MANUTENZ/iu.test(text)) {
    return "strade";
  }
  if (/RIFIUT|AMBIENT|VERDE|ENERG|ACQUA/iu.test(text)) return "ambiente";
  if (/SOCIAL|DISABIL|MINOR|ANZIAN|ASSISTEN/iu.test(text)) return "sociale";
  if (/CULTUR|TURIS|SPORT|EVENT/iu.test(text)) return "cultura";
  if (/TRASPORT|MOBILIT|AUTOBUS/iu.test(text)) return "mobilita";
  return "altro";
}

function compareContractsNewestFirst(a: Contract, b: Contract): number {
  return Date.parse(b.awardDate) - Date.parse(a.awardDate) || b.id - a.id;
}

function newestIso(a: string, b: string): string {
  return Date.parse(b) > Date.parse(a) ? b : a;
}

function truncate(value: string, maxLength: number): string {
  return value.length <= maxLength
    ? value
    : `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}
