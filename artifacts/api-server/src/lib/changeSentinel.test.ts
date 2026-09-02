import { describe, expect, it } from "vitest";
import {
  buildCanonicalIngestionTrigger,
  CHANGE_SENTINEL_MANIFEST,
  evaluateChangeSentinelNotification,
} from "./changeSentinel";

const BASE_EVENT = {
  schemaVersion: 1,
  sentinel: "changedetection.io",
  watchKey: "pnrr-index",
  watchUrl: "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
  notificationTimestamp: 1_788_343_200,
} as const;

describe("change sentinel watch manifest", () => {
  it("pins changedetection.io to a security-reviewed stable version", () => {
    expect(CHANGE_SENTINEL_MANIFEST.upstream).toEqual({
      repository: "dgtlmoon/changedetection.io",
      pinnedVersion: "0.55.8",
      minimumVersion: "0.54.8",
      license: "Apache-2.0",
    });
  });

  it("starts with the existing canonical PNRR ingestor rather than a new data source", () => {
    expect(CHANGE_SENTINEL_MANIFEST.watches).toContainEqual(
      expect.objectContaining({
        watchKey: "pnrr-index",
        canonicalSourceId: "attuazione-pnrr-lamezia",
        canonicalUrl:
          "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
      }),
    );
  });
});

describe("evaluateChangeSentinelNotification", () => {
  it("accepts a minimal event only when watch key and canonical URL match", () => {
    expect(evaluateChangeSentinelNotification(BASE_EVENT)).toMatchObject({
      status: "accepted",
      watchKey: "pnrr-index",
      canonicalSourceId: "attuazione-pnrr-lamezia",
      canonicalUrl:
        "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
    });
  });

  it("builds a stable idempotency key for duplicate notifications", () => {
    const first = evaluateChangeSentinelNotification(BASE_EVENT);
    const second = evaluateChangeSentinelNotification({ ...BASE_EVENT });
    expect(first.status).toBe("accepted");
    expect(second.status).toBe("accepted");
    if (first.status !== "accepted" || second.status !== "accepted") return;
    expect(first.eventId).toBe(second.eventId);
  });

  it("changes the idempotency key when the notification timestamp changes", () => {
    const first = evaluateChangeSentinelNotification(BASE_EVENT);
    const second = evaluateChangeSentinelNotification({
      ...BASE_EVENT,
      notificationTimestamp: BASE_EVENT.notificationTimestamp + 1,
    });
    expect(first.status).toBe("accepted");
    expect(second.status).toBe("accepted");
    if (first.status !== "accepted" || second.status !== "accepted") return;
    expect(first.eventId).not.toBe(second.eventId);
  });

  it("fails closed on an unknown watch key", () => {
    expect(
      evaluateChangeSentinelNotification({
        ...BASE_EVENT,
        watchKey: "unregistered-page",
      }),
    ).toEqual({ status: "rejected", code: "unknown-watch" });
  });

  it("fails closed when a known watch tries to point at another URL", () => {
    expect(
      evaluateChangeSentinelNotification({
        ...BASE_EVENT,
        watchUrl: "https://example.org/attacker-selected-target",
      }),
    ).toEqual({ status: "rejected", code: "url-mismatch" });
  });

  it("does not accept non-HTTPS watched URLs", () => {
    expect(
      evaluateChangeSentinelNotification({
        ...BASE_EVENT,
        watchUrl: "http://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
      }),
    ).toEqual({ status: "rejected", code: "payload-invalid" });
  });

  it("rejects diff/snapshot fields so sentinel content cannot cross the boundary", () => {
    expect(
      evaluateChangeSentinelNotification({
        ...BASE_EVENT,
        diff: "untrusted page content",
      }),
    ).toEqual({ status: "rejected", code: "payload-invalid" });
  });

  it("builds a canonical trigger from registry-owned identity, not webhook content", () => {
    const decision = evaluateChangeSentinelNotification(BASE_EVENT);
    const trigger = buildCanonicalIngestionTrigger(decision);
    expect(trigger).toMatchObject({
      kind: "sentinel-change",
      sourceId: "attuazione-pnrr-lamezia",
      canonicalUrl:
        "https://www.comune.lamezia-terme.cz.it/it/attuazione-misure-pnrr",
    });
  });
});
