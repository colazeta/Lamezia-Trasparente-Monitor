#!/usr/bin/env tsx
import { readFile } from "node:fs/promises";
import process from "node:process";

type SourceStatus = "ok" | "stale" | "error" | "missing" | "warning";

type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface SourceHealthRecord {
  source: string;
  status: SourceStatus;
  label?: string;
  lastCheckedAt?: string;
  checkedAt?: string;
  lastSuccessAt?: string | null;
  reason?: string;
  priority?: "low" | "medium" | "high";
  consecutiveWarningRuns?: number;
  warningRuns?: number;
  persistent?: boolean;
  details?: JsonValue;
}

interface NormalizedAnomaly {
  source: string;
  label: string;
  status: Exclude<SourceStatus, "ok">;
  marker: string;
  title: string;
  priority: "low" | "medium" | "high";
  lastCheckedAt: string;
  lastSuccessAt?: string | null;
  reason: string;
  action: string;
}

interface CliOptions {
  auditFile?: string;
  url?: string;
  dryRun: boolean;
  repo?: string;
  warningRunsThreshold: number;
}

export interface GitHubIssue {
  number: number;
  html_url: string;
  body?: string | null;
  title?: string;
}

const ACTIONS_BY_STATUS: Record<NormalizedAnomaly["status"], string> = {
  stale:
    "Verificare soglia di aggiornamento, raggiungibilità della fonte e log dell'ultimo ciclo di ingestione.",
  error:
    "Verificare crawler, raggiungibilità della fonte, credenziali tecniche se previste e log ingestion.",
  missing:
    "Verificare che la fonte censita sia inclusa nello stato runtime e che il job di ingestione la riporti correttamente.",
  warning:
    "Verificare la ricorrenza dell'avviso tecnico, i log del crawler e gli eventuali fallback di monitoraggio.",
};

const RELEVANT_STATUSES = new Set<SourceStatus>([
  "stale",
  "error",
  "missing",
  "warning",
]);

const VOLATILE_ISSUE_LINE_PREFIXES = [
  "- Ultimo controllo:",
  "- Ultimo controllo riuscito:",
];

function usage(): string {
  return [
    "Usage: pnpm --dir scripts exec tsx check-source-health.ts [--audit-file <path> | --url <url>] [--dry-run]",
    "",
    "Environment:",
    "  SOURCE_HEALTH_AUDIT_PATH   Path to a JSON audit file, used when --audit-file is omitted.",
    "  SOURCE_HEALTH_URL          URL for GET /healthz/sources, used when --url is omitted.",
    "  SOURCE_HEALTH_WARNING_RUNS Number of consecutive warning runs required before opening/updating an issue (default: 2).",
    "  GITHUB_REPOSITORY          owner/repo for issue operations.",
    "  GITHUB_TOKEN or GH_TOKEN   Token with issues:write permission; required unless --dry-run is used.",
  ].join("\n");
}

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    auditFile: normalizeOptionalString(process.env.SOURCE_HEALTH_AUDIT_PATH),
    url: normalizeOptionalString(process.env.SOURCE_HEALTH_URL),
    dryRun: false,
    repo: normalizeOptionalString(process.env.GITHUB_REPOSITORY),
    warningRunsThreshold: parseInteger(
      process.env.SOURCE_HEALTH_WARNING_RUNS,
      2,
    ),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--audit-file") {
      options.auditFile = normalizeOptionalString(
        requiredValue(argv, (i += 1), arg),
      );
      options.url = undefined;
    } else if (arg === "--url") {
      options.url = normalizeOptionalString(requiredValue(argv, (i += 1), arg));
      options.auditFile = undefined;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--repo") {
      options.repo = normalizeOptionalString(requiredValue(argv, (i += 1), arg));
    } else if (arg === "--warning-runs") {
      options.warningRunsThreshold = parseInteger(
        requiredValue(argv, (i += 1), arg),
        2,
      );
    } else if (arg === "--help" || arg === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function requiredValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }
  return value;
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function parseInteger(value: string | undefined, fallback: number): number {
  const normalized = normalizeOptionalString(value);
  if (!normalized) return fallback;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function readSourceHealth(
  options: CliOptions,
): Promise<SourceHealthRecord[]> {
  const auditFile = normalizeOptionalString(options.auditFile);
  if (auditFile) {
    return readAuditFileSourceHealth(auditFile);
  }

  const url = normalizeOptionalString(options.url);
  if (!url) {
    console.log(
      "Source-health endpoint not configured: set SOURCE_HEALTH_URL or SOURCE_HEALTH_AUDIT_PATH. Skipping technical check without creating source-health anomalies.",
    );
    return [];
  }

  return readEndpointSourceHealth(url);
}

async function readAuditFileSourceHealth(
  auditFile: string,
): Promise<SourceHealthRecord[]> {
  try {
    const contents = await readFile(auditFile, "utf8");
    return normalizePayload(JSON.parse(contents));
  } catch (error) {
    return [
      monitorReadErrorRecord(
        `File audit non leggibile o JSON non valido (\`${auditFile}\`): ${formatErrorMessage(error)}`,
      ),
    ];
  }
}

async function readEndpointSourceHealth(
  url: string,
): Promise<SourceHealthRecord[]> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return [
        monitorReadErrorRecord(
          `Endpoint stato fonti raggiunto ma non disponibile (HTTP ${response.status}) su \`${url}\`.`,
        ),
      ];
    }

    const text = await response.text();
    try {
      return normalizePayload(JSON.parse(text));
    } catch (error) {
      return [
        monitorReadErrorRecord(
          `Endpoint stato fonti raggiunto ma risposta JSON non valida su \`${url}\`: ${formatErrorMessage(error)}`,
        ),
      ];
    }
  } catch (error) {
    return [
      monitorReadErrorRecord(
        `Endpoint stato fonti configurato ma non raggiungibile su \`${url}\`: ${formatErrorMessage(error)}`,
      ),
    ];
  }
}

