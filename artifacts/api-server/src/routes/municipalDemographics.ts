import { Router } from "express";
import type { Pool } from "pg";
import {
  MunicipalReadModelError,
  readMunicipalDemographicSnapshot,
} from "@workspace/db/municipal-demographics";

/** Public aggregate-only GET: no ingestion and no filesystem fallback. */
export function createMunicipalDemographicsRouter(pool: Pick<Pool, "query">) {
  const router = Router();
  router.get("/demographics/municipal/:key", async (req, res) => {
    const release = req.query.release;
    if (release !== undefined && typeof release !== "string") {
      res.status(400).json({ error: "INVALID_RELEASE" });
      return;
    }
    try {
      const key = String(req.params.key),
        snapshot = await readMunicipalDemographicSnapshot(pool, key, release);
      res.set("Cache-Control", "no-cache");
      // ETag covers the complete response, including projection version/metadata.
      if (req.query.download === "1")
        res.set(
          "Content-Disposition",
          `attachment; filename="lamezia-${key}.json"`,
        );
      res.json(snapshot);
    } catch (error) {
      const code =
        error instanceof MunicipalReadModelError
          ? error.code
          : "CANONICAL_DATA_UNAVAILABLE";
      res
        .set("Cache-Control", "no-store")
        .status(
          code === "INVALID_KEY" ? 404 : code === "INVALID_RELEASE" ? 400 : 503,
        )
        .json({ error: code });
    }
  });
  return router;
}
