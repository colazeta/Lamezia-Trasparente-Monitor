import { changeSentinelEventsTable, db } from "@workspace/db";
import type { ChangeSentinelDecision } from "./changeSentinel";

export type AcceptedChangeSentinelDecision = Extract<
  ChangeSentinelDecision,
  { status: "accepted" }
>;

export type ChangeSentinelRecordOutcome = "inserted" | "duplicate";

/**
 * Persist only the minimal metadata required for durable idempotency. Page
 * content, diffs and the webhook-provided URL are deliberately not stored.
 */
export async function recordChangeSentinelEvent(
  decision: AcceptedChangeSentinelDecision,
): Promise<ChangeSentinelRecordOutcome> {
  const inserted = await db
    .insert(changeSentinelEventsTable)
    .values({
      eventId: decision.eventId,
      provider: "changedetection.io",
      watchKey: decision.watchKey,
      canonicalSourceId: decision.canonicalSourceId,
      observedAt: new Date(decision.notificationAt),
      state: "received",
    })
    .onConflictDoNothing({ target: changeSentinelEventsTable.eventId })
    .returning({ eventId: changeSentinelEventsTable.eventId });

  return inserted.length > 0 ? "inserted" : "duplicate";
}
