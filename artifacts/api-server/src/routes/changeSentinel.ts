import { createHash, timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  evaluateChangeSentinelNotification,
  type ChangeSentinelDecision,
} from "../lib/changeSentinel";
import {
  recordChangeSentinelEvent,
  type AcceptedChangeSentinelDecision,
  type ChangeSentinelRecordOutcome,
} from "../lib/changeSentinelStore";

const RECEIVER_ENABLED_ENV = "CHANGE_SENTINEL_RECEIVER_ENABLED";
const RECEIVER_TOKEN_ENV = "CHANGE_SENTINEL_WEBHOOK_TOKEN";
const RECEIVER_TOKEN_HEADER = "x-lt-sentinel-token";
const MIN_TOKEN_CHARACTERS = 32;
const MAX_EVENT_BODY_BYTES = 4 * 1024;
const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
const MAX_EVENT_AGE_MS = 48 * 60 * 60 * 1000;

export type ChangeSentinelReceiverDependencies = {
  recordEvent?: (
    decision: AcceptedChangeSentinelDecision,
  ) => Promise<ChangeSentinelRecordOutcome>;
  now?: () => number;
};

function receiverEnabled(): boolean {
  return process.env[RECEIVER_ENABLED_ENV] === "true";
}

function configuredToken(): string | null {
  const value = process.env[RECEIVER_TOKEN_ENV];
  return value && value.length >= MIN_TOKEN_CHARACTERS ? value : null;
}

function tokenMatches(received: string | undefined, expected: string): boolean {
  if (!received) return false;
  const left = createHash("sha256").update(received, "utf8").digest();
  const right = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(left, right);
}

function payloadTooLarge(req: Request): boolean {
  const declared = Number(req.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_EVENT_BODY_BYTES) return true;
  try {
    return Buffer.byteLength(JSON.stringify(req.body ?? null), "utf8") > MAX_EVENT_BODY_BYTES;
  } catch {
    return true;
  }
}

function eventTimestampInWindow(
  decision: ChangeSentinelDecision,
  nowMs: number,
): boolean {
  if (decision.status !== "accepted") return false;
  const observedMs = Date.parse(decision.notificationAt);
  if (!Number.isFinite(observedMs)) return false;
  return (
    observedMs <= nowMs + MAX_FUTURE_SKEW_MS &&
    observedMs >= nowMs - MAX_EVENT_AGE_MS
  );
}

/**
 * Authenticated receiver for non-canonical change-sentinel events.
 *
 * The endpoint is deliberately hidden (404) unless explicitly enabled. It only
 * validates and durably deduplicates a minimal event. No canonical ingestor is
 * imported or invoked from this module.
 */
export function createChangeSentinelRouter(
  dependencies: ChangeSentinelReceiverDependencies = {},
): IRouter {
  const router = Router();
  const recordEvent = dependencies.recordEvent ?? recordChangeSentinelEvent;
  const now = dependencies.now ?? Date.now;

  router.post(
    "/internal/change-sentinel",
    async (req: Request, res: Response) => {
      if (!receiverEnabled()) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      const expectedToken = configuredToken();
      if (!expectedToken) {
        req.log?.error("Change sentinel receiver is enabled but not configured");
        res.status(503).json({ error: "Sentinel receiver unavailable" });
        return;
      }

      const receivedToken = req.get(RECEIVER_TOKEN_HEADER);
      if (!tokenMatches(receivedToken, expectedToken)) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (payloadTooLarge(req)) {
        res.status(413).json({ error: "Payload too large" });
        return;
      }

      const decision = evaluateChangeSentinelNotification(req.body);
      if (
        decision.status !== "accepted" ||
        !eventTimestampInWindow(decision, now())
      ) {
        req.log?.warn(
          {
            reason:
              decision.status === "accepted"
                ? "timestamp-out-of-window"
                : decision.code,
          },
          "Rejected change sentinel notification",
        );
        res.status(400).json({ error: "Invalid sentinel event" });
        return;
      }

      try {
        const outcome = await recordEvent(decision);
        req.log?.info(
          {
            watchKey: decision.watchKey,
            sourceId: decision.canonicalSourceId,
            outcome,
          },
          "Change sentinel notification recorded",
        );
        res
          .status(outcome === "inserted" ? 202 : 200)
          .json({ status: outcome === "inserted" ? "accepted" : "duplicate" });
      } catch (err) {
        req.log?.error({ err }, "Could not persist change sentinel notification");
        res.status(503).json({ error: "Sentinel receiver unavailable" });
      }
    },
  );

  return router;
}

export default createChangeSentinelRouter();
