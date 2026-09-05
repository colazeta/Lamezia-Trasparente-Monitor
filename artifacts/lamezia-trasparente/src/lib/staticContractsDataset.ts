import type { FeedStatus } from "@workspace/api-client-react";
import {
  buildAnacBdncpConnectionStatus,
  createPendingAnacBdncpSnapshot,
  type AnacBdncpSyncSnapshot,
} from "./anacBdncpSync";
import { officialAlboUrl, isUnknownSupplier } from "./staticContractsDataset.parse";
import {
  buildContractProjection,
  buildUnresolvedCandidate,
} from "./staticContractsDataset.projection";
import {
  STATIC_CONTRACTS_SCHEMA_VERSION,
  type AlboPublicSnapshot,
  type CanonicalAlboCorpusSnapshot,
  type CanonicalProcurementRecord,
  type StaticContractsDataset,
} from "./staticContractsDataset.types";

export {
  STATIC_CONTRACTS_DATA_PATH,
  STATIC_CONTRACTS_SCHEMA_VERSION,
  type AlboPublicSnapshot,
  type CanonicalAlboCorpusSnapshot,
  type StaticContractsDataset,
  type UnresolvedProcurementCandidate,
} from "./staticContractsDataset.types";
export { extractCig, extractCup, parseExplicitAmount } from "./staticContractsDataset.parse";

export function buildStaticContractsDataset(
  snapshot: AlboPublicSnapshot,
  anacSnapshot: AnacBdncpSyncSnapshot = createPendingAnacBdncpSnapshot(),
  canonicalCorpus: CanonicalAlboCorpusSnapshot,
): StaticContractsDataset {
  const generatedAt = validIsoDate(snapshot.generated_at)
    ? snapshot.generated_at!
    : validIsoDate(snapshot.retrieved_at)
      ? snapshot.retrieved_at!
      : new Date(0).toISOString();
  const sourceUrl =
    officialAlboUrl(snapshot.source_url) ??
    "https://albo.tinnvision.cloud/?ente=00301390795";
  const candidateRecords = canonicalCorpus.records.filter(
    (record) =>
      record.public_projection_eligible &&
      isProcurementCandidate(record.taxonomy.procurement.relevance),
  );
  const unresolvedProcurementCandidates = candidateRecords
    .filter((record) => record.identifiers.cigs.length === 0)
    .map(buildUnresolvedCandidate)
    .sort((a, b) =>
      (b.publicationNumber ?? "").localeCompare(a.publicationNumber ?? ""),
    );
  const projection = buildContractProjection(candidateRecords);
  const limitations = uniqueStrings([
    "Il perimetro resta limitato alla finestra corrente dell'Albo Pretorio: non e' ancora uno storico completo dei contratti del Comune.",
    "Tutti i record dello snapshot ricevono una decisione tassonomica; gli atti procurement-related senza CIG non vengono scartati ma restano esplicitamente unresolved finche' non e' possibile collegarli a un contratto canonico.",
    "La materializzazione dell'entita' Contract nel contratto API corrente richiede ancora un CIG; questo requisito non e' usato come filtro di ingresso nella tassonomia procurement.",
    "Il campo legacy publicClaim descrive soltanto la lista Contract materializzata con CIG; researchClaim, taxonomy e unresolvedProcurementCandidates descrivono la proiezione procurement piu' ampia.",
    "La tassonomia opera sui campi public-safe dello snapshot corrente; allegati e PDF non sono ancora analizzati per estrarre CIG, CUP, operatori o importi aggiuntivi.",
    "Ogni CIG formalmente identificato collega la vista ufficiale ANAC; la copertura strutturata resta limitata ai pacchetti dichiarati nello stato della fonte.",
    "Un CIG senza match nello snapshot ANAC consultato non risulta per questo assente dalla BDNCP.",
    ...(snapshot.known_limits ?? []),
  ]);
  const feedStatus: FeedStatus = {
    source: "albo_pretorio_procurement_current",
    label: "Albo Pretorio — atti procurement tassonomizzati",
    url: sourceUrl,
    status: "current-window",
    error: null,
    itemsTotal: projection.contracts.length,
    itemsNew: 0,
    lastCheckedAt: validIsoDate(snapshot.retrieved_at)
      ? snapshot.retrieved_at!
      : generatedAt,
    lastUpdatedAt: generatedAt,
  };
  const anacConnection = buildAnacBdncpConnectionStatus(
    anacSnapshot,
    projection.contracts.map((contract) => contract.cig),
  );

  return {
    schemaVersion: STATIC_CONTRACTS_SCHEMA_VERSION,
    generatedAt,
    source: {
      id: "albo_pretorio_procurement_current",
      label: snapshot.source?.trim() || "Albo Pretorio Comune di Lamezia Terme",
      url: sourceUrl,
      scope: "current-albo-window",
      publicClaim: "atti correnti con CIG",
      researchClaim: "atti procurement correnti tassonomizzati",
      limitations,
    },
    taxonomy: {
      canonicalCorpusSchemaVersion: canonicalCorpus.schema_version,
      taxonomyCoverage: canonicalCorpus.coverage.taxonomy_coverage,
      taxonomyDecided: canonicalCorpus.coverage.taxonomy_decided,
    },
    coverage: {
      alboItemsAcquired:
        finiteNonNegative(snapshot.counts?.acquired) ??
        canonicalCorpus.coverage.records_materialised,
      publicItems:
        finiteNonNegative(snapshot.counts?.publishable) ??
        canonicalCorpus.coverage.public_projection_eligible,
      procurementCandidates: candidateRecords.length,
      procurementItemsWithCig: candidateRecords.filter(
        (record) => record.identifiers.cigs.length > 0,
      ).length,
      unresolvedProcurementCandidates: unresolvedProcurementCandidates.length,
      // Compatibility-only alias for consumers of the v1 Contract-list shape.
      // Record-level research coverage is procurementItemsWithCig in this view
      // and public_procurement_with_cig in the canonical corpus ledger.
      cigBearingItems: projection.contracts.length,
      contracts: projection.contracts.length,
      lifecycleEvents: projection.lifecycleEvents,
      withCup: projection.contracts.filter((contract) => Boolean(contract.cup)).length,
      withExplicitAmount: projection.contracts.filter((contract) => contract.amount > 0).length,
      withExplicitSupplier: projection.contracts.filter(
        (contract) => !isUnknownSupplier(contract.supplier),
      ).length,
    },
    unresolvedProcurementCandidates,
    feedStatus,
    anacConnection,
    contracts: projection.contracts,
    storylines: projection.storylines,
  };
}

function isProcurementCandidate(
  relevance: CanonicalProcurementRecord["taxonomy"]["procurement"]["relevance"],
): relevance is "confirmed" | "possible" {
  return relevance === "confirmed" || relevance === "possible";
}

function validIsoDate(value: string | null | undefined): boolean {
  return Boolean(value && !Number.isNaN(Date.parse(value)));
}

function finiteNonNegative(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : null;
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.replace(/\s+/gu, " ").trim()).filter(Boolean)),
  );
}
