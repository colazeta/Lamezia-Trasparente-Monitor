-- Durable, content-minimised idempotency ledger for authenticated
-- changedetection.io notifications. Canonical page content is never stored here.
CREATE TABLE IF NOT EXISTS "change_sentinel_events" (
  "event_id" text PRIMARY KEY NOT NULL,
  "provider" text NOT NULL,
  "watch_key" text NOT NULL,
  "canonical_source_id" text NOT NULL,
  "observed_at" timestamp with time zone NOT NULL,
  "received_at" timestamp with time zone DEFAULT now() NOT NULL,
  "state" text DEFAULT 'received' NOT NULL
);

CREATE INDEX IF NOT EXISTS "change_sentinel_events_source_observed_idx"
  ON "change_sentinel_events" ("canonical_source_id", "observed_at");
