export type EmbeddedIngestionSchedulerMode = "disabled" | "local" | "legacy";

export interface EmbeddedIngestionSchedulerConfig {
  enabled: boolean;
  mode: EmbeddedIngestionSchedulerMode;
  rawMode: string | undefined;
  reason: string;
}

const ENV_VAR = "INGESTION_SCHEDULER_MODE";

/**
 * Controls whether the API process should also run the periodic ingestion loop.
 *
 * The default is intentionally disabled so production API instances can start
 * without embedding background ingestion work. Local/dev and temporary legacy
 * deployments must opt in explicitly with INGESTION_SCHEDULER_MODE=local or
 * INGESTION_SCHEDULER_MODE=legacy.
 */
export function resolveEmbeddedIngestionSchedulerConfig(
  env: NodeJS.ProcessEnv = process.env,
): EmbeddedIngestionSchedulerConfig {
  const rawMode = env[ENV_VAR];
  const normalized = rawMode?.trim().toLowerCase();

  if (
    !normalized ||
    ["0", "false", "off", "disabled", "none"].includes(normalized)
  ) {
    return {
      enabled: false,
      mode: "disabled",
      rawMode,
      reason: `${ENV_VAR} is not set to local or legacy`,
    };
  }

  if (["local", "development", "dev"].includes(normalized)) {
    return {
      enabled: true,
      mode: "local",
      rawMode,
      reason: `${ENV_VAR}=local enables embedded ingestion for local development`,
    };
  }

  if (normalized === "legacy") {
    return {
      enabled: true,
      mode: "legacy",
      rawMode,
      reason: `${ENV_VAR}=legacy enables the temporary embedded scheduler`,
    };
  }

  return {
    enabled: false,
    mode: "disabled",
    rawMode,
    reason: `${ENV_VAR} value "${rawMode}" is not supported; use local, legacy, or disabled`,
  };
}
