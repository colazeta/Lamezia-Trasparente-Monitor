import { pool, runMigrations, MigrationError } from "@workspace/db";
import { runIngestionCycle } from "../../api-server/src/lib/ingestion";
import { logger } from "../../api-server/src/lib/logger";
import { verifySchema } from "../../api-server/src/lib/schemaCheck";
import {
  alertMigrationProblem,
  logMigrationStatus,
} from "../../api-server/src/lib/migrationStatus";

async function prepareDatabaseForIngestion(): Promise<boolean> {
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
        `Failed to run database migrations before the one-shot ingestion worker: ${err.message} ` +
          "To apply migrations manually: pnpm --filter @workspace/db run migrate. " +
          "Then rerun the ingestion worker.",
      );
      await alertMigrationProblem({ kind: "aborted", error: err });
    } else {
      logger.error(
        { err },
        "Failed to run database migrations before the one-shot ingestion worker. " +
          "To apply migrations manually: pnpm --filter @workspace/db run migrate. " +
          "Then rerun the ingestion worker.",
      );
      await alertMigrationProblem({ kind: "failed", error: err });
    }

    return false;
  }
}

async function main(): Promise<void> {
  logger.info("Starting one-shot ingestion worker");

  const databaseReady = await prepareDatabaseForIngestion();
  if (!databaseReady) {
    logger.error(
      "One-shot ingestion worker aborted: database migration/schema check failed. " +
        "Resolve the issue above and rerun the worker.",
    );
    process.exitCode = 1;
    return;
  }

  await runIngestionCycle();
  logger.info("One-shot ingestion worker completed");
}

main()
  .catch((err: unknown) => {
    logger.error({ err }, "One-shot ingestion worker failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