export function normalizePayload(payload: unknown): SourceHealthRecord[] {
  const candidate = Array.isArray(payload)
    ? payload
    : isObject(payload) && Array.isArray(payload.sources)
      ? payload.sources
      : isObject(payload) && Array.isArray(payload.results)
        ? payload.results
        : isObject(payload) && Array.isArray(payload.audit)
          ? payload.audit
          : [];

  return candidate.flatMap((item) => {
    if (!isObject(item)) return [];
    const source = firstString(item.source, item.id, item.slug, item.name);
    const status = firstString(item.status, item.health, item.state) as
      | SourceStatus
      | undefined;
    if (!source || !isSourceStatus(status)) return [];
    return [
      {
        source,
        status,
        label: firstString(item.label, item.title, item.name),
        lastCheckedAt: firstString(
          item.lastCheckedAt,
          item.checkedAt,
          item.updatedAt,
          item.timestamp,
        ),
        checkedAt: firstString(item.checkedAt),
        lastSuccessAt: firstString(item.lastSuccessAt, item.lastOkAt) ?? null,
        reason: firstString(item.reason, item.message, item.error),
        priority: normalizePriority(firstString(item.priority, item.severity)),
        consecutiveWarningRuns: firstNumber(
          item.consecutiveWarningRuns,
          item.warningRuns,
          item.consecutiveWarnings,
        ),
        warningRuns: firstNumber(item.warningRuns),
        persistent: firstBoolean(
          item.persistent,
          item.isPersistent,
          item.warningPersistent,
        ),
        details: item as JsonValue,
      },
    ];
  });
}

export function detectAnomalies(
  records: SourceHealthRecord[],
  now = new Date(),
  warningRunsThreshold = 2,
): NormalizedAnomaly[] {
  return records.flatMap((record) => {
    if (!RELEVANT_STATUSES.has(record.status)) return [];
    if (
      record.status === "warning" &&
      !isPersistentWarning(record, warningRunsThreshold)
    )
      return [];

    const status = record.status as NormalizedAnomaly["status"];
    const source = record.source.trim();
    const label = record.label?.trim() || source;
    const marker = `source-health:${source}:${status}`;
    const lastCheckedAt =
      record.lastCheckedAt ?? record.checkedAt ?? now.toISOString();
    const reason = record.reason?.trim() || statusReason(status);

    return [
      {
        source,
        label,
        status,
        marker,
        title: `[source-health] ${label}: ${status}`,
        priority: record.priority ?? priorityForStatus(status),
        lastCheckedAt,
        lastSuccessAt: record.lastSuccessAt,
        reason,
        action: ACTIONS_BY_STATUS[status],
      },
    ];
  });
}

function monitorReadErrorRecord(reason: string): SourceHealthRecord {
  return {
    source: "source-health-monitor",
    status: "error",
    label: "Monitor fonti dati",
    checkedAt: new Date().toISOString(),
    lastSuccessAt: null,
    priority: "high",
    reason,
  };
}

function isPersistentWarning(
  record: SourceHealthRecord,
  threshold: number,
): boolean {
  if (record.persistent) return true;
  const runs = record.consecutiveWarningRuns ?? record.warningRuns ?? 0;
  return runs >= threshold;
}

function statusReason(status: NormalizedAnomaly["status"]): string {
  switch (status) {
    case "stale":
      return "Fonte non aggiornata entro la soglia tecnica attesa.";
    case "error":
      return "Controllo tecnico della fonte non riuscito.";
    case "missing":
      return "Fonte censita ma non presente nello stato runtime.";
    case "warning":
      return "Avviso tecnico ricorrente sul monitoraggio della fonte.";
  }
}

function priorityForStatus(
  status: NormalizedAnomaly["status"],
): "low" | "medium" | "high" {
  if (status === "error" || status === "missing") return "high";
  if (status === "stale") return "medium";
  return "low";
}

