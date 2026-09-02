-- Adds worker lease/retry and outcome metadata to the content-minimised
-- changedetection.io event ledger. No page content is stored here.
ALTER TABLE "change_sentinel_events"
  ADD COLUMN IF NOT EXISTS "attempt_count" integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS "claimed_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "processed_at" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "last_error_code" text,
  ADD COLUMN IF NOT EXISTS "canonical_before_hash" text,
  ADD COLUMN IF NOT EXISTS "canonical_after_hash" text,
  ADD COLUMN IF NOT EXISTS "material_change" boolean;

CREATE INDEX IF NOT EXISTS "change_sentinel_events_queue_idx"
  ON "change_sentinel_events" ("state", "received_at");
