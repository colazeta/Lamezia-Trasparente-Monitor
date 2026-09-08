CREATE TABLE "core_assertions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_record_id" uuid NOT NULL,
	"source_pointer" text NOT NULL,
	"property_key" text NOT NULL,
	"assertion_kind" text NOT NULL,
	"value" jsonb NOT NULL,
	"value_state" text NOT NULL,
	"value_hash" text NOT NULL,
	"source_url" text NOT NULL,
	"extractor_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_assertions_source_pointer_version_uq" UNIQUE("source_record_id","source_pointer","extractor_version"),
	CONSTRAINT "core_assertions_id_record_uq" UNIQUE("id","source_record_id"),
	CONSTRAINT "core_assertions_id_v7" CHECK ("core_assertions"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "core_assertions_kind" CHECK ("core_assertions"."assertion_kind" IN ('source_stated','extracted','derived','editorial')),
	CONSTRAINT "core_assertions_value_state" CHECK (("core_assertions"."value_state" = 'unknown' AND "core_assertions"."value" = 'null'::jsonb) OR ("core_assertions"."value_state" = 'known' AND "core_assertions"."value" <> 'null'::jsonb)),
	CONSTRAINT "core_assertions_hash" CHECK ("core_assertions"."value_hash" ~ '^[0-9a-f]{64}$'),
	CONSTRAINT "core_assertions_pointer" CHECK (left("core_assertions"."source_pointer", 1) = '/'),
	CONSTRAINT "core_assertions_property" CHECK ("core_assertions"."property_key" ~ '^[a-z][a-z0-9_]*[.][a-z][a-z0-9_]*$')
);
--> statement-breakpoint
CREATE TABLE "core_resolution_outcomes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_record_id" uuid NOT NULL,
	"candidate_key" text NOT NULL,
	"assertion_id" uuid NOT NULL,
	"target_subject_id" uuid,
	"status" text NOT NULL,
	"role" text NOT NULL,
	"reason_code" text NOT NULL,
	"resolver_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "core_resolution_candidate_version_uq" UNIQUE("source_record_id","candidate_key","resolver_version"),
	CONSTRAINT "core_resolution_id_v7" CHECK ("core_resolution_outcomes"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "core_resolution_target_state" CHECK (("core_resolution_outcomes"."status" = 'resolved' AND "core_resolution_outcomes"."target_subject_id" IS NOT NULL) OR ("core_resolution_outcomes"."status" IN ('unresolved','not_applicable','no_canonical_target','insufficient_evidence','review_required') AND "core_resolution_outcomes"."target_subject_id" IS NULL)),
	CONSTRAINT "core_resolution_reason" CHECK (btrim("core_resolution_outcomes"."reason_code") <> '' AND btrim("core_resolution_outcomes"."role") <> '' AND btrim("core_resolution_outcomes"."candidate_key") <> '')
);
--> statement-breakpoint
CREATE TABLE "project_field_resolutions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"field" text NOT NULL,
	"selected_assertion_id" uuid NOT NULL,
	"alternative_count" integer NOT NULL,
	"decision_rule" text NOT NULL,
	"resolver_version" text NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_to" timestamp with time zone,
	CONSTRAINT "project_field_resolutions_id_v7" CHECK ("project_field_resolutions"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "project_field_resolutions_field" CHECK ("project_field_resolutions"."field" IN ('title','mission','component','investment','intervention','programme_holder','implementer','financed_amount','execution_status','start_date','end_date','published_at','source_url','attachments','cup_status','opencup_total_cost','opencup_public_funding')),
	CONSTRAINT "project_field_resolutions_count" CHECK ("project_field_resolutions"."alternative_count" >= 0),
	CONSTRAINT "project_field_resolutions_period" CHECK ("project_field_resolutions"."valid_to" IS NULL OR "project_field_resolutions"."valid_to" >= "project_field_resolutions"."valid_from")
);
--> statement-breakpoint
CREATE TABLE "project_identifiers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"scheme" text NOT NULL,
	"issuer" text NOT NULL,
	"value" text NOT NULL,
	"qualification" text NOT NULL,
	"evidence_assertion_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_identifiers_qualified_value_uq" UNIQUE("scheme","issuer","value"),
	CONSTRAINT "project_identifiers_id_v7" CHECK ("project_identifiers"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "project_identifiers_cup" CHECK ("project_identifiers"."scheme" = 'CUP' AND "project_identifiers"."issuer" = 'it.dipe' AND "project_identifiers"."value" ~ '^[A-Z0-9]{15}$'),
	CONSTRAINT "project_identifiers_qualification" CHECK ("project_identifiers"."qualification" = 'source_reported_format_checked')
);
--> statement-breakpoint
CREATE TABLE "project_projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text,
	"mission" text,
	"component" text,
	"investment" text,
	"intervention" text,
	"programme_holder" text,
	"implementer" text,
	"financed_amount" numeric(14, 2),
	"execution_status" text,
	"start_date" date,
	"end_date" date,
	"published_at" date,
	"source_url" text,
	"attachments" jsonb,
	"cup_status" text,
	"opencup_total_cost" numeric(14, 2),
	"opencup_public_funding" numeric(14, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_projects_amounts" CHECK (("project_projects"."financed_amount" IS NULL OR "project_projects"."financed_amount" >= 0) AND ("project_projects"."opencup_total_cost" IS NULL OR "project_projects"."opencup_total_cost" >= 0) AND ("project_projects"."opencup_public_funding" IS NULL OR "project_projects"."opencup_public_funding" >= 0)),
	CONSTRAINT "project_projects_attachments" CHECK ("project_projects"."attachments" IS NULL OR jsonb_typeof("project_projects"."attachments") = 'array')
);
--> statement-breakpoint
ALTER TABLE "core_assertions" ADD CONSTRAINT "core_assertions_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_resolution_outcomes" ADD CONSTRAINT "core_resolution_outcomes_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_resolution_outcomes" ADD CONSTRAINT "core_resolution_outcomes_target_subject_id_canonical_subjects_subject_id_fk" FOREIGN KEY ("target_subject_id") REFERENCES "public"."canonical_subjects"("subject_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "core_resolution_outcomes" ADD CONSTRAINT "core_resolution_assertion_record_fk" FOREIGN KEY ("assertion_id","source_record_id") REFERENCES "public"."core_assertions"("id","source_record_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_field_resolutions" ADD CONSTRAINT "project_field_resolutions_project_id_project_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project_projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_field_resolutions" ADD CONSTRAINT "project_field_resolutions_selected_assertion_id_core_assertions_id_fk" FOREIGN KEY ("selected_assertion_id") REFERENCES "public"."core_assertions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_identifiers" ADD CONSTRAINT "project_identifiers_project_id_project_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project_projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_identifiers" ADD CONSTRAINT "project_identifiers_evidence_assertion_id_core_assertions_id_fk" FOREIGN KEY ("evidence_assertion_id") REFERENCES "public"."core_assertions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_projects" ADD CONSTRAINT "project_projects_id_canonical_subjects_subject_id_fk" FOREIGN KEY ("id") REFERENCES "public"."canonical_subjects"("subject_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_resolution_target_idx" ON "core_resolution_outcomes" USING btree ("target_subject_id");--> statement-breakpoint
CREATE INDEX "core_resolution_status_idx" ON "core_resolution_outcomes" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "project_field_resolutions_current_uq" ON "project_field_resolutions" USING btree ("project_id","field") WHERE "project_field_resolutions"."valid_to" IS NULL;--> statement-breakpoint
CREATE INDEX "project_field_resolutions_assertion_idx" ON "project_field_resolutions" USING btree ("selected_assertion_id");--> statement-breakpoint
CREATE INDEX "project_identifiers_project_idx" ON "project_identifiers" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_projects_mission_idx" ON "project_projects" USING btree ("mission");--> statement-breakpoint
CREATE INDEX "project_projects_execution_status_idx" ON "project_projects" USING btree ("execution_status");