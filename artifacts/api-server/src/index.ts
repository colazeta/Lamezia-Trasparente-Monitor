import app from "./app";
import { logger } from "./lib/logger";
import { startIngestionScheduler } from "./lib/ingestion";
import { verifySchema } from "./lib/schemaCheck";

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
  // Keep HTTP serving regardless, but only start ingestion once the schema is
  // verified clean — drift would otherwise break every ingestion run with 500s.
  void verifySchema().then((ok) => {
    if (ok) {
      startIngestionScheduler();
    } else {
      logger.error(
        "Ingestion scheduler not started: database schema check failed. " +
          "Resolve the schema drift above and restart the API server.",
      );
    }
  });
});
