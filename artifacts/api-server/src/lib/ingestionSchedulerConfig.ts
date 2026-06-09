export type IngestionSchedulerMode =
  | "disabled"
  | "local"
  | "development"
  | "legacy";

export type IngestionSchedulerConfig = {
  enabled: boolean;
  mode: IngestionSchedulerMode;
};

type SchedulerEnv = Readonly<Record<string, string | undefined>>;

const ENABLED_MODES = new Set(["local", "development", "dev", "legacy"]);
const DISABLED_MODES = new Set(["", "disabled", "off", "false", "0"]);

function normalizeMode(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function toSchedulerMode(value: string): IngestionSchedulerMode {
  return value === "dev" ? "development" : (value as IngestionSchedulerMode);
}

export function resolveIngestionSchedulerConfig(
  env: SchedulerEnv = process.env,
): IngestionSchedulerConfig {
  const mode = normalizeMode(env["INGESTION_SCHEDULER_MODE"]);

  if (DISABLED_MODES.has(mode)) {
    return { enabled: false, mode: "disabled" };
  }

  if (ENABLED_MODES.has(mode)) {
    return { enabled: true, mode: toSchedulerMode(mode) };
  }

  return { enabled: false, mode: "disabled" };
}
