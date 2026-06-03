ALTER TABLE "opendata_snapshots" ADD COLUMN "etag" text;--> statement-breakpoint
ALTER TABLE "opendata_snapshots" ADD COLUMN "last_modified" text;--> statement-breakpoint
ALTER TABLE "opendata_snapshots" ADD COLUMN "last_checked_at" timestamp with time zone DEFAULT now() NOT NULL;
