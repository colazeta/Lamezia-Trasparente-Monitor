ALTER TABLE "organi_members" DROP CONSTRAINT IF EXISTS "organi_members_organo_id_official_id_unique";--> statement-breakpoint
ALTER TABLE "organi_members" ADD COLUMN IF NOT EXISTS "term_label" text;--> statement-breakpoint
ALTER TABLE "organi_members" ADD COLUMN IF NOT EXISTS "start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organi_members" ADD COLUMN IF NOT EXISTS "end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "organi_members" ADD COLUMN IF NOT EXISTS "source_label" text;--> statement-breakpoint
ALTER TABLE "organi_members" ADD COLUMN IF NOT EXISTS "source_url" text;--> statement-breakpoint
ALTER TABLE "organi_members" ADD COLUMN IF NOT EXISTS "notes" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organi_members_organo_id_idx" ON "organi_members" USING btree ("organo_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "organi_members_term_idx" ON "organi_members" USING btree ("organo_id","start_date","end_date");
