import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";

/**
 * Durable idempotency + execution ledger for external change-sentinel events.
 *
 * This table intentionally stores no page diff, snapshot, HTML, screenshot or
 * extracted text. Canonical source content remains owned by the normal LT
 * ingestion pipeline.
 */
export const changeSentinelEventsTable = pgTable(
  "change_sentinel_events",
  {
    eventId: text("event_id").primaryKey(),
    provider: text("provider").notNull(),
    watchKey: text("watch_key").notNull(),
    canonicalSourceId: text("canonical_source_id").notNull(),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    state: text("state").notNull().default("received"),
    attemptCount: integer("attempt_count").notNull().default(0),
    claimedAt: timestamp("claimed_at", { withTimezone: true }),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    lastErrorCode: text("last_error_code"),
    canonicalBeforeHash: text("canonical_before_hash"),
    canonicalAfterHash: text("canonical_after_hash"),
    materialChange: boolean("material_change"),
  },
  (t) => ({
    queueIdx: index("change_sentinel_events_queue_idx").on(
      t.state,
      t.receivedAt,
    ),
    sourceObservedIdx: index("change_sentinel_events_source_observed_idx").on(
      t.canonicalSourceId,
      t.observedAt,
    ),
  }),
);

export type ChangeSentinelEvent = typeof changeSentinelEventsTable.$inferSelect;
export type InsertChangeSentinelEvent =
  typeof changeSentinelEventsTable.$inferInsert;
