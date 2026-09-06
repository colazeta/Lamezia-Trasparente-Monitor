CREATE TABLE "canonical_subjects" (
  "subject_id" uuid PRIMARY KEY NOT NULL,
  "subject_kind" text NOT NULL,
  "domain_type" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "canonical_subjects_subject_id_uuidv7_check"
    CHECK ("subject_id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  CONSTRAINT "canonical_subjects_subject_kind_check"
    CHECK ("subject_kind" IN ('entity', 'event')),
  CONSTRAINT "canonical_subjects_domain_type_check"
    CHECK ("domain_type" ~ '^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$')
);
--> statement-breakpoint
CREATE INDEX "canonical_subjects_kind_domain_idx"
  ON "canonical_subjects" USING btree ("subject_kind", "domain_type");
--> statement-breakpoint
CREATE TABLE "legacy_subject_map" (
  "mapping_id" serial PRIMARY KEY NOT NULL,
  "legacy_namespace" text NOT NULL,
  "legacy_type" text NOT NULL,
  "legacy_id" text NOT NULL,
  "subject_id" uuid NOT NULL,
  "resolution_method" text NOT NULL,
  "mapping_status" text DEFAULT 'active' NOT NULL,
  "valid_from" timestamp with time zone DEFAULT now() NOT NULL,
  "valid_to" timestamp with time zone,
  CONSTRAINT "legacy_subject_map_namespace_check"
    CHECK ("legacy_namespace" ~ '^[a-z][a-z0-9_.-]{0,63}$'),
  CONSTRAINT "legacy_subject_map_type_check"
    CHECK ("legacy_type" ~ '^[a-z][a-z0-9_.-]{0,63}$'),
  CONSTRAINT "legacy_subject_map_legacy_id_check"
    CHECK (btrim("legacy_id") <> ''),
  CONSTRAINT "legacy_subject_map_resolution_method_check"
    CHECK ("resolution_method" ~ '^[a-z][a-z0-9_.-]{0,63}$'),
  CONSTRAINT "legacy_subject_map_status_check"
    CHECK ("mapping_status" IN ('active', 'superseded')),
  CONSTRAINT "legacy_subject_map_status_validity_check"
    CHECK (("mapping_status" = 'active' AND "valid_to" IS NULL) OR ("mapping_status" = 'superseded' AND "valid_to" IS NOT NULL)),
  CONSTRAINT "legacy_subject_map_validity_order_check"
    CHECK ("valid_to" IS NULL OR "valid_to" >= "valid_from"),
  CONSTRAINT "legacy_subject_map_subject_id_canonical_subjects_subject_id_fk"
    FOREIGN KEY ("subject_id") REFERENCES "canonical_subjects"("subject_id")
    ON DELETE restrict ON UPDATE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX "legacy_subject_map_active_identity_uq"
  ON "legacy_subject_map" USING btree ("legacy_namespace", "legacy_type", "legacy_id")
  WHERE "valid_to" IS NULL;
--> statement-breakpoint
CREATE INDEX "legacy_subject_map_subject_idx"
  ON "legacy_subject_map" USING btree ("subject_id");
--> statement-breakpoint
CREATE INDEX "legacy_subject_map_history_idx"
  ON "legacy_subject_map" USING btree ("legacy_namespace", "legacy_type", "legacy_id", "valid_from");
