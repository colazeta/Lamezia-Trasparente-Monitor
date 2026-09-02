import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Durable idempotency ledger for external change-sentinel notifications.
 *
 * This table intentionally stores no page diff, snapshot, HTML, screenshot or
 * extracted text. Canonical source content remains owned by the normal LT
 * ingestion pipeline.
 */
export const changeSentinelEventsTable = pgTable("change_sentinel_events", {
  eventId: text("event_id").primaryKey(),
  provider: text("provider").notNull(),
  watchKey: text("watch_key").notNull(),
  canonicalSourceId: text("canonical_source_id").notNull(),
  observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  state: text("state").notNull().default("received"),
});

export type ChangeSentinelEvent = typeof changeSentinelEventsTable.$inferSelect;
export type InsertChangeSentinelEvent =
  typeof changeSentinelEventsTable.$inferInsert;
