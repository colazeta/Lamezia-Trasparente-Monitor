-- LTCEDS canonical/internal persistence plus physically separated public projection.
-- Additive only: no existing table or column is altered or removed.

CREATE TABLE "crime_events" (
  "event_id" uuid PRIMARY KEY NOT NULL,
  "schema_version" text NOT NULL,
  "record_status" text NOT NULL,
  "event_form" text NOT NULL,
  "title" text NOT NULL,
  "temporal_start" text,
  "temporal_end" text,
  "temporal_edtf" text,
  "temporal_precision" text NOT NULL,
  "temporal_start_bound" date,
  "temporal_end_bound" date,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "crime_events_event_id_uuidv7_check" CHECK ("event_id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  CONSTRAINT "crime_events_record_status_check" CHECK ("record_status" in ('verified_source','published','superseded','merged','split','withdrawn','suppressed')),
  CONSTRAINT "crime_events_event_form_check" CHECK ("event_form" in ('discrete','continuous_episode','course_of_conduct')),
  CONSTRAINT "crime_events_temporal_precision_check" CHECK ("temporal_precision" in ('exact_datetime','exact_date','bounded_interval','week_or_similar','month','year','approximate','unknown')),
  CONSTRAINT "crime_events_temporal_bounds_order_check" CHECK ("temporal_start_bound" is null or "temporal_end_bound" is null or "temporal_end_bound" >= "temporal_start_bound")
);

CREATE INDEX "crime_events_record_status_idx" ON "crime_events" ("record_status");
CREATE INDEX "crime_events_temporal_bounds_idx" ON "crime_events" ("temporal_start_bound", "temporal_end_bound");

CREATE TABLE "crime_sources" (
  "source_id" uuid PRIMARY KEY NOT NULL,
  "source_type" text NOT NULL,
  "provider" text NOT NULL,
  "title" text DEFAULT '' NOT NULL,
  "url" text,
  "published_at" timestamp with time zone,
  "retrieved_at" timestamp with time zone,
  "canonical_source_key" text,
  "content_sha256" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "crime_sources_source_id_uuidv7_check" CHECK ("source_id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  CONSTRAINT "crime_sources_source_type_check" CHECK ("source_type" in ('judicial_primary','law_enforcement_primary','public_authority_primary','news_agency','press_secondary','academic','other')),
  CONSTRAINT "crime_sources_content_sha256_check" CHECK ("content_sha256" is null or "content_sha256" ~ '^[0-9a-f]{64}$')
);

CREATE INDEX "crime_sources_canonical_source_key_idx" ON "crime_sources" ("canonical_source_key");
CREATE INDEX "crime_sources_source_type_idx" ON "crime_sources" ("source_type");

CREATE TABLE "crime_event_offences" (
  "offence_instance_id" uuid PRIMARY KEY NOT NULL,
  "event_id" uuid NOT NULL,
  "classification_source_id" uuid,
  "classification_basis" text NOT NULL,
  "iccs_code" text,
  "istat_catalogue_id" text,
  "istat_synthetic_code" text,
  "istat_analytical_code" text,
  "legal_reference" text,
  "attempt_status" text,
  "situational_context" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "cyber_related" text,
  "affected_object_count" integer,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "crime_event_offences_id_uuidv7_check" CHECK ("offence_instance_id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  CONSTRAINT "crime_event_offences_classification_basis_check" CHECK ("classification_basis" in ('source_stated_legal','istat_crosswalk','behavioural_manual','provisional')),
  CONSTRAINT "crime_event_offences_attempt_status_check" CHECK ("attempt_status" is null or "attempt_status" in ('attempted','completed','not_applicable','unknown')),
  CONSTRAINT "crime_event_offences_affected_object_count_check" CHECK ("affected_object_count" is null or "affected_object_count" >= 0),
  CONSTRAINT "crime_event_offences_event_id_crime_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "crime_events"("event_id") ON DELETE cascade,
  CONSTRAINT "crime_event_offences_classification_source_id_crime_sources_source_id_fk" FOREIGN KEY ("classification_source_id") REFERENCES "crime_sources"("source_id") ON DELETE restrict
);

CREATE INDEX "crime_event_offences_event_idx" ON "crime_event_offences" ("event_id");
CREATE INDEX "crime_event_offences_iccs_idx" ON "crime_event_offences" ("iccs_code");
CREATE INDEX "crime_event_offences_istat_catalogue_idx" ON "crime_event_offences" ("istat_catalogue_id");

CREATE TABLE "crime_event_locations" (
  "location_id" uuid PRIMARY KEY NOT NULL,
  "event_id" uuid NOT NULL,
  "basis_source_id" uuid,
  "role" text NOT NULL,
  "municipality" text NOT NULL,
  "evidence_basis" text NOT NULL,
  "evidence_precision" text NOT NULL,
  "resolved_precision" text NOT NULL,
  "sensitivity" text NOT NULL,
  "publication_risk" text NOT NULL,
  "longitude" numeric(10,7),
  "latitude" numeric(10,7),
  "place_name" text,
  "neighbourhood" text,
  "iccs_location_type" text,
  "street_scope_key" text,
  "neighbourhood_scope_key" text,
  "locality_scope_key" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "crime_event_locations_role_check" CHECK ("role" in ('occurrence','target','discovery','recovery','arrest','search','procedural','other')),
  CONSTRAINT "crime_event_locations_evidence_basis_check" CHECK ("evidence_basis" in ('source_stated_exact','source_stated_named_site','source_stated_street','source_stated_neighbourhood','source_stated_locality','geocoder_candidate','editorial_inference','unknown')),
  CONSTRAINT "crime_event_locations_evidence_precision_check" CHECK ("evidence_precision" in ('exact_public_site','exact_address','street_segment','neighbourhood','locality','municipality','unknown')),
  CONSTRAINT "crime_event_locations_resolved_precision_check" CHECK ("resolved_precision" in ('exact_public_site','exact_address','street_segment','neighbourhood','locality','municipality','unknown')),
  CONSTRAINT "crime_event_locations_sensitivity_check" CHECK ("sensitivity" in ('public_place','non_sensitive','private_or_sensitive','unknown')),
  CONSTRAINT "crime_event_locations_publication_risk_check" CHECK ("publication_risk" in ('low_public_site','non_sensitive','residential','victim_linked','minor_or_vulnerable','sexual_offence_context','unknown')),
  CONSTRAINT "crime_event_locations_coordinate_pair_check" CHECK (("longitude" is null and "latitude" is null) or ("longitude" is not null and "latitude" is not null)),
  CONSTRAINT "crime_event_locations_longitude_check" CHECK ("longitude" is null or ("longitude" >= -180 and "longitude" <= 180)),
  CONSTRAINT "crime_event_locations_latitude_check" CHECK ("latitude" is null or ("latitude" >= -90 and "latitude" <= 90)),
  CONSTRAINT "crime_event_locations_coarse_point_check" CHECK ("resolved_precision" not in ('municipality','unknown') or ("longitude" is null and "latitude" is null)),
  CONSTRAINT "crime_event_locations_event_id_crime_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "crime_events"("event_id") ON DELETE cascade,
  CONSTRAINT "crime_event_locations_basis_source_id_crime_sources_source_id_fk" FOREIGN KEY ("basis_source_id") REFERENCES "crime_sources"("source_id") ON DELETE restrict
);

CREATE INDEX "crime_event_locations_event_role_idx" ON "crime_event_locations" ("event_id", "role");
CREATE INDEX "crime_event_locations_street_scope_idx" ON "crime_event_locations" ("street_scope_key");

CREATE TABLE "crime_event_sources" (
  "event_id" uuid NOT NULL,
  "source_id" uuid NOT NULL,
  "support_role" text DEFAULT 'event_support' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "crime_event_sources_event_id_source_id_support_role_pk" PRIMARY KEY ("event_id", "source_id", "support_role"),
  CONSTRAINT "crime_event_sources_support_role_check" CHECK ("support_role" in ('event_support','classification_support','location_support','procedural_context','corroboration')),
  CONSTRAINT "crime_event_sources_event_id_crime_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "crime_events"("event_id") ON DELETE cascade,
  CONSTRAINT "crime_event_sources_source_id_crime_sources_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "crime_sources"("source_id") ON DELETE restrict
);

CREATE INDEX "crime_event_sources_source_idx" ON "crime_event_sources" ("source_id");

CREATE TABLE "crime_event_clusters" (
  "cluster_id" uuid PRIMARY KEY NOT NULL,
  "schema_version" text NOT NULL,
  "reported_event_count" integer,
  "count_precision" text NOT NULL,
  "resolution_status" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "crime_event_clusters_id_uuidv7_check" CHECK ("cluster_id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
  CONSTRAINT "crime_event_clusters_reported_count_check" CHECK ("reported_event_count" is null or "reported_event_count" >= 1),
  CONSTRAINT "crime_event_clusters_exact_count_check" CHECK ("count_precision" <> 'exact' or "reported_event_count" is not null),
  CONSTRAINT "crime_event_clusters_count_precision_check" CHECK ("count_precision" in ('exact','minimum','approximate','unknown')),
  CONSTRAINT "crime_event_clusters_resolution_status_check" CHECK ("resolution_status" in ('unresolved','partially_resolved','resolved'))
);

CREATE INDEX "crime_event_clusters_resolution_idx" ON "crime_event_clusters" ("resolution_status");

CREATE TABLE "crime_event_cluster_sources" (
  "cluster_id" uuid NOT NULL,
  "source_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "crime_event_cluster_sources_cluster_id_source_id_pk" PRIMARY KEY ("cluster_id", "source_id"),
  CONSTRAINT "crime_event_cluster_sources_cluster_id_crime_event_clusters_cluster_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "crime_event_clusters"("cluster_id") ON DELETE cascade,
  CONSTRAINT "crime_event_cluster_sources_source_id_crime_sources_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "crime_sources"("source_id") ON DELETE restrict
);

CREATE INDEX "crime_event_cluster_sources_source_idx" ON "crime_event_cluster_sources" ("source_id");

CREATE TABLE "crime_event_cluster_members" (
  "cluster_id" uuid NOT NULL,
  "event_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "crime_event_cluster_members_cluster_id_event_id_pk" PRIMARY KEY ("cluster_id", "event_id"),
  CONSTRAINT "crime_event_cluster_members_cluster_id_crime_event_clusters_cluster_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "crime_event_clusters"("cluster_id") ON DELETE cascade,
  CONSTRAINT "crime_event_cluster_members_event_id_crime_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "crime_events"("event_id") ON DELETE restrict
);

CREATE INDEX "crime_event_cluster_members_event_idx" ON "crime_event_cluster_members" ("event_id");

-- Public read model: no internal geometry/address/source-content columns.
CREATE TABLE "crime_public_events" (
  "event_id" uuid PRIMARY KEY NOT NULL,
  "schema_version" text NOT NULL,
  "payload" jsonb NOT NULL,
  "payload_sha256" text NOT NULL,
  "publication_gate_version" text NOT NULL,
  "published_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "crime_public_events_payload_sha256_check" CHECK ("payload_sha256" ~ '^[0-9a-f]{64}$'),
  CONSTRAINT "crime_public_events_payload_object_check" CHECK (jsonb_typeof("payload") = 'object'),
  CONSTRAINT "crime_public_events_payload_event_id_check" CHECK ("payload" ->> 'event_id' = "event_id"::text),
  CONSTRAINT "crime_public_events_payload_schema_version_check" CHECK ("payload" ->> 'schema_version' = "schema_version"),
  CONSTRAINT "crime_public_events_event_id_crime_events_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "crime_events"("event_id") ON DELETE cascade
);

CREATE INDEX "crime_public_events_schema_version_idx" ON "crime_public_events" ("schema_version");
