ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_published_at_idx" ON "reports" USING btree ("published_at");
