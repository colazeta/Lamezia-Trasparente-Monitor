import { createHash } from "node:crypto";
import {
  attuazionePnrrProjectsTable,
  changeSentinelEventsTable,
  db,
  type PnrrAttachment,
} from "@workspace/db";
import { and, asc, eq, lt, or } from "drizzle-orm";
import {
  ATTUAZIONE_SOURCE,
  runAttuazioneIngestion,
} from "./attuazionePnrr";

export const CHANGE_SENTINEL_MAX_ATTEMPTS = 3;
export const CHANGE_SENTINEL_LEASE_MS = 15 * 60 * 1000;

export type ClaimedChangeSentinelEvent = {
  eventId: string;
  canonicalSourceId: string;
  attemptCount: number;
};

export type CanonicalSentinelRunResult = {
  beforeHash: string;
  afterHash: string;
  materialChange: boolean;
  total: number;
  upserted: number;
};

export type ChangeSentinelQueueOutcome =
  | { status: "idle" }
  | {
      status: "processed";
      sourceId: string;
      attemptCount: number;
      materialChange: boolean;
      total: number;
      upserted: number;
    }
  | {
      status: "requeued" | "failed";
      sourceId: string;
      attemptCount: number;
      errorCode: "source-not-promoted" | "canonical-ingestion-failed";
    };

export type ChangeSentinelQueueDependencies = {
  claim?: () => Promise<ClaimedChangeSentinelEvent | null>;
  complete?: (
    event: ClaimedChangeSentinelEvent,
    result: CanonicalSentinelRunResult,
  ) => Promise<void>;
  fail?: (
    event: ClaimedChangeSentinelEvent,
    errorCode: "source-not-promoted" | "canonical-ingestion-failed",
    retryable: boolean,
  ) => Promise<"requeued" | "failed">;
  runCanonical?: (sourceId: string) => Promise<CanonicalSentinelRunResult>;
};

function stableAttachmentList(attachments: PnrrAttachment[]): PnrrAttachment[] {
  return [...attachments].sort((a, b) =>
    `${a.url}\n${a.title}`.localeCompare(`${b.url}\n${b.title}`),
  );
}

