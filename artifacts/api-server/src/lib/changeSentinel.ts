import { createHash } from "node:crypto";
import { z } from "zod";
import watchManifestJson from "../data/changeSentinelWatches.json";
import { MONITORED_SOURCE_BY_ID } from "./sourceRegistry";

export const CHANGE_SENTINEL_SCHEMA_VERSION = 1 as const;
export const CHANGE_SENTINEL_PROVIDER = "changedetection.io" as const;

const httpsUrlSchema = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === "https:", {
    message: "sentinel watch URLs must use https",
  });

const watchDefinitionSchema = z
  .object({
    watchKey: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
    canonicalSourceId: z.string().min(1).max(160),
    canonicalUrl: httpsUrlSchema,
    fetchBackend: z.enum(["html_requests", "html_webdriver"]),
    expectedCadenceSeconds: z.number().int().min(60).max(86_400),
    includeFilters: z.array(z.string().min(1).max(5_000)).max(20),
    status: z.literal("poc-proposed"),
  })
  .strict();

const watchManifestSchema = z
  .object({
    schemaVersion: z.literal(CHANGE_SENTINEL_SCHEMA_VERSION),
    upstream: z
      .object({
        repository: z.literal("dgtlmoon/changedetection.io"),
        pinnedVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
        minimumVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
        license: z.literal("Apache-2.0"),
      })
      .strict(),
    watches: z.array(watchDefinitionSchema).min(1).max(100),
  })
  .strict();

const parsedManifest = watchManifestSchema.parse(watchManifestJson);
for (const watch of parsedManifest.watches) {
  if (!MONITORED_SOURCE_BY_ID.has(watch.canonicalSourceId)) {
    throw new Error(
      `Change sentinel watch ${watch.watchKey} references unknown canonical source ${watch.canonicalSourceId}`,
    );
  }
}

export const CHANGE_SENTINEL_MANIFEST = parsedManifest;

const notificationSchema = z
  .object({
    schemaVersion: z.literal(CHANGE_SENTINEL_SCHEMA_VERSION),
    sentinel: z.literal(CHANGE_SENTINEL_PROVIDER),
    watchKey: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
    watchUrl: httpsUrlSchema,
    notificationTimestamp: z.number().finite().positive().max(4_102_444_800),
  })
  .strict();

export type ChangeSentinelNotification = z.infer<typeof notificationSchema>;
export type ChangeSentinelWatch = (typeof CHANGE_SENTINEL_MANIFEST.watches)[number];

export type ChangeSentinelDecision =
  | {
      status: "accepted";
      eventId: string;
      watchKey: string;
      canonicalSourceId: string;
      canonicalUrl: string;
      notificationAt: string;
    }
  | {
      status: "rejected";
      code: "payload-invalid" | "unknown-watch" | "url-mismatch";
    };

export type CanonicalIngestionTrigger = {
  kind: "sentinel-change";
  eventId: string;
  sourceId: string;
  canonicalUrl: string;
  observedAt: string;
};

function normalizedUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  return url.href;
}

function eventIdFor(input: {
  watchKey: string;
  canonicalUrl: string;
  notificationTimestamp: number;
}): string {
  const notificationMillis = Math.round(input.notificationTimestamp * 1_000);
  return createHash("sha256")
    .update(
      [
        CHANGE_SENTINEL_PROVIDER,
        input.watchKey,
        normalizedUrl(input.canonicalUrl),
        String(notificationMillis),
      ].join("\n"),
    )
    .digest("hex");
}

export function evaluateChangeSentinelNotification(
  value: unknown,
): ChangeSentinelDecision {
  const parsed = notificationSchema.safeParse(value);
  if (!parsed.success) {
    return { status: "rejected", code: "payload-invalid" };
  }

  const watch = CHANGE_SENTINEL_MANIFEST.watches.find(
    (candidate) => candidate.watchKey === parsed.data.watchKey,
  );
  if (!watch) {
    return { status: "rejected", code: "unknown-watch" };
  }

  if (normalizedUrl(parsed.data.watchUrl) !== normalizedUrl(watch.canonicalUrl)) {
    return { status: "rejected", code: "url-mismatch" };
  }

  return {
    status: "accepted",
    eventId: eventIdFor({
      watchKey: watch.watchKey,
      canonicalUrl: watch.canonicalUrl,
      notificationTimestamp: parsed.data.notificationTimestamp,
    }),
    watchKey: watch.watchKey,
    canonicalSourceId: watch.canonicalSourceId,
    canonicalUrl: watch.canonicalUrl,
    notificationAt: new Date(parsed.data.notificationTimestamp * 1_000).toISOString(),
  };
}

export function buildCanonicalIngestionTrigger(
  decision: ChangeSentinelDecision,
): CanonicalIngestionTrigger | null {
  if (decision.status !== "accepted") return null;
  return {
    kind: "sentinel-change",
    eventId: decision.eventId,
    sourceId: decision.canonicalSourceId,
    canonicalUrl: decision.canonicalUrl,
    observedAt: decision.notificationAt,
  };
}
