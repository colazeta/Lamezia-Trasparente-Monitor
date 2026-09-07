import { afterEach, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { createOperationalHealthRouter } from "../routes/operationalHealth";
import { requireClerkConfiguration } from "../middlewares/requireClerkConfiguration";

afterEach(() => vi.unstubAllEnvs());

function application(
  migrations = vi.fn(async () => ({ pendingTags: [] as string[] })),
  status = "verified",
) {
  const app = express();
  const snapshots = vi.fn(() => ({
    status,
    verificationBasis: "process_startup",
  }));
  const logError = vi.fn();
  app.use(
    "/api/healthz",
    createOperationalHealthRouter({ migrations, snapshots, logError }),
  );
  app.use(requireClerkConfiguration);
  const privateHandler = vi.fn((_req, res) => res.json({ private: true }));
  app.get("/api/admin/database/catalog", privateHandler);
  return { app, snapshots, privateHandler, logError };
}

it("readiness remains observable without Clerk while the private database handler is never reached", async () => {
  vi.stubEnv("CLERK_SECRET_KEY", "");
  const { app, privateHandler } = application();
  for (const path of ["migrations", "source-snapshots"]) {
    const response = await request(app).get(`/api/healthz/${path}`);
    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
  }
  const denied = await request(app)
    .get("/api/admin/database/catalog")
    .set("Authorization", "Bearer unrelated-token");
  expect(denied.status).toBe(503);
  expect(denied.body).toEqual({ error: "Autenticazione non disponibile" });
  expect(privateHandler).not.toHaveBeenCalled();
});

it("pending migrations, unavailable checkpoints and database errors produce 503 without error details", async () => {
  const pending = application(
    vi.fn(async () => ({ pendingTags: ["required"] })),
    "running",
  );
  expect(
    (await request(pending.app).get("/api/healthz/migrations")).status,
  ).toBe(503);
  expect(
    (await request(pending.app).get("/api/healthz/source-snapshots")).status,
  ).toBe(503);
  const failed = application(
    vi.fn(async () => {
      throw new Error("private database host and credentials");
    }),
  );
  const response = await request(failed.app).get("/api/healthz/migrations");
  expect(response.status).toBe(503);
  expect(JSON.stringify(response.body)).not.toContain("private database");
  expect(failed.logError).toHaveBeenCalledTimes(1);
});
