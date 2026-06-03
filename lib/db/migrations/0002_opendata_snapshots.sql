CREATE TABLE "opendata_snapshots" (
"id" serial PRIMARY KEY NOT NULL,
"resource_id" integer NOT NULL,
"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
"checksum" text NOT NULL,
"row_count" integer DEFAULT 0 NOT NULL,
"changed" boolean DEFAULT true NOT NULL,
"columns" jsonb DEFAULT '[]'::jsonb NOT NULL,
"rows" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opendata_snapshots" ADD CONSTRAINT "opendata_snapshots_resource_id_opendata_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."opendata_resources"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "opendata_snapshots_resource_id_idx" ON "opendata_snapshots" USING btree ("resource_id");
--> statement-breakpoint
CREATE INDEX "opendata_snapshots_captured_at_idx" ON "opendata_snapshots" USING btree ("captured_at" DESC NULLS LAST);
