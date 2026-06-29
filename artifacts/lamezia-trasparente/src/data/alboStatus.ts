import publicAlboStatus from "../../../../data/public/albo/status.json";

export type AlboStatusCounts = {
  acquired: number;
  new: number;
  changed: number;
  removed: number;
  unchanged: number;
  publishable: number;
  minimised: number;
  metadata_only: number;
  excluded: number;
};

export type AlboSchedule = {
  monitoring_window: string;
  timezone: string;
  github_actions_cron_utc: string;
  utc_handling: string;
  zero_cost_runner: string;
};

export type AlboDiffBaseline = {
  status: "public_safe" | "baseline_unavailable";
  public_safe: boolean;
  previous_retrieved_at: string | null;
  note: string;
};

export type AlboOperationalStatus = {
  source: string;
  source_url: string;
  provider: string | null;
  last_run_at: string | null;
  last_update: string | null;
  method: string | null;
  raw_format: string | null;
  counts: AlboStatusCounts;
  diff_baseline: AlboDiffBaseline | null;
  warnings: string[];
  next_scheduled_check: string | null;
  schedule: AlboSchedule | null;
  verification_status: "verification_required" | "official_source_acquired" | "normalised_automatically";
  known_limits: string[];
  official_albo_disclaimer: string;
  civic_safeguards: string[];
};

function isVerificationStatus(
  value: string,
): value is AlboOperationalStatus["verification_status"] {
  return (
    value === "verification_required" ||
    value === "official_source_acquired" ||
    value === "normalised_automatically"
  );
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function arrayOfText(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeCounts(value: unknown): AlboStatusCounts {
  const counts = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    acquired: numberValue(counts.acquired),
    new: numberValue(counts.new),
    changed: numberValue(counts.changed),
    removed: numberValue(counts.removed),
    unchanged: numberValue(counts.unchanged),
    publishable: numberValue(counts.publishable),
    minimised: numberValue(counts.minimised),
    metadata_only: numberValue(counts.metadata_only),
    excluded: numberValue(counts.excluded),
  };
}

function normalizeSchedule(value: unknown): AlboSchedule | null {
  if (!value || typeof value !== "object") return null;
  const schedule = value as Record<string, unknown>;
  const monitoringWindow = nullableText(schedule.monitoring_window);
  const timezone = nullableText(schedule.timezone);
  const cron = nullableText(schedule.github_actions_cron_utc);
  const utcHandling = nullableText(schedule.utc_handling);
  const zeroCostRunner = nullableText(schedule.zero_cost_runner);
  if (!monitoringWindow || !timezone || !cron || !utcHandling || !zeroCostRunner) return null;
  return {
    monitoring_window: monitoringWindow,
    timezone,
    github_actions_cron_utc: cron,
    utc_handling: utcHandling,
    zero_cost_runner: zeroCostRunner,
  };
}

function normalizeDiffBaseline(value: unknown): AlboDiffBaseline | null {
  if (!value || typeof value !== "object") return null;
  const baseline = value as Record<string, unknown>;
  const status = baseline.status;
  if (status !== "public_safe" && status !== "baseline_unavailable") return null;
  return {
    status,
    public_safe: baseline.public_safe === true,
    previous_retrieved_at: nullableText(baseline.previous_retrieved_at),
    note: nullableText(baseline.note) ?? "Baseline diff non disponibile.",
  };
}

export const ALBO_OPERATIONAL_STATUS: AlboOperationalStatus = {
  source: publicAlboStatus.source,
  source_url: publicAlboStatus.source_url,
  provider: nullableText(publicAlboStatus.provider),
  last_run_at: nullableText(publicAlboStatus.last_run_at),
  last_update: nullableText(publicAlboStatus.last_update),
  method: nullableText(publicAlboStatus.method),
  raw_format: nullableText(publicAlboStatus.raw_format),
  counts: normalizeCounts(publicAlboStatus.counts),
  diff_baseline: normalizeDiffBaseline(publicAlboStatus.diff_baseline),
  warnings: arrayOfText(publicAlboStatus.warnings),
  next_scheduled_check: nullableText(publicAlboStatus.next_scheduled_check),
  schedule: normalizeSchedule(publicAlboStatus.schedule),
  verification_status: isVerificationStatus(publicAlboStatus.verification_status)
    ? publicAlboStatus.verification_status
    : "verification_required",
  known_limits: arrayOfText(publicAlboStatus.known_limits),
  official_albo_disclaimer: publicAlboStatus.official_albo_disclaimer,
  civic_safeguards: arrayOfText(publicAlboStatus.civic_safeguards),
};

export const ALBO_VERIFICATION_LABELS: Record<
  AlboOperationalStatus["verification_status"],
  string
> = {
  verification_required: "Verifica richiesta",
  official_source_acquired: "Fonte ufficiale acquisita",
  normalised_automatically: "Normalizzato automaticamente",
};
