CREATE TABLE "source_acquisition_runs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"release_id" uuid,
	"status" text NOT NULL,
	"kind" text NOT NULL,
	"repository_commit" text NOT NULL,
	"records_expected" integer NOT NULL,
	"records_inserted" integer,
	"records_verified" integer,
	"error_code" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	CONSTRAINT "source_runs_id_v7" CHECK ("source_acquisition_runs"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "source_runs_kind" CHECK ("source_acquisition_runs"."kind" = 'repository_import'),
	CONSTRAINT "source_runs_commit" CHECK ("source_acquisition_runs"."repository_commit" ~ '^[0-9a-f]{40}$'),
	CONSTRAINT "source_runs_counts" CHECK ("source_acquisition_runs"."records_expected" >= 0 AND ("source_acquisition_runs"."records_inserted" IS NULL OR "source_acquisition_runs"."records_inserted" BETWEEN 0 AND "source_acquisition_runs"."records_expected") AND ("source_acquisition_runs"."records_verified" IS NULL OR "source_acquisition_runs"."records_verified" BETWEEN 0 AND "source_acquisition_runs"."records_expected")),
	CONSTRAINT "source_runs_state" CHECK (("source_acquisition_runs"."status" = 'running' AND "source_acquisition_runs"."completed_at" IS NULL AND "source_acquisition_runs"."error_code" IS NULL) OR ("source_acquisition_runs"."status" = 'failed' AND "source_acquisition_runs"."completed_at" IS NOT NULL AND "source_acquisition_runs"."error_code" IS NOT NULL) OR ("source_acquisition_runs"."status" = 'succeeded' AND "source_acquisition_runs"."completed_at" IS NOT NULL AND "source_acquisition_runs"."error_code" IS NULL AND "source_acquisition_runs"."release_id" IS NOT NULL AND "source_acquisition_runs"."records_verified" IS NOT NULL AND "source_acquisition_runs"."records_inserted" IS NOT NULL AND "source_acquisition_runs"."records_verified" = "source_acquisition_runs"."records_expected"))
);
--> statement-breakpoint
CREATE TABLE "source_artifacts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"byte_hash" text NOT NULL,
	"byte_size" bigint NOT NULL,
	"media_type" text NOT NULL,
	"content_role" text NOT NULL,
	"repository_commit" text NOT NULL,
	"locator" text NOT NULL,
	"content_text" text NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_artifacts_endpoint_hash_unique" UNIQUE("endpoint_id","byte_hash"),
	CONSTRAINT "source_artifacts_id_endpoint_unique" UNIQUE("id","endpoint_id"),
	CONSTRAINT "source_artifacts_id_v7" CHECK ("source_artifacts"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "source_artifacts_hash" CHECK ("source_artifacts"."byte_hash" ~ '^[0-9a-f]{64}$' AND "source_artifacts"."byte_hash" = encode(sha256(convert_to("source_artifacts"."content_text", 'UTF8')), 'hex')),
	CONSTRAINT "source_artifacts_size" CHECK ("source_artifacts"."byte_size" = octet_length("source_artifacts"."content_text") AND "source_artifacts"."byte_size" BETWEEN 1 AND 4194304),
	CONSTRAINT "source_artifacts_commit" CHECK ("source_artifacts"."repository_commit" ~ '^[0-9a-f]{40}$'),
	CONSTRAINT "source_artifacts_role" CHECK ("source_artifacts"."content_role" IN ('public_projection', 'derived_dataset', 'source_snapshot') AND "source_artifacts"."media_type" = 'application/json')
);
--> statement-breakpoint
CREATE TABLE "source_endpoints" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_id" uuid NOT NULL,
	"repository_path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_endpoints_source_path_unique" UNIQUE("source_id","repository_path"),
	CONSTRAINT "source_endpoints_id_v7" CHECK ("source_endpoints"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
);
--> statement-breakpoint
CREATE TABLE "source_records" (
	"id" uuid PRIMARY KEY NOT NULL,
	"release_id" uuid NOT NULL,
	"collection_key" text NOT NULL,
	"ordinal" integer NOT NULL,
	"native_key" text,
	"record_hash" text NOT NULL,
	"payload" jsonb NOT NULL,
	CONSTRAINT "source_records_release_position_unique" UNIQUE("release_id","collection_key","ordinal"),
	CONSTRAINT "source_records_id_v7" CHECK ("source_records"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "source_records_ordinal" CHECK ("source_records"."ordinal" >= 0),
	CONSTRAINT "source_records_hash" CHECK ("source_records"."record_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "source_records_payload_object" CHECK (jsonb_typeof("source_records"."payload") = 'object')
);
--> statement-breakpoint
CREATE TABLE "source_releases" (
	"id" uuid PRIMARY KEY NOT NULL,
	"endpoint_id" uuid NOT NULL,
	"artifact_id" uuid NOT NULL,
	"metadata" jsonb NOT NULL,
	"collections" jsonb NOT NULL,
	"source_status" text,
	"source_timestamp_raw" text,
	"importer_version" text NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_releases_artifact_id_unique" UNIQUE("artifact_id"),
	CONSTRAINT "source_releases_id_endpoint_unique" UNIQUE("id","endpoint_id"),
	CONSTRAINT "source_releases_id_v7" CHECK ("source_releases"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "source_releases_objects" CHECK (jsonb_typeof("source_releases"."metadata") = 'object' AND jsonb_typeof("source_releases"."collections") = 'object')
);
--> statement-breakpoint
CREATE TABLE "source_sources" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_key" text NOT NULL,
	"title" text NOT NULL,
	"kind" text NOT NULL,
	"upstream_urls" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "source_sources_source_key_unique" UNIQUE("source_key"),
	CONSTRAINT "source_sources_id_v7" CHECK ("source_sources"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "source_sources_kind" CHECK ("source_sources"."kind" = 'repository_snapshot'),
	CONSTRAINT "source_sources_urls_array" CHECK (jsonb_typeof("source_sources"."upstream_urls") = 'array')
);
--> statement-breakpoint
ALTER TABLE "source_acquisition_runs" ADD CONSTRAINT "source_acquisition_runs_endpoint_id_source_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."source_endpoints"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_acquisition_runs" ADD CONSTRAINT "source_runs_release_endpoint_fk" FOREIGN KEY ("release_id","endpoint_id") REFERENCES "public"."source_releases"("id","endpoint_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_artifacts" ADD CONSTRAINT "source_artifacts_endpoint_id_source_endpoints_id_fk" FOREIGN KEY ("endpoint_id") REFERENCES "public"."source_endpoints"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_endpoints" ADD CONSTRAINT "source_endpoints_source_id_source_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."source_sources"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_records" ADD CONSTRAINT "source_records_release_id_source_releases_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."source_releases"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_releases" ADD CONSTRAINT "source_releases_artifact_endpoint_fk" FOREIGN KEY ("artifact_id","endpoint_id") REFERENCES "public"."source_artifacts"("id","endpoint_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "source_runs_endpoint_started_idx" ON "source_acquisition_runs" USING btree ("endpoint_id","started_at");--> statement-breakpoint
CREATE INDEX "source_runs_release_idx" ON "source_acquisition_runs" USING btree ("release_id");--> statement-breakpoint
CREATE INDEX "source_records_native_key_idx" ON "source_records" USING btree ("native_key");--> statement-breakpoint
CREATE INDEX "source_releases_endpoint_idx" ON "source_releases" USING btree ("endpoint_id");