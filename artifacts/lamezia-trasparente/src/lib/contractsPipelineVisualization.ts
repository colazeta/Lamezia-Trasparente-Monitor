import anacCigDryRunReport from "../../../../data/interim/contracts/ingestion/anac-open-data-cig-annual.ingestion-dry-run.json";

import {
  contractsSourceManifest,
  getContractSourceById,
  summariseSourceManifest,
  type ContractSourceDiscoveryStatus,
  type ContractSourceIngestionStatus,
  type ContractSourcePublicClaimLevel,
} from "./contractsSourceManifest";

export type ContractPipelineStageState =
  | "complete"
  | "ready"
  | "blocked"
  | "inactive";

export interface ContractPipelineStage {
  id: string;
  title: string;
  label: string;
  state: ContractPipelineStageState;
  description: string;
  detail: string;
}

export interface ContractPipelineSnapshot {
  sourceId: string;
  sourceLabel: string;
  discoveryStatus: ContractSourceDiscoveryStatus | "missing";
  dryRunGate: string;
  fixtureRecordsTotal: number;
  parsedFixtureRecords: number;
  needsReviewFixtureRecords: number;
  productionIngestionAllowed: boolean;
  productionRecordsWritten: boolean;
  publicAppDataWritten: boolean;
  databaseWrites: boolean;
  manifestIngestionStatus: ContractSourceIngestionStatus;
  manifestPublicClaimLevel: ContractSourcePublicClaimLevel;
  manifestSourcesTotal: number;
  manualDiscoveryRequired: number;
  nextAction: string;
  stages: ContractPipelineStage[];
}

interface AnacCigDryRunReport {
  source_id: string;
  source_label: string;
  discovery_verification_result: ContractSourceDiscoveryStatus | "missing";
  production_gate_status: string;
  production_ingestion_allowed: boolean;
  production_records_written: boolean;
  public_app_data_written: boolean;
  database_writes: boolean;
  fixture_records_total: number;
  manifest_ingestion_status: ContractSourceIngestionStatus;
  manifest_public_claim_level: ContractSourcePublicClaimLevel;
  parser_results: {
    parsed: number;
    needs_review: number;
  };
  next_action: string;
}

const dryRunReport = anacCigDryRunReport as AnacCigDryRunReport;

export function buildContractPipelineSnapshot(
  report: AnacCigDryRunReport = dryRunReport,
): ContractPipelineSnapshot {
  const manifestSummary = summariseSourceManifest();
  const source = getContractSourceById(
    report.source_id,
    contractsSourceManifest,
  );
  const discoveryStatus =
    source?.discovery_metadata?.discovery_status ??
    report.discovery_verification_result;
  const productionBlocked = report.production_ingestion_allowed !== true;

  return {
    sourceId: report.source_id,
    sourceLabel: source?.label ?? report.source_label,
    discoveryStatus,
    dryRunGate: report.production_gate_status,
    fixtureRecordsTotal: report.fixture_records_total,
    parsedFixtureRecords: report.parser_results.parsed,
    needsReviewFixtureRecords: report.parser_results.needs_review,
    productionIngestionAllowed: report.production_ingestion_allowed,
    productionRecordsWritten: report.production_records_written,
    publicAppDataWritten: report.public_app_data_written,
    databaseWrites: report.database_writes,
    manifestIngestionStatus: report.manifest_ingestion_status,
    manifestPublicClaimLevel: report.manifest_public_claim_level,
    manifestSourcesTotal: manifestSummary.totalSources,
    manualDiscoveryRequired: manifestSummary.manualDiscoveryRequired.length,
    nextAction: report.next_action,
    stages: [
      {
        id: "manifest",
        title: "Catalogo fonti",
        label: "Presente",
        state: "complete",
        description:
          "Famiglie fonte censite con assi CIG/CUP, copertura lifecycle e limiti pubblici.",
        detail: `${manifestSummary.totalSources} famiglie fonte nel manifesto`,
      },
      {
        id: "discovery",
        title: "Discovery ANAC CIG",
        label:
          discoveryStatus === "verified" ? "Verificata" : "Verifica manuale",
        state: discoveryStatus === "verified" ? "ready" : "blocked",
        description:
          "Controllo metadata-only sul dataset annuale CIG, separato dai record reali.",
        detail:
          discoveryStatus === "verified"
            ? "Endpoint strutturato pronto per parser"
            : "Endpoint stabile non ancora verificato",
      },
      {
        id: "dry-run",
        title: "Dry-run ingestion",
        label: "Funzionante",
        state: "complete",
        description:
          "Parser eseguito su fixture sintetica per provare mapping e report senza record reali.",
        detail: `${report.parser_results.parsed} parsed, ${report.parser_results.needs_review} da rivedere`,
      },
      {
        id: "public-gate",
        title: "Gate pubblico",
        label: productionBlocked ? "Produzione chiusa" : "Revisione richiesta",
        state: productionBlocked ? "blocked" : "ready",
        description:
          "Blocca database, dati pubblici e schede /contratti finche fonte e revisione non sono complete.",
        detail: productionBlocked
          ? "0 record produzione, 0 scritture pubbliche"
          : "Richiede revisione umana prima della pubblicazione",
      },
    ],
  };
}
