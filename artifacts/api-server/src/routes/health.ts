import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { getMigrationHealth } from "../lib/migrationStatus";
import { getSourceAudit } from "../lib/sourceAudit";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

/**
 * Lightweight ops endpoint to verify the database migration state after a
 * deploy: reports the last applied migration tag, applied/journal counts and
 * anything still pending. Read-only. `status` is "ok" when nothing is pending,
 * otherwise "pending" so a deploy check can fail fast. Not part of the public
 * OpenAPI surface — it returns a plain JSON ops payload.
 */
router.get("/healthz/migrations", (_req, res) => {
  void getMigrationHealth()
    .then((migration) => {
      res.json({
        status: migration.pendingTags.length === 0 ? "ok" : "pending",
        migration,
      });
    })
    .catch((err: unknown) => {
      logger.error({ err }, "Failed to read database migration status.");
      res
        .status(503)
        .json({ status: "error", error: "Could not read migration status." });
    });
});

/**
 * Read-only ops endpoint for data-source monitoring. It reports technical
 * freshness and coverage signals for sources already present in the ingestion
 * cycle; it does not make public or substantive completeness claims.
 */
router.get("/healthz/sources", (_req, res) => {
  void getSourceAudit()
    .then((audit) => {
      res.json(audit);
    })
    .catch((err: unknown) => {
      logger.error({ err }, "Failed to read source health status.");
      res
        .status(503)
        .json({
          status: "error",
          error: "Could not read source health status.",
        });
    });
});

export default router;
