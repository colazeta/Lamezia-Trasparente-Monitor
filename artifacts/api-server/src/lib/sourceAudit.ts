import { db, feedStatusTable, type FeedStatus } from "@workspace/db";
import { asc } from "drizzle-orm";
import {
  MONITORED_SOURCES,
  type MonitoredSource,
  type SourceKind,
  type SourcePriority,
} from "./sourceRegistry";

export type SourceAuditStatus =
  | "ok"
  | "warning"
  | "error"
  | "missing"
  | "stale";
export type SourceHealthStatus = "ok" | "warning" | "error";

export type FeedStatusAuditRow = Pick<
  FeedStatus,
  | "source"
  | "status"
  | "error"
  | "itemsTotal"
  | "itemsNew"
  | "lastCheckedAt"
  | "lastUpdatedAt"
>;

export type SourceAuditResult = {
  source: string;
  label: string;
  kind: SourceKind;
  priority: SourcePriority;
  status: SourceAuditStatus;
  lastCheckedAt: string | null;
  lastUpdatedAt: string | null;
  freshnessMinutes: number | null;
  itemsTotal: number | null;
  itemsNew: number | null;
  error: string | null;
  completenessScore: number;
  findings: string[];
};

export type SourceAuditSummary = {
  total: number;
  ok: number;
  warning: number;
  stale: number;
  error: number;
  missing: number;
  criticalOpen: number;
};

export type SourceAuditPayload = {
  status: SourceHealthStatus;
  generatedAt: string;
  summary: SourceAuditSummary;
  sources: SourceAuditResult[];
};

const SCORE_BY_STATUS: Record<SourceAuditStatus, number> = {
  ok: 1,
  warning: 0.7,
  stale: 0.4,
  error: 0.2,
  missing: 0,
};

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function freshnessMinutes(
  lastCheckedAt: Date | string | null | undefined,
  now: Date,
): number | null {
  if (!lastCheckedAt) return null;
  const checked =
    lastCheckedAt instanceof Date ? lastCheckedAt : new Date(lastCheckedAt);
  if (Number.isNaN(checked.getTime())) return null;
  return Math.max(0, Math.floor((now.getTime() - checked.getTime()) / 60000));
}

function isOperationallyOpen(result: SourceAuditResult): boolean {
  return ["error", "missing", "stale"].includes(result.status);
}

export function aggregateSourceAudit(
  sources: SourceAuditResult[],
): Pick<SourceAuditPayload, "status" | "summary"> {
  const summary: SourceAuditSummary = {
    total: sources.length,
    ok: 0,
    warning: 0,
    stale: 0,
    error: 0,
    missing: 0,
    criticalOpen: 0,
  };

  for (const source of sources) {
    summary[source.status] += 1;
    if (
      (source.priority === "critical" || source.priority === "high") &&
      isOperationallyOpen(source)
    ) {
      summary.criticalOpen += 1;
    }
  }

  const status: SourceHealthStatus =
    summary.criticalOpen > 0
      ? "error"
      : summary.warning > 0 ||
          summary.stale > 0 ||
          summary.error > 0 ||
          summary.missing > 0
        ? "warning"
        : "ok";

  return { status, summary };
}

export function auditSources(
  registry: readonly MonitoredSource[],
  statuses: readonly FeedStatusAuditRow[],
  now: Date = new Date(),
): SourceAuditPayload {
  const rowsBySource = new Map(statuses.map((row) => [row.source, row]));

  const sources = registry.map<SourceAuditResult>((source) => {
    const row = rowsBySource.get(source.source);
    if (!row) {
      return {
        source: source.source,
        label: source.label,
        kind: source.kind,
        priority: source.priority,
        status: "missing",
        lastCheckedAt: null,
        lastUpdatedAt: null,
        freshnessMinutes: null,
        itemsTotal: null,
        itemsNew: null,
        error: null,
        completenessScore: SCORE_BY_STATUS.missing,
        findings: [
          "Fonte monitorata non presente in feed_status: verifica richiesta.",
        ],
      };
    }

    const findings: string[] = [];
    const minutes = freshnessMinutes(row.lastCheckedAt, now);
    let status: SourceAuditStatus = "ok";
    let error = row.error ?? null;

    if (row.status === "error") {
      status = "error";
      findings.push(
        "Errore tecnico registrato dall'ultimo controllo della fonte.",
      );
      if (!error) error = "Errore tecnico senza dettaglio registrato.";
    } else if (minutes === null) {
      status = "warning";
      findings.push("Fonte censita ma senza ultimo controllo registrato.");
    } else if (minutes > source.staleAfterMinutes) {
      status = "stale";
      findings.push(
        `Ultimo controllo più vecchio della soglia operativa (${source.staleAfterMinutes} minuti).`,
      );
    } else if (row.status !== "ok") {
      status = "warning";
      findings.push(
        `Stato operativo non verde registrato in feed_status: ${row.status}.`,
      );
    }

    if (
      status === "ok" &&
      source.requiredSignals?.includes("itemsTotal") &&
      row.itemsTotal === 0
    ) {
      status = "warning";
      findings.push(
        "Segnale di copertura debole: itemsTotal è 0 per una fonte che dovrebbe esporre righe.",
      );
    }

    if (findings.length === 0) {
      findings.push(
        "Ultimo controllo recente e senza errori tecnici registrati.",
      );
    }

    return {
      source: source.source,
      label: source.label,
      kind: source.kind,
      priority: source.priority,
      status,
      lastCheckedAt: toIso(row.lastCheckedAt),
      lastUpdatedAt: toIso(row.lastUpdatedAt),
      freshnessMinutes: minutes,
      itemsTotal: row.itemsTotal ?? null,
      itemsNew: row.itemsNew ?? null,
      error,
      completenessScore: SCORE_BY_STATUS[status],
      findings,
    };
  });

  return {
    generatedAt: now.toISOString(),
    sources,
    ...aggregateSourceAudit(sources),
  };
}

export async function getSourceAudit(
  now: Date = new Date(),
): Promise<SourceAuditPayload> {
  const statuses = await db
    .select({
      source: feedStatusTable.source,
      status: feedStatusTable.status,
      error: feedStatusTable.error,
      itemsTotal: feedStatusTable.itemsTotal,
      itemsNew: feedStatusTable.itemsNew,
      lastCheckedAt: feedStatusTable.lastCheckedAt,
      lastUpdatedAt: feedStatusTable.lastUpdatedAt,
    })
    .from(feedStatusTable)
    .orderBy(asc(feedStatusTable.source));

  return auditSources(MONITORED_SOURCES, statuses, now);
}
