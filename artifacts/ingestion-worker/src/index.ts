import { pool, runMigrations, MigrationError } from "@workspace/db";
import { runIngestionCycle } from "../../api-server/src/lib/ingestion";
import { logger } from "../../api-server/src/lib/logger";
import {
  alertMigrationProblem,
  logMigrationStatus,
} from "../../api-server/src/lib/migrationStatus";
import { verifySchema } from "../../api-server/src/lib/schemaCheck";

async function prepareDatabase(): Promise<boolean> {
  try {
    const status = await runMigrations();
    logMigrationStatus(status);
    if (status.pendingTags.length > 0) {
      await alertMigrationProblem({ kind: "pending", status });
    }
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
        `Ingestion worker database migration failed: ${err.message}`,
      );
      await alertMigrationProblem({ kind: "aborted", error: err });
    } else {
      logger.error({ err }, "Ingestion worker database migration failed");
      await alertMigrationProblem({ kind: "failed", error: err });
    }
    return false;
  }

  return verifySchema();
}

async function main(): Promise<void> {
  logger.info("Starting one-shot ingestion worker");

  const databaseReady = await prepareDatabase();
  if (!databaseReady) {
    throw new Error(
      "Ingestion worker aborted: database migration/schema check failed.",
    );
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
