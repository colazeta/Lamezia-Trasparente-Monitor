-- Redazione: block-based page builder, site string micro-copy, helper content overrides.
CREATE TABLE IF NOT EXISTS "page_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_slug" text NOT NULL,
	"block_type" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"content" jsonb DEFAULT '{}' NOT NULL,
	"draft_content" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "site_strings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"namespace" text DEFAULT 'general' NOT NULL,
	"default_value" text DEFAULT '' NOT NULL,
	"published_value" text,
	"draft_value" text,
	"rich_text" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_strings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "helper_overrides" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"published_json" jsonb,
	"draft_json" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "helper_overrides_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_blocks_page_slug_idx" ON "page_blocks" USING btree ("page_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_blocks_position_idx" ON "page_blocks" USING btree ("page_slug","position");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "site_strings_namespace_idx" ON "site_strings" USING btree ("namespace");