function hashCanonicalRows(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

/**
 * Fingerprint only canonical PNRR content. Operational first/last-seen fields
 * and DB surrogate IDs are deliberately excluded so a routine refresh does not
 * look like a material civic-data change.
 */
export async function fingerprintAttuazionePnrr(): Promise<string> {
  const rows = await db
    .select({
      sourceId: attuazionePnrrProjectsTable.sourceId,
      url: attuazionePnrrProjectsTable.url,
      title: attuazionePnrrProjectsTable.title,
      mission: attuazionePnrrProjectsTable.mission,
      component: attuazionePnrrProjectsTable.component,
      investment: attuazionePnrrProjectsTable.investment,
      intervention: attuazionePnrrProjectsTable.intervention,
      holder: attuazionePnrrProjectsTable.holder,
      attuatore: attuazionePnrrProjectsTable.attuatore,
      cup: attuazionePnrrProjectsTable.cup,
      importoFinanziato: attuazionePnrrProjectsTable.importoFinanziato,
      status: attuazionePnrrProjectsTable.status,
      startDate: attuazionePnrrProjectsTable.startDate,
      endDate: attuazionePnrrProjectsTable.endDate,
      publishedAt: attuazionePnrrProjectsTable.publishedAt,
      attachments: attuazionePnrrProjectsTable.attachments,
    })
    .from(attuazionePnrrProjectsTable)
    .orderBy(asc(attuazionePnrrProjectsTable.sourceId));

  const canonical = rows.map((row) => ({
    ...row,
    startDate: row.startDate?.toISOString() ?? null,
    endDate: row.endDate?.toISOString() ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    attachments: stableAttachmentList(row.attachments ?? []),
  }));
  return hashCanonicalRows(canonical);
}

export async function runPromotedSentinelSource(
  sourceId: string,
): Promise<CanonicalSentinelRunResult> {
  if (sourceId !== ATTUAZIONE_SOURCE) {
    throw new Error("source-not-promoted");
  }

  const beforeHash = await fingerprintAttuazionePnrr();
  const ingestion = await runAttuazioneIngestion();
  const afterHash = await fingerprintAttuazionePnrr();

  return {
    beforeHash,
    afterHash,
    materialChange: beforeHash !== afterHash,
    total: ingestion.total,
    upserted: ingestion.upserted,
  };
}

export async function claimNextChangeSentinelEvent(
  now = new Date(),
): Promise<ClaimedChangeSentinelEvent | null> {
  const staleBefore = new Date(now.getTime() - CHANGE_SENTINEL_LEASE_MS);

  return db.transaction(async (tx) => {
    const [candidate] = await tx
      .select({
        eventId: changeSentinelEventsTable.eventId,
        canonicalSourceId: changeSentinelEventsTable.canonicalSourceId,
        attemptCount: changeSentinelEventsTable.attemptCount,
      })
      .from(changeSentinelEventsTable)
      .where(
        and(
          lt(
            changeSentinelEventsTable.attemptCount,
            CHANGE_SENTINEL_MAX_ATTEMPTS,
          ),
          or(
            eq(changeSentinelEventsTable.state, "received"),
            and(
              eq(changeSentinelEventsTable.state, "processing"),
              lt(changeSentinelEventsTable.claimedAt, staleBefore),
            ),
          ),
        ),
      )
      .orderBy(
        asc(changeSentinelEventsTable.receivedAt),
        asc(changeSentinelEventsTable.eventId),
      )
      .limit(1)
      .for("update", { skipLocked: true });

    if (!candidate) return null;

    const attemptCount = candidate.attemptCount + 1;
    await tx
      .update(changeSentinelEventsTable)
      .set({
        state: "processing",
        attemptCount,
        claimedAt: now,
        processedAt: null,
        lastErrorCode: null,
      })
      .where(eq(changeSentinelEventsTable.eventId, candidate.eventId));

    return {
      eventId: candidate.eventId,
      canonicalSourceId: candidate.canonicalSourceId,
      attemptCount,
    };
  });
}

export async function completeChangeSentinelEvent(
  event: ClaimedChangeSentinelEvent,
  result: CanonicalSentinelRunResult,
  now = new Date(),
): Promise<void> {
  await db
    .update(changeSentinelEventsTable)
    .set({
      state: "processed",
      claimedAt: null,
      processedAt: now,
      lastErrorCode: null,
      canonicalBeforeHash: result.beforeHash,
      canonicalAfterHash: result.afterHash,
      materialChange: result.materialChange,
    })
    .where(eq(changeSentinelEventsTable.eventId, event.eventId));
}

export async function failChangeSentinelEvent(
  event: ClaimedChangeSentinelEvent,
  errorCode: "source-not-promoted" | "canonical-ingestion-failed",
  retryable: boolean,
  now = new Date(),
): Promise<"requeued" | "failed"> {
  const finalFailure =
    !retryable || event.attemptCount >= CHANGE_SENTINEL_MAX_ATTEMPTS;

  await db
    .update(changeSentinelEventsTable)
    .set({
      state: finalFailure ? "failed" : "received",
      claimedAt: null,
      processedAt: finalFailure ? now : null,
      lastErrorCode: errorCode,
    })
    .where(eq(changeSentinelEventsTable.eventId, event.eventId));

  return finalFailure ? "failed" : "requeued";
}

/**
 * Process at most one sentinel event. The worker remains bounded and each
 * invocation performs no work when the durable queue is empty.
 */
export async function runChangeSentinelQueueOnce(
  dependencies: ChangeSentinelQueueDependencies = {},
): Promise<ChangeSentinelQueueOutcome> {
  const claim = dependencies.claim ?? (() => claimNextChangeSentinelEvent());
  const complete = dependencies.complete ?? completeChangeSentinelEvent;
  const fail = dependencies.fail ?? failChangeSentinelEvent;
  const runCanonical = dependencies.runCanonical ?? runPromotedSentinelSource;

  const event = await claim();
  if (!event) return { status: "idle" };

  if (event.canonicalSourceId !== ATTUAZIONE_SOURCE) {
    const status = await fail(event, "source-not-promoted", false);
    return {
      status,
      sourceId: event.canonicalSourceId,
      attemptCount: event.attemptCount,
      errorCode: "source-not-promoted",
    };
  }

  try {
    const result = await runCanonical(event.canonicalSourceId);
    await complete(event, result);
    return {
      status: "processed",
      sourceId: event.canonicalSourceId,
      attemptCount: event.attemptCount,
      materialChange: result.materialChange,
      total: result.total,
      upserted: result.upserted,
    };
  } catch {
    const status = await fail(event, "canonical-ingestion-failed", true);
    return {
      status,
      sourceId: event.canonicalSourceId,
      attemptCount: event.attemptCount,
      errorCode: "canonical-ingestion-failed",
    };
  }
}
