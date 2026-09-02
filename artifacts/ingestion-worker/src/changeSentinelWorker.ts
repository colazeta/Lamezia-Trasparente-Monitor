import { pool, runMigrations, MigrationError } from "@workspace/db";
import { runChangeSentinelQueueOnce } from "../../api-server/src/lib/changeSentinelQueue";
import { logger } from "../../api-server/src/lib/logger";
import { verifySchema } from "../../api-server/src/lib/schemaCheck";
import {
  alertMigrationProblem,
  logMigrationStatus,
} from "../../api-server/src/lib/migrationStatus";

const TRIGGER_ENABLED_ENV = "CHANGE_SENTINEL_TRIGGER_ENABLED";

async function prepareDatabase(): Promise<boolean> {
  try {
    const status = await runMigrations();
    logMigrationStatus(status);
    if (status.pendingTags.length > 0) {
      await alertMigrationProblem({ kind: "pending", status });
    }
    return verifySchema();
  } catch (err: unknown) {
    if (err instanceof MigrationError) {
      logger.error(
        {
          err,
          phase: err.phase,
          detectedState: err.detectedState,
          pendingMigrations: err.pendingMigrations,
          migration: err.status,
        },
        "Sentinel worker aborted while preparing database migrations",
      );
      await alertMigrationProblem({ kind: "aborted", error: err });
    } else {
      logger.error({ err }, "Sentinel worker database preparation failed");
      await alertMigrationProblem({ kind: "failed", error: err });
    }
    return false;
  }
}

async function main(): Promise<void> {
  if (process.env[TRIGGER_ENABLED_ENV] !== "true") {
    logger.info("Change sentinel trigger worker disabled; no canonical work executed");
    return;
  }

  const ready = await prepareDatabase();
  if (!ready) {
    process.exitCode = 1;
    return;
  }

  const outcome = await runChangeSentinelQueueOnce();
  logger.info(
    {
      sentinelWorker: true,
      status: outcome.status,
      ...(outcome.status === "processed"
        ? {
            sourceId: outcome.sourceId,
            attemptCount: outcome.attemptCount,
            materialChange: outcome.materialChange,
            itemsTotal: outcome.total,
            itemsUpserted: outcome.upserted,
          }
        : outcome.status === "requeued" || outcome.status === "failed"
          ? {
              sourceId: outcome.sourceId,
              attemptCount: outcome.attemptCount,
              errorCode: outcome.errorCode,
            }
          : {}),
    },
    "Change sentinel one-shot worker completed",
  );

  if (outcome.status === "requeued" || outcome.status === "failed") {
    process.exitCode = 1;
  }
}

main()
  .catch((err: unknown) => {
    logger.error({ err }, "Change sentinel one-shot worker failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
