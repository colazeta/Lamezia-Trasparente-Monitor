import app from "./app";
import { logger } from "./lib/logger";
import { startIngestionScheduler } from "./lib/ingestion";
import { resolveIngestionSchedulerConfig } from "./lib/ingestionSchedulerConfig";
import { verifySchema } from "./lib/schemaCheck";
import { runMigrations, MigrationError } from "@workspace/db";
import {
  logMigrationStatus,
  alertMigrationProblem,
} from "./lib/migrationStatus";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Apply any pending migrations non-interactively, then verify the schema
  // and start the ingestion scheduler only when everything is clean.
  void runMigrations()
    .then(async (status) => {
      logMigrationStatus(status);
      // A successful run that still leaves migrations pending means a new
      // migration was deployed but not applied — actively alert the team.
      if (status.pendingTags.length > 0) {
        await alertMigrationProblem({ kind: "pending", status });
      }
      return verifySchema();
    })
    .catch(async (err: unknown) => {
      if (err instanceof MigrationError) {
        logger.error(
          {
            err,
            phase: err.phase,
            detectedState: err.detectedState,
            pendingMigrations: err.pendingMigrations,
            migration: err.status,
          },
          `Failed to run database migrations at startup: ${err.message} ` +
            "To apply migrations manually: pnpm --filter @workspace/db run migrate. " +
            "Then restart the API server.",
        );
        await alertMigrationProblem({ kind: "aborted", error: err });
      } else {
        logger.error(
          { err },
          "Failed to run database migrations at startup. " +
            "To apply migrations manually: pnpm --filter @workspace/db run migrate. " +
            "Then restart the API server.",
        );
        await alertMigrationProblem({ kind: "failed", error: err });
      }
      return false;
    })
    .then((ok) => {
      if (!ok) {
        logger.error(
          "Ingestion scheduler not started: database migration/schema check failed. " +
            "Resolve the issue above and restart the API server.",
        );
        return;
      }

      const schedulerConfig = resolveIngestionSchedulerConfig();

      if (schedulerConfig.enabled) {
        startIngestionScheduler();
        logger.info(
          { ingestionSchedulerMode: schedulerConfig.mode },
          "Embedded ingestion scheduler started",
        );
      } else {
        logger.info(
          "Embedded ingestion scheduler disabled; API startup completed without periodic ingestion",
        );
      }
    });
});
