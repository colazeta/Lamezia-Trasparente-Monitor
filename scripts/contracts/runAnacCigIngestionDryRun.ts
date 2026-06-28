import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  contractsSourceManifest,
  getContractSourceById,
  type ContractSourceDiscoveryStatus,
  type ContractSourceFamily,
  type ContractSourceIngestionStatus,
  type ContractSourcePublicClaimLevel,
  type ContractSourceUpdateMode,
} from "../../artifacts/lamezia-trasparente/src/lib/contractsSourceManifest";
import { parseAnacCigFixtureFile } from "./anacCigParser";
import {
  ANAC_CIG_PARSER_VERSION,
  type AnacCigNormalisationResult,
} from "./normaliseContractDossier";

export const DEFAULT_ANAC_CIG_DRY_RUN_SOURCE_ID = "anac-open-data-cig-annual";
export const DEFAULT_ANAC_CIG_DRY_RUN_FIXTURE_PATH =
  "artifacts/lamezia-trasparente/src/test/fixtures/contracts/anac/anac-cig-fixture.json";
export const DEFAULT_ANAC_CIG_DRY_RUN_REPORT_DIR =
  "data/interim/contracts/ingestion";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..");

export type IngestionDryRunMode = "fixture_only";

export type IngestionDryRunGateStatus =
  | "blocked_missing_discovery_report"
  | "blocked_by_source_discovery"
  | "blocked_by_manifest_status"
  | "human_review_required";

export interface AnacCigIngestionDryRunReport {
  schema_version: "contracts-anac-cig-ingestion-dry-run.v1";
  source_id: string;
  source_label: string;
  generated_at: string;
  checked_by: "codex";
  mode: IngestionDryRunMode;
  parser_version: string;
  fixture_path: string;
  discovery_report_path: string;
  discovery_verification_result: ContractSourceDiscoveryStatus | "missing";
  discovery_suitable_for_parser: boolean;
  manifest_ingestion_status: ContractSourceIngestionStatus;
  manifest_public_claim_level: ContractSourcePublicClaimLevel;
  dry_run_status: "completed";
  production_gate_status: IngestionDryRunGateStatus;
  production_ingestion_allowed: false;
  production_records_written: false;
  public_app_data_written: false;
  database_writes: false;
  fixture_records_total: number;
  parser_results: {
    parsed: number;
    needs_review: number;
    skipped: number;
    failed: number;
  };
  limitations: string[];
  next_action: string;
}

export interface RunAnacCigIngestionDryRunResult {
  report: AnacCigIngestionDryRunReport;
  reportPath: string;
}

export interface RunAnacCigIngestionDryRunOptions {
  sourceId?: string;
  fixturePath?: string;
  discoveryReportPath?: string;
  reportDir?: string;
  generatedAt?: string;
}

interface DiscoveryReportSnapshot {
  status: "present" | "missing";
  verificationResult: ContractSourceDiscoveryStatus | "missing";
  suitableForParser: boolean;
  limitations: string[];
  nextParserAction: string | null;
}

