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

export type SourceStatusRow = {
  source: string;
  label?: string | null;
  url?: string | null;
  status?: string | null;
  error?: string | null;
  itemsTotal?: number | null;
  itemsNew?: number | null;
  lastCheckedAt?: Date | string | null;
  lastUpdatedAt?: Date | string | null;
};

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

const COMPLETENESS_SCORE: Record<SourceAuditStatus, number> = {
  ok: 1,
  warning: 0.7,
  stale: 0.4,
  error: 0.2,
  missing: 0,
};

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(value: Date | string | null | undefined): string | null {
  return toDate(value)?.toISOString() ?? null;
}

function minutesSince(
  value: Date | string | null | undefined,
  now: Date,
): number | null {
  const date = toDate(value);
  if (!date) return null;
  return Math.max(0, Math.floor((now.getTime() - date.getTime()) / 60000));
}

function hasRequiredItemSignal(source: MonitoredSource): boolean {
  return source.requiredSignals?.includes("itemsTotal") ?? false;
}

function auditOne(
  source: MonitoredSource,
  row: SourceStatusRow | undefined,
  now: Date,
): SourceAuditResult {
  const findings: string[] = [];
  const freshnessMinutes = minutesSince(row?.lastCheckedAt, now);
  const itemsTotal = row?.itemsTotal ?? null;
  const itemsNew = row?.itemsNew ?? null;
  const error = row?.error ?? null;
  let status: SourceAuditStatus = "ok";

  if (!row) {
    status = "missing";
    findings.push(
      "Fonte presente nel registro ma senza stato runtime in feed_status.",
    );
  } else if (row.status === "error") {
    status = "error";
    findings.push("Ultimo controllo registrato come errore tecnico.");
    if (error) findings.push(error);
  } else if (freshnessMinutes === null) {
    status = "missing";
    findings.push("Ultimo controllo non disponibile in feed_status.");
  } else if (freshnessMinutes > source.staleAfterMinutes) {
    status = "stale";
    findings.push(
      `Fonte non aggiornata da ${freshnessMinutes} minuti; soglia tecnica ${source.staleAfterMinutes} minuti.`,
    );
  } else if (hasRequiredItemSignal(source) && itemsTotal === 0) {
    status = "warning";
    findings.push(
      "Ultimo controllo recente ma senza record elaborati: segnale operativo da verificare.",
    );
  } else {
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
    lastCheckedAt: toIso(row?.lastCheckedAt),
    lastUpdatedAt: toIso(row?.lastUpdatedAt),
    freshnessMinutes,
    itemsTotal,
    itemsNew,
    error,
    completenessScore: COMPLETENESS_SCORE[status],
    findings,
  };
}

function summarize(sources: SourceAuditResult[]): SourceAuditSummary {
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
      (source.status === "error" ||
        source.status === "missing" ||
        source.status === "stale")
    ) {
      summary.criticalOpen += 1;
    }
  }

  return summary;
}

function aggregateStatus(summary: SourceAuditSummary): SourceHealthStatus {
  if (summary.criticalOpen > 0) return "error";
  if (
    summary.warning > 0 ||
    summary.stale > 0 ||
    summary.error > 0 ||
    summary.missing > 0
  ) {
    return "warning";
  }
  return "ok";
}

export function auditSources(
  registry: readonly MonitoredSource[],
  statuses: readonly SourceStatusRow[],
  now = new Date(),
): SourceAuditPayload {
  const rowsBySource = new Map(statuses.map((row) => [row.source, row]));
  const sources = registry.map((source) =>
    auditOne(source, rowsBySource.get(source.source), now),
  );
  const summary = summarize(sources);

  return {
    status: aggregateStatus(summary),
    generatedAt: now.toISOString(),
    summary,
    sources,
  };
}

export async function getSourceAudit(
  now = new Date(),
): Promise<SourceAuditPayload> {
  const [{ db, feedStatusTable }, { asc }] = await Promise.all([
    import("@workspace/db"),
    import("drizzle-orm"),
  ]);
  const rows = await db
    .select()
    .from(feedStatusTable)
    .orderBy(asc(feedStatusTable.source));
  return auditSources(MONITORED_SOURCES, rows, now);
}
