CREATE TABLE IF NOT EXISTS "demographic_series" (
  "id" serial PRIMARY KEY NOT NULL,
  "series_key" text NOT NULL,
  "title" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "unit" text NOT NULL,
  "geography_level" text DEFAULT 'municipality' NOT NULL,
  "reference_type" text NOT NULL,
  "source" text NOT NULL,
  "source_dataset" text NOT NULL,
  "source_url" text,
  "external_key" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "demographic_series_series_key_unique" UNIQUE("series_key"),
  CONSTRAINT "demographic_series_reference_type_check" CHECK ("reference_type" in ('stock', 'flow'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demographic_series_external_key_idx" ON "demographic_series" USING btree ("external_key");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "demographic_releases" (
  "id" serial PRIMARY KEY NOT NULL,
  "series_id" integer NOT NULL,
  "source_dataset" text NOT NULL,
  "source_url" text NOT NULL,
  "source_hash" text NOT NULL,
  "source_version" text,
  "release_date" timestamp with time zone,
  "acquired_at" timestamp with time zone DEFAULT now() NOT NULL,
  "http_etag" text,
  "http_last_modified" text,
  "raw_payload" text,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  CONSTRAINT "demographic_releases_series_id_demographic_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."demographic_series"("id") ON DELETE cascade ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "demographic_releases_series_hash_idx" ON "demographic_releases" USING btree ("series_id","source_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demographic_releases_series_acquired_idx" ON "demographic_releases" USING btree ("series_id","acquired_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "demographic_observations" (
  "id" serial PRIMARY KEY NOT NULL,
  "series_id" integer NOT NULL,
  "release_id" integer NOT NULL,
  "geography_code" text NOT NULL,
  "reference_period" text NOT NULL,
  "reference_type" text NOT NULL,
  "dimensions" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "dimension_key" text DEFAULT '{}' NOT NULL,
  "value" numeric(18, 4) NOT NULL,
  "unit" text NOT NULL,
  "source_status" text DEFAULT 'unknown' NOT NULL,
  "source_observation_status" text,
  "quality_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "demographic_observations_release_id_demographic_releases_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."demographic_releases"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "demographic_observations_series_id_demographic_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."demographic_series"("id") ON DELETE cascade ON UPDATE no action,
  CONSTRAINT "demographic_observations_reference_type_check" CHECK ("reference_type" in ('stock', 'flow')),
  CONSTRAINT "demographic_observations_source_status_check" CHECK ("source_status" in ('final', 'provisional', 'estimated', 'reconstructed', 'forecast', 'unknown'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "demographic_observations_release_identity_idx" ON "demographic_observations" USING btree ("release_id","geography_code","reference_period","dimension_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demographic_observations_series_period_idx" ON "demographic_observations" USING btree ("series_id","geography_code","reference_period");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "demographic_observations_release_idx" ON "demographic_observations" USING btree ("release_id");
