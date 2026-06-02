import app from "./app";
import { logger } from "./lib/logger";
import { startIngestionScheduler } from "./lib/ingestion";
import { verifySchema } from "./lib/schemaCheck";
import { runMigrations } from "@workspace/db";

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
    .then(() => {
      logger.info("Database migrations applied (or already up to date).");
      return verifySchema();
    })
    .catch((err: unknown) => {
      logger.error(
        { err },
        "Failed to run database migrations at startup. " +
          "To apply migrations manually: pnpm --filter @workspace/db run migrate. " +
          "Then restart the API server.",
      );
      return false;
    })
    .then((ok) => {
      if (ok) {
        startIngestionScheduler();
      } else {
        logger.error(
          "Ingestion scheduler not started: database migration/schema check failed. " +
            "Resolve the issue above and restart the API server.",
        );
      }
    });
});
