import { describe, expect, it, vi } from "vitest";
import {
  CHANGE_SENTINEL_MAX_ATTEMPTS,
  runChangeSentinelQueueOnce,
  type CanonicalSentinelRunResult,
  type ClaimedChangeSentinelEvent,
} from "./changeSentinelQueue";

const EVENT: ClaimedChangeSentinelEvent = {
  eventId: "a".repeat(64),
  canonicalSourceId: "attuazione-pnrr-lamezia",
  attemptCount: 1,
};

const CANONICAL_RESULT: CanonicalSentinelRunResult = {
  beforeHash: "b".repeat(64),
  afterHash: "c".repeat(64),
  materialChange: true,
  total: 12,
  upserted: 12,
};

describe("runChangeSentinelQueueOnce", () => {
  it("does no canonical work when the durable queue is empty", async () => {
    const runCanonical = vi.fn(async () => CANONICAL_RESULT);

    const outcome = await runChangeSentinelQueueOnce({
      claim: async () => null,
      runCanonical,
    });

    expect(outcome).toEqual({ status: "idle" });
    expect(runCanonical).not.toHaveBeenCalled();
  });

  it("runs only the promoted canonical PNRR source and records material change", async () => {
    const runCanonical = vi.fn(async () => CANONICAL_RESULT);
    const complete = vi.fn(async () => {});
    const fail = vi.fn(async () => "failed" as const);

    const outcome = await runChangeSentinelQueueOnce({
      claim: async () => EVENT,
      runCanonical,
      complete,
      fail,
    });

    expect(outcome).toEqual({
      status: "processed",
      sourceId: "attuazione-pnrr-lamezia",
      attemptCount: 1,
      materialChange: true,
      total: 12,
      upserted: 12,
    });
    expect(runCanonical).toHaveBeenCalledWith("attuazione-pnrr-lamezia");
    expect(complete).toHaveBeenCalledWith(EVENT, CANONICAL_RESULT);
    expect(fail).not.toHaveBeenCalled();
  });

  it("records a no-change canonical refresh without treating it as a failure", async () => {
    const noChange = {
      ...CANONICAL_RESULT,
      afterHash: CANONICAL_RESULT.beforeHash,
      materialChange: false,
    };
    const complete = vi.fn(async () => {});

    const outcome = await runChangeSentinelQueueOnce({
      claim: async () => EVENT,
      runCanonical: async () => noChange,
      complete,
    });

    expect(outcome).toMatchObject({
      status: "processed",
      materialChange: false,
    });
    expect(complete).toHaveBeenCalledWith(EVENT, noChange);
  });

  it("fails closed on a source not explicitly promoted", async () => {
    const foreignEvent = {
      ...EVENT,
      canonicalSourceId: "unreviewed-source",
    };
    const runCanonical = vi.fn(async () => CANONICAL_RESULT);
    const fail = vi.fn(async () => "failed" as const);

    const outcome = await runChangeSentinelQueueOnce({
      claim: async () => foreignEvent,
      runCanonical,
      fail,
    });

    expect(outcome).toEqual({
      status: "failed",
      sourceId: "unreviewed-source",
      attemptCount: 1,
      errorCode: "source-not-promoted",
    });
    expect(fail).toHaveBeenCalledWith(
      foreignEvent,
      "source-not-promoted",
      false,
    );
    expect(runCanonical).not.toHaveBeenCalled();
  });

  it("requeues a transient canonical ingestion failure", async () => {
    const fail = vi.fn(async () => "requeued" as const);

    const outcome = await runChangeSentinelQueueOnce({
      claim: async () => EVENT,
      runCanonical: async () => {
        throw new Error("source temporarily unavailable");
      },
      fail,
    });

    expect(outcome).toEqual({
      status: "requeued",
      sourceId: "attuazione-pnrr-lamezia",
      attemptCount: 1,
      errorCode: "canonical-ingestion-failed",
    });
    expect(fail).toHaveBeenCalledWith(
      EVENT,
      "canonical-ingestion-failed",
      true,
    );
  });

  it("supports a final failure after the bounded retry budget", async () => {
    const finalEvent = {
      ...EVENT,
      attemptCount: CHANGE_SENTINEL_MAX_ATTEMPTS,
    };
    const fail = vi.fn(async () => "failed" as const);

    const outcome = await runChangeSentinelQueueOnce({
      claim: async () => finalEvent,
      runCanonical: async () => {
        throw new Error("still unavailable");
      },
      fail,
    });

    expect(outcome).toMatchObject({
      status: "failed",
      attemptCount: CHANGE_SENTINEL_MAX_ATTEMPTS,
      errorCode: "canonical-ingestion-failed",
    });
  });
});