export function renderIssueBody(anomaly: NormalizedAnomaly): string {
  return [
    `<!-- ${anomaly.marker} -->`,
    `Collegata alla issue #123.`,
    "",
    "## Rilevazione tecnica",
    "",
    `- Fonte: ${anomaly.label} (\`${anomaly.source}\`)`,
    `- Stato monitoraggio: \`${anomaly.status}\``,
    `- Ultimo controllo: ${anomaly.lastCheckedAt}`,
    `- Ultimo controllo riuscito: ${anomaly.lastSuccessAt ?? "non disponibile nello stato letto"}`,
    `- Priorità operativa: ${anomaly.priority}`,
    "",
    "## Nota di cautela",
    "",
    "Questa issue segnala un possibile problema tecnico o operativo del monitoraggio automatico. Non indica una mancanza sostantiva degli atti pubblici, né permette di trarre conclusioni su responsabilità, intenzioni o completezza documentale dell'ente.",
    "",
    "## Dettaglio rilevato",
    "",
    anomaly.reason,
    "",
    "## Azioni suggerite",
    "",
    `- ${anomaly.action}`,
    "- Annotare eventuali limitazioni della fonte o del crawler prima di aggiornare la issue.",
    "- Non chiudere automaticamente: la chiusura richiede verifica manuale nella v0.",
  ].join("\n");
}

async function githubRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token)
    throw new Error(
      "GITHUB_TOKEN or GH_TOKEN is required for GitHub issue operations.",
    );

  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `GitHub API ${path} returned HTTP ${response.status}: ${text}`,
    );
  }

  return (await response.json()) as T;
}

async function findOpenIssue(
  repo: string,
  marker: string,
): Promise<GitHubIssue | undefined> {
  const q = encodeURIComponent(
    `repo:${repo} is:issue is:open in:body ${marker}`,
  );
  const result = await githubRequest<{ items: GitHubIssue[] }>(
    `/search/issues?q=${q}&per_page=5`,
  );
  return result.items.find((issue) => issue.body?.includes(marker));
}

async function createOrUpdateIssue(
  repo: string,
  anomaly: NormalizedAnomaly,
): Promise<GitHubIssue> {
  const existing = await findOpenIssue(repo, anomaly.marker);
  const body = renderIssueBody(anomaly);

  if (!existing) {
    return githubRequest<GitHubIssue>(`/repos/${repo}/issues`, {
      method: "POST",
      body: JSON.stringify({
        title: anomaly.title,
        body,
        labels: ["source-health", "ops"],
      }),
    });
  }

  if (shouldUpdateExistingIssue(existing, anomaly)) {
    return githubRequest<GitHubIssue>(
      `/repos/${repo}/issues/${existing.number}`,
      {
        method: "PATCH",
        body: JSON.stringify({ title: anomaly.title, body }),
      },
    );
  }

  return existing;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const records = await readSourceHealth(options);
  const anomalies = detectAnomalies(
    records,
    new Date(),
    options.warningRunsThreshold,
  );

  if (anomalies.length === 0) {
    console.log(
      "No source-health anomalies requiring issue updates were detected.",
    );
    return;
  }

  if (options.dryRun) {
    console.log(JSON.stringify({ anomalies }, null, 2));
    return;
  }

  if (!options.repo)
    throw new Error(
      "GITHUB_REPOSITORY or --repo is required unless --dry-run is used.",
    );

  for (const anomaly of anomalies) {
    const issue = await createOrUpdateIssue(options.repo, anomaly);
    console.log(`${anomaly.marker} -> #${issue.number} ${issue.html_url}`);
  }
}

export function shouldUpdateExistingIssue(
  existing: Pick<GitHubIssue, "body" | "title">,
  anomaly: NormalizedAnomaly,
): boolean {
  if (existing.title !== anomaly.title) return true;

  const existingBody = existing.body ?? "";
  const nextBody = renderIssueBody(anomaly);
  if (existingBody === nextBody) return false;

  return (
    stripVolatileIssueLines(existingBody) !== stripVolatileIssueLines(nextBody)
  );
}

function stripVolatileIssueLines(body: string): string {
  return body
    .split("\n")
    .filter(
      (line) =>
        !VOLATILE_ISSUE_LINE_PREFIXES.some((prefix) => line.startsWith(prefix)),
    )
    .join("\n");
}

function formatErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function firstBoolean(...values: unknown[]): boolean | undefined {
  for (const value of values) {
    if (typeof value === "boolean") return value;
  }
  return undefined;
}

function isSourceStatus(status: unknown): status is SourceStatus {
  return (
    status === "ok" ||
    status === "stale" ||
    status === "error" ||
    status === "missing" ||
    status === "warning"
  );
}

function normalizePriority(
  value: string | undefined,
): SourceHealthRecord["priority"] {
  if (value === "low" || value === "medium" || value === "high") return value;
  if (value === "critical") return "high";
  return undefined;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