export async function runAnacCigIngestionDryRun(
  options: RunAnacCigIngestionDryRunOptions = {},
): Promise<RunAnacCigIngestionDryRunResult> {
  const sourceId = options.sourceId ?? DEFAULT_ANAC_CIG_DRY_RUN_SOURCE_ID;
  const source = getContractSourceById(sourceId, contractsSourceManifest);

  if (!source) {
    throw new Error(`Unknown contract source id: ${sourceId}`);
  }

  if (
    source.authority !== "ANAC" ||
    !source.primary_identifiers.includes("CIG")
  ) {
    throw new Error(
      `Source ${sourceId} is not an ANAC CIG source family for this dry-run.`,
    );
  }

  const fixturePath = resolveRepoPath(
    options.fixturePath ?? DEFAULT_ANAC_CIG_DRY_RUN_FIXTURE_PATH,
  );
  const discoveryReportPath = resolveRepoPath(
    options.discoveryReportPath ?? defaultDiscoveryReportPath(sourceId),
  );
  const reportDir = resolveRepoPath(
    options.reportDir ?? DEFAULT_ANAC_CIG_DRY_RUN_REPORT_DIR,
  );
  const reportPath = resolve(reportDir, `${sourceId}.ingestion-dry-run.json`);

  assertSafeDryRunReportPath(reportPath);

  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const discovery = await readDiscoveryReportSnapshot(discoveryReportPath);
  const parserResults = await parseAnacCigFixtureFile(fixturePath, {
    source_dataset_id: source.id,
    source_dataset_label: `${source.label} - dry-run fixture`,
    source_downloaded_at: generatedAt,
    source_published_at: null,
    source_update_kind: mapSourceUpdateKind(source.update_mode),
  });

  const report = buildAnacCigIngestionDryRunReport({
    source,
    generatedAt,
    fixturePath,
    discoveryReportPath,
    discovery,
    parserResults,
  });

  await mkdir(reportDir, { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return { report, reportPath };
}

export function buildAnacCigIngestionDryRunReport(input: {
  source: ContractSourceFamily;
  generatedAt: string;
  fixturePath: string;
  discoveryReportPath: string;
  discovery: DiscoveryReportSnapshot;
  parserResults: AnacCigNormalisationResult[];
}): AnacCigIngestionDryRunReport {
  const parserSummary = summariseParserResults(input.parserResults);
  const productionGateStatus = determineProductionGateStatus(
    input.source,
    input.discovery,
  );

  return {
    schema_version: "contracts-anac-cig-ingestion-dry-run.v1",
    source_id: input.source.id,
    source_label: input.source.label,
    generated_at: input.generatedAt,
    checked_by: "codex",
    mode: "fixture_only",
    parser_version: ANAC_CIG_PARSER_VERSION,
    fixture_path: normalizeReportPath(input.fixturePath),
    discovery_report_path: normalizeReportPath(input.discoveryReportPath),
    discovery_verification_result: input.discovery.verificationResult,
    discovery_suitable_for_parser: input.discovery.suitableForParser,
    manifest_ingestion_status: input.source.ingestion_status,
    manifest_public_claim_level: input.source.public_claim_level,
    dry_run_status: "completed",
    production_gate_status: productionGateStatus,
    production_ingestion_allowed: false,
    production_records_written: false,
    public_app_data_written: false,
    database_writes: false,
    fixture_records_total: input.parserResults.length,
    parser_results: parserSummary,
    limitations: buildLimitations(input.discovery, productionGateStatus),
    next_action: buildNextAction(input.discovery, productionGateStatus),
  };
}

export function assertSafeDryRunReportPath(reportPath: string): void {
  const resolved = resolve(reportPath);
  const forbiddenRoots = [
    resolve(REPO_ROOT, "artifacts/lamezia-trasparente/public"),
    resolve(REPO_ROOT, "artifacts/lamezia-trasparente/src"),
    resolve(REPO_ROOT, "data/public"),
    resolve(REPO_ROOT, "public"),
  ];

  for (const forbiddenRoot of forbiddenRoots) {
    if (isPathInside(resolved, forbiddenRoot)) {
      throw new Error(
        `Dry-run report path cannot target a public app or source data directory: ${reportPath}`,
      );
    }
  }
}

function summariseParserResults(results: AnacCigNormalisationResult[]) {
  return results.reduce(
    (summary, result) => {
      summary[result.status] += 1;
      return summary;
    },
    {
      parsed: 0,
      needs_review: 0,
      skipped: 0,
      failed: 0,
    },
  );
}

async function readDiscoveryReportSnapshot(
  reportPath: string,
): Promise<DiscoveryReportSnapshot> {
  try {
    const raw = JSON.parse(await readFile(reportPath, "utf8")) as Record<
      string,
      unknown
    >;
    const verificationResult = parseDiscoveryStatus(
      raw.verification_result ?? raw.discovery_status,
    );

    return {
      status: "present",
      verificationResult,
      suitableForParser: raw.suitable_for_parser === true,
      limitations: readStringArray(raw.limitations),
      nextParserAction:
        typeof raw.next_parser_action === "string"
          ? raw.next_parser_action
          : null,
    };
  } catch (error) {
    if (getErrorCode(error) === "ENOENT") {
      return {
        status: "missing",
        verificationResult: "missing",
        suitableForParser: false,
        limitations: [
          "Discovery report non trovato: dry-run limitato alla fixture locale.",
        ],
        nextParserAction: null,
      };
    }

    throw error;
  }
}

function determineProductionGateStatus(
  source: ContractSourceFamily,
  discovery: DiscoveryReportSnapshot,
): IngestionDryRunGateStatus {
  if (discovery.status === "missing") {
    return "blocked_missing_discovery_report";
  }

  if (
    discovery.verificationResult !== "verified" ||
    discovery.suitableForParser !== true
  ) {
    return "blocked_by_source_discovery";
  }

  if (source.ingestion_status !== "ready_for_parser") {
    return "blocked_by_manifest_status";
  }

  return "human_review_required";
}

function buildLimitations(
  discovery: DiscoveryReportSnapshot,
  gateStatus: IngestionDryRunGateStatus,
): string[] {
  const limitations = [
    "Dry-run fixture-only: nessun record ANAC reale e stato scaricato, salvato o pubblicato.",
    "Il report verifica il contratto tecnico del parser, non abilita l'ingestione produzione.",
    "Nessuna scrittura in database, public app data, /contratti o /contratti/:id.",
    ...discovery.limitations,
  ];

  if (gateStatus === "blocked_by_source_discovery") {
    limitations.push(
      "La fonte ANAC resta da verificare manualmente prima di qualsiasi parser reale.",
    );
  }

  if (gateStatus === "blocked_missing_discovery_report") {
    limitations.push(
      "Il report di discovery deve essere presente prima di promuovere la pipeline.",
    );
  }

  return [...new Set(limitations)];
}

function buildNextAction(
  discovery: DiscoveryReportSnapshot,
  gateStatus: IngestionDryRunGateStatus,
): string {
  if (gateStatus === "blocked_missing_discovery_report") {
    return "Eseguire prima la discovery ufficiale ANAC e salvare il report metadata-only.";
  }

  if (gateStatus === "blocked_by_source_discovery") {
    return (
      discovery.nextParserAction ??
      "Verificare manualmente endpoint, versione, schema e licenza del pacchetto ANAC CIG annuale."
    );
  }

  if (gateStatus === "blocked_by_manifest_status") {
    return "Aggiornare il manifesto a ready_for_parser solo dopo discovery verificata e revisione umana.";
  }

  return "Eseguire revisione umana esplicita prima di abilitare download, persistenza o UI pubblica.";
}

function parseDiscoveryStatus(value: unknown): ContractSourceDiscoveryStatus {
  if (
    value === "not_checked" ||
    value === "verified" ||
    value === "needs_manual_verification" ||
    value === "unavailable" ||
    value === "failed"
  ) {
    return value;
  }

  return "needs_manual_verification";
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function mapSourceUpdateKind(
  updateMode: ContractSourceUpdateMode,
): "full" | "delta" | "manual" | "unknown" {
  if (updateMode === "full_dump") {
    return "full";
  }

  if (updateMode === "delta") {
    return "delta";
  }

  if (updateMode === "manual") {
    return "manual";
  }

  return "unknown";
}

function defaultDiscoveryReportPath(sourceId: string): string {
  return `data/interim/contracts/source-discovery/${sourceId}.discovery.json`;
}

function normalizeReportPath(path: string): string {
  const resolvedPath = resolve(path);
  const relativePath = relative(REPO_ROOT, resolvedPath);
  const reportPath = isPathInside(resolvedPath, REPO_ROOT)
    ? relativePath || "."
    : path;

  return reportPath.replace(/\\/g, "/");
}

function resolveRepoPath(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  return isAbsolute(path) ? path : resolve(REPO_ROOT, path);
}

function isPathInside(targetPath: string, rootPath: string): boolean {
  const relativePath = relative(rootPath, targetPath);

  return (
    relativePath === "" ||
    (!!relativePath &&
      !relativePath.startsWith("..") &&
      !isAbsolute(relativePath))
  );
}

function getErrorCode(error: unknown): string | undefined {
  return typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
    ? (error as { code: string }).code
    : undefined;
}

function parseCliArgs(argv: string[]): RunAnacCigIngestionDryRunOptions {
  const options: RunAnacCigIngestionDryRunOptions = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = argv[index + 1];

    if (arg === "--source" && nextValue) {
      options.sourceId = nextValue;
      index += 1;
      continue;
    }

    if (arg === "--fixture" && nextValue) {
      options.fixturePath = nextValue;
      index += 1;
      continue;
    }

    if (arg === "--discovery-report" && nextValue) {
      options.discoveryReportPath = nextValue;
      index += 1;
      continue;
    }

    if (arg === "--report-dir" && nextValue) {
      options.reportDir = nextValue;
      index += 1;
      continue;
    }

    if (!arg.startsWith("--") && !options.sourceId) {
      options.sourceId = arg;
      continue;
    }

    throw new Error(
      "Usage: tsx scripts/contracts/runAnacCigIngestionDryRun.ts [source-id] [--fixture path] [--discovery-report path] [--report-dir path]",
    );
  }

  return options;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = await runAnacCigIngestionDryRun(
    parseCliArgs(process.argv.slice(2)),
  );
  console.log(
    `ANAC CIG ingestion dry-run report written to ${result.reportPath}`,
  );
  console.log(
    `gate=${result.report.production_gate_status}; parsed=${result.report.parser_results.parsed}; needs_review=${result.report.parser_results.needs_review}; production_writes=${result.report.production_records_written}`,
  );
}
