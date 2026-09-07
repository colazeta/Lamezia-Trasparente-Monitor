import { Router } from "express";

export function createOperationalHealthRouter(dependencies: {
  migrations: () => Promise<{ pendingTags: string[] }>;
  snapshots: () => { status: string };
  logError: () => void;
}) {
  const router = Router();
  router.use((_req, res, next) => {
    res.set({
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    next();
  });
  router.get("/migrations", (_req, res) => {
    void dependencies
      .migrations()
      .then((migration) => {
        const ready = migration.pendingTags.length === 0;
        res
          .status(ready ? 200 : 503)
          .json({ status: ready ? "ok" : "pending", migration });
      })
      .catch(() => {
        dependencies.logError();
        res
          .status(503)
          .json({ status: "error", error: "Could not read migration status." });
      });
  });
  router.get("/source-snapshots", (_req, res) => {
    const state = dependencies.snapshots();
    res.status(state.status === "verified" ? 200 : 503).json(state);
  });
  return router;
}
