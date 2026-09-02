import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createChangeSentinelRouter,
  type ChangeSentinelReceiverDependencies,
} from "./changeSentinel";

const NOW_MS = Date.UTC(2026, 8, 2, 11, 0, 0);
const VALID_TOKEN = "sentinel-test-token-0123456789-abcdef";

const VALID_EVENT = {
  schemaVersion: 1,
  sentinel: "changedetection.io",
  watchKey: "pnrr-index",
  watchUrl: "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
  notificationTimestamp: NOW_MS / 1000,
} as const;

function makeApp(dependencies: ChangeSentinelReceiverDependencies = {}) {
  const app = express();
  app.use(express.json());
  app.use("/api", createChangeSentinelRouter({ now: () => NOW_MS, ...dependencies }));
  return app;
}

function enableReceiver(token = VALID_TOKEN) {
  vi.stubEnv("CHANGE_SENTINEL_RECEIVER_ENABLED", "true");
  vi.stubEnv("CHANGE_SENTINEL_WEBHOOK_TOKEN", token);
}

function postEvent(app: ReturnType<typeof makeApp>, body: unknown = VALID_EVENT) {
  return request(app)
    .post("/api/internal/change-sentinel")
    .set("x-lt-sentinel-token", VALID_TOKEN)
    .send(body);
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("change sentinel receiver", () => {
  it("is hidden by default and never records an event", async () => {
    const recordEvent = vi.fn(async () => "inserted" as const);
    const response = await postEvent(makeApp({ recordEvent }));

    expect(response.status).toBe(404);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("fails closed when enabled without a sufficiently strong configured token", async () => {
    vi.stubEnv("CHANGE_SENTINEL_RECEIVER_ENABLED", "true");
    vi.stubEnv("CHANGE_SENTINEL_WEBHOOK_TOKEN", "too-short");
    const recordEvent = vi.fn(async () => "inserted" as const);

    const response = await postEvent(makeApp({ recordEvent }));
    expect(response.status).toBe(503);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("rejects a missing or incorrect secret before recording anything", async () => {
    enableReceiver();
    const recordEvent = vi.fn(async () => "inserted" as const);
    const app = makeApp({ recordEvent });

    const missing = await request(app)
      .post("/api/internal/change-sentinel")
      .send(VALID_EVENT);
    const incorrect = await request(app)
      .post("/api/internal/change-sentinel")
      .set("x-lt-sentinel-token", "wrong-token-that-is-still-long-enough-000")
      .send(VALID_EVENT);

    expect(missing.status).toBe(401);
    expect(incorrect.status).toBe(401);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("persists one valid registry-resolved event and returns no civic content", async () => {
    enableReceiver();
    const recordEvent = vi.fn(async () => "inserted" as const);

    const response = await postEvent(makeApp({ recordEvent }));

    expect(response.status).toBe(202);
    expect(response.body).toEqual({ status: "accepted" });
    expect(recordEvent).toHaveBeenCalledTimes(1);
    expect(recordEvent.mock.calls[0]?.[0]).toMatchObject({
      status: "accepted",
      watchKey: "pnrr-index",
      canonicalSourceId: "attuazione-pnrr-lamezia",
      canonicalUrl:
        "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
    });
    expect(JSON.stringify(response.body)).not.toContain("lamezia-terme.cz.it");
  });

  it("treats a durable duplicate as idempotent success", async () => {
    enableReceiver();
    const seen = new Set<string>();
    const recordEvent = vi.fn(async (decision) => {
      if (seen.has(decision.eventId)) return "duplicate" as const;
      seen.add(decision.eventId);
      return "inserted" as const;
    });
    const app = makeApp({ recordEvent });

    const first = await postEvent(app);
    const second = await postEvent(app);

    expect(first.status).toBe(202);
    expect(second.status).toBe(200);
    expect(second.body).toEqual({ status: "duplicate" });
    expect(recordEvent).toHaveBeenCalledTimes(2);
    expect(recordEvent.mock.calls[0]?.[0].eventId).toBe(
      recordEvent.mock.calls[1]?.[0].eventId,
    );
  });

  it("rejects changedetection content fields before persistence", async () => {
    enableReceiver();
    const recordEvent = vi.fn(async () => "inserted" as const);

    const response = await postEvent(makeApp({ recordEvent }), {
      ...VALID_EVENT,
      diff: "untrusted page content",
    });

    expect(response.status).toBe(400);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("rejects unknown watches and registry URL mismatches", async () => {
    enableReceiver();
    const recordEvent = vi.fn(async () => "inserted" as const);
    const app = makeApp({ recordEvent });

    const unknown = await postEvent(app, {
      ...VALID_EVENT,
      watchKey: "unknown-watch",
    });
    const mismatch = await postEvent(app, {
      ...VALID_EVENT,
      watchUrl: "https://example.org/not-a-canonical-source",
    });

    expect(unknown.status).toBe(400);
    expect(mismatch.status).toBe(400);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("rejects stale and implausibly future notifications", async () => {
    enableReceiver();
    const recordEvent = vi.fn(async () => "inserted" as const);
    const app = makeApp({ recordEvent });

    const stale = await postEvent(app, {
      ...VALID_EVENT,
      notificationTimestamp: (NOW_MS - 49 * 60 * 60 * 1000) / 1000,
    });
    const future = await postEvent(app, {
      ...VALID_EVENT,
      notificationTimestamp: (NOW_MS + 6 * 60 * 1000) / 1000,
    });

    expect(stale.status).toBe(400);
    expect(future.status).toBe(400);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("enforces a small receiver payload budget", async () => {
    enableReceiver();
    const recordEvent = vi.fn(async () => "inserted" as const);
    const response = await postEvent(makeApp({ recordEvent }), {
      ...VALID_EVENT,
      padding: "x".repeat(5_000),
    });

    expect(response.status).toBe(413);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it("returns retryable unavailability when durable persistence fails", async () => {
    enableReceiver();
    const recordEvent = vi.fn(async () => {
      throw new Error("database unavailable");
    });

    const response = await postEvent(makeApp({ recordEvent }));

    expect(response.status).toBe(503);
    expect(recordEvent).toHaveBeenCalledTimes(1);
  });
});
