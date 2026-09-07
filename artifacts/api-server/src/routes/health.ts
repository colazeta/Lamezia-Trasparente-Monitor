import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { getSourceAudit } from "../lib/sourceAudit";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

/**
 * Read-only operations endpoint for the monitored-source backbone. It reports
 * technical freshness/completeness signals from the source registry joined with
 * feed_status. The payload is intentionally operational: it distinguishes
 * missing, stale, warning and technical error states without making claims about
 * absolute completeness of public acts.
 */
router.get("/healthz/sources", (_req, res) => {
  void getSourceAudit()
    .then((audit) => {
      res.json(audit);
    })
    .catch((err: unknown) => {
      logger.error({ err }, "Failed to read monitored source status.");
      res
        .status(503)
        .json({ status: "error", error: "Could not read source status." });
    });
});

export default router;
