CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"category_id" integer NOT NULL,
	"status" text DEFAULT 'aperto' NOT NULL,
	"relevance_count" integer DEFAULT 0 NOT NULL,
	"share_count" integer DEFAULT 0 NOT NULL,
	"follower_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "themes_slug_unique" UNIQUE("slug"),
	CONSTRAINT "themes_status_check" CHECK ("themes"."status" in ('aperto', 'in_corso', 'monitoraggio', 'chiuso'))
);
--> statement-breakpoint
CREATE TABLE "theme_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme_id" integer NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"url" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme_id" integer NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"event_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme_id" integer NOT NULL,
	"subject" text NOT NULL,
	"sender" text NOT NULL,
	"recipient" text NOT NULL,
	"direction" text NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"body" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme_id" integer NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"unit" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "performance_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "performance_indicators" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"unit" text NOT NULL,
	"source" text DEFAULT 'Redazione' NOT NULL,
	"source_url" text,
	"update_mode" text DEFAULT 'manual' NOT NULL,
	"polarity" text DEFAULT 'neutral' NOT NULL,
	"external_key" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "performance_indicators_slug_unique" UNIQUE("slug"),
	CONSTRAINT "performance_indicators_update_mode_check" CHECK ("performance_indicators"."update_mode" in ('manual', 'automatic'))
);
--> statement-breakpoint
CREATE TABLE "performance_indicator_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"indicator_id" integer NOT NULL,
	"period" text NOT NULL,
	"value" numeric(18, 4) NOT NULL,
	"note" text,
	"manual" boolean DEFAULT false NOT NULL,
	"source" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"supplier" text NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"procedure_type" text NOT NULL,
	"status" text NOT NULL,
	"cig" text,
	"cup" text,
	"stazione_appaltante" text,
	"acquisition_tool" text,
	"without_tender" boolean DEFAULT false NOT NULL,
	"without_mepa" boolean DEFAULT false NOT NULL,
	"anac_url" text,
	"macrotema" text,
	"macrotema_manual" boolean DEFAULT false NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"geo_address" text,
	"geo_quartiere" text,
	"geo_source" text,
	"geo_manual" boolean DEFAULT false NOT NULL,
	"geo_verify" boolean DEFAULT false NOT NULL,
	"award_date" timestamp with time zone DEFAULT now() NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"theme_id" integer,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "contracts_source_id_unique" UNIQUE("source_id")
);
--> statement-breakpoint
CREATE TABLE "acts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"number" text NOT NULL,
	"summary" text NOT NULL,
	"publish_date" timestamp with time zone DEFAULT now() NOT NULL,
	"end_date" timestamp with time zone DEFAULT now() NOT NULL,
	"theme_id" integer
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"location" text NOT NULL,
	"status" text DEFAULT 'ricevuta' NOT NULL,
	"citizen_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reports_status_check" CHECK ("reports"."status" in ('ricevuta', 'in_valutazione', 'presa_in_carico', 'archiviata'))
);
--> statement-breakpoint
CREATE TABLE "monitoring_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_type" text NOT NULL,
	"contract_id" integer,
	"pnrr_project_id" integer,
	"subject_title" text NOT NULL,
	"cig" text,
	"cup" text,
	"title" text NOT NULL,
	"author_name" text,
	"desk_analysis" text NOT NULL,
	"effectiveness_evaluation" text NOT NULL,
	"impact_results" text NOT NULL,
	"overall_assessment" text NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'in_revisione' NOT NULL,
	"moderation_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "monitoring_reports_subject_type_check" CHECK ("monitoring_reports"."subject_type" in ('contract', 'pnrr')),
	CONSTRAINT "monitoring_reports_status_check" CHECK ("monitoring_reports"."status" in ('in_revisione', 'pubblicato', 'rifiutato')),
	CONSTRAINT "monitoring_reports_assessment_check" CHECK ("monitoring_reports"."overall_assessment" in ('positivo', 'neutro', 'critico'))
);
--> statement-breakpoint
CREATE TABLE "shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme_id" integer NOT NULL,
	"channel" text NOT NULL,
	"dedupe_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_relevance_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme_id" integer NOT NULL,
	"dedupe_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" serial PRIMARY KEY NOT NULL,
	"progressivo" text NOT NULL,
	"tipologia" text NOT NULL,
	"category" text NOT NULL,
	"subcategory" text,
	"provenienza" text,
	"oggetto" text NOT NULL,
	"data_atto" timestamp with time zone,
	"pub_start" timestamp with time zone,
	"pub_end" timestamp with time zone,
	"num_reg_set" text,
	"num_reg_gen" text,
	"cups" text[] DEFAULT '{}' NOT NULL,
	"pnrr_mission" text,
	"is_pnrr" boolean DEFAULT false NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"detail_fetched_at" timestamp with time zone,
	"markdown_text" text,
	"markdown_source" text,
	"markdown_extracted_at" timestamp with time zone,
	"is_new" boolean DEFAULT true NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "publications_progressivo_unique" UNIQUE("progressivo")
);
--> statement-breakpoint
CREATE TABLE "attuazione_pnrr_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"mission" text,
	"component" text,
	"investment" text,
	"intervention" text,
	"holder" text,
	"attuatore" text,
	"cup" text,
	"importo_finanziato" numeric(14, 2),
	"status" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"published_at" timestamp with time zone,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attuazione_pnrr_projects_source_id_unique" UNIQUE("source_id")
);
--> statement-breakpoint
CREATE TABLE "opendata_datasets" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"slug" text,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"category" text,
	"theme" text,
	"frequency" text,
	"license_id" text,
	"license_title" text,
	"holder_name" text,
	"portal_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"resource_count" integer DEFAULT 0 NOT NULL,
	"metadata_modified" timestamp with time zone,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opendata_datasets_source_id_unique" UNIQUE("source_id")
);
--> statement-breakpoint
CREATE TABLE "opendata_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"dataset_id" integer NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"description" text,
	"format" text,
	"url" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"last_modified" timestamp with time zone,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opendata_resources_source_id_unique" UNIQUE("source_id")
);
--> statement-breakpoint
CREATE TABLE "feed_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"items_total" integer DEFAULT 0 NOT NULL,
	"items_new" integer DEFAULT 0 NOT NULL,
	"last_checked_at" timestamp with time zone,
	"last_updated_at" timestamp with time zone,
	CONSTRAINT "feed_status_source_unique" UNIQUE("source")
);
--> statement-breakpoint
CREATE TABLE "theme_followers" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme_id" integer NOT NULL,
	"email" text NOT NULL,
	"unsubscribe_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "theme_followers_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
CREATE TABLE "session_interventions" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"speaker_name" text NOT NULL,
	"speaker_role" text,
	"content" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"publication_id" integer NOT NULL,
	"seduta_id" integer,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_reports_publication_id_unique" UNIQUE("publication_id")
);
--> statement-breakpoint
CREATE TABLE "official_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"official_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" timestamp with time zone,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "official_declarations" (
	"id" serial PRIMARY KEY NOT NULL,
	"official_id" integer NOT NULL,
	"title" text NOT NULL,
	"date" timestamp with time zone,
	"content" text,
	"url" text,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "official_remunerations" (
	"id" serial PRIMARY KEY NOT NULL,
	"official_id" integer NOT NULL,
	"year" integer NOT NULL,
	"amount" numeric(14, 2),
	"type" text NOT NULL,
	"note" text,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "official_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"official_id" integer NOT NULL,
	"publication_id" integer NOT NULL,
	"seduta_id" integer,
	"vote" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "official_votes_official_id_publication_id_unique" UNIQUE("official_id","publication_id")
);
--> statement-breakpoint
CREATE TABLE "officials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"role" text NOT NULL,
	"role_title" text,
	"group" text,
	"status" text DEFAULT 'in_carica' NOT NULL,
	"appointment_date" timestamp with time zone,
	"biography" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "officials_slug_unique" UNIQUE("slug"),
	CONSTRAINT "officials_status_check" CHECK ("officials"."status" in ('in_carica', 'cessato'))
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"teaser" text,
	"destination_path" text NOT NULL,
	"cta_label" text NOT NULL,
	"topic" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organi_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"organo_id" integer NOT NULL,
	"official_id" integer NOT NULL,
	"membership_role" text,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "organi_members_organo_id_official_id_unique" UNIQUE("organo_id","official_id")
);
--> statement-breakpoint
CREATE TABLE "organi" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organi_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sedute" (
	"id" serial PRIMARY KEY NOT NULL,
	"organo_id" integer,
	"publication_id" integer,
	"type" text NOT NULL,
	"date" timestamp with time zone,
	"agenda" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sedute_publication_id_unique" UNIQUE("publication_id")
);
--> statement-breakpoint
CREATE TABLE "oversight_opinion_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"opinion_id" integer NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"url" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oversight_opinions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"issuing_body" text NOT NULL,
	"opinion_type" text NOT NULL,
	"subject" text NOT NULL,
	"outcome" text,
	"body" text,
	"reference_year" integer,
	"status" text DEFAULT 'pubblicato' NOT NULL,
	"opinion_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fundamental_acts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"title" text,
	"description" text,
	"source" text DEFAULT 'none' NOT NULL,
	"manual_official_url" text,
	"manual_file" jsonb,
	"linked_publication_id" integer,
	"suggested_publication_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fundamental_acts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "legality_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"final_judgment" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legality_areas_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "legality_requirements" (
	"id" serial PRIMARY KEY NOT NULL,
	"area_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'absent' NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"linked_acts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legality_requirements_status_check" CHECK ("legality_requirements"."status" in ('present', 'absent', 'partial', 'not_applicable'))
);
--> statement-breakpoint
CREATE TABLE "legality_overview" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"overall_judgment" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bandi" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"ente_erogatore" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"eligibility" text DEFAULT '' NOT NULL,
	"importo_stanziato" numeric(14, 2),
	"importo_medio_aggiudicato" numeric(14, 2),
	"scadenza" timestamp with time zone,
	"status" text DEFAULT 'aperto' NOT NULL,
	"settore" text,
	"official_url" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"suggested_source_ref" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bandi_slug_unique" UNIQUE("slug"),
	CONSTRAINT "bandi_suggested_source_ref_unique" UNIQUE("suggested_source_ref"),
	CONSTRAINT "bandi_status_check" CHECK ("bandi"."status" in ('aperto', 'in-scadenza', 'concluso')),
	CONSTRAINT "bandi_source_check" CHECK ("bandi"."source" in ('manual', 'suggested'))
);
--> statement-breakpoint
CREATE TABLE "bando_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"bando_id" integer NOT NULL,
	"target_type" text NOT NULL,
	"publication_id" integer,
	"contract_id" integer,
	"pnrr_project_id" integer,
	"match_reason" text DEFAULT '' NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"dismissed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bando_matches_target_type_check" CHECK ("bando_matches"."target_type" in ('publication', 'contract', 'pnrr'))
);
--> statement-breakpoint
CREATE TABLE "confiscated_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"denominazione" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"tipologia" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'confiscato' NOT NULL,
	"indirizzo" text DEFAULT '' NOT NULL,
	"assegnatario" text DEFAULT '' NOT NULL,
	"destinazione_uso" text DEFAULT '' NOT NULL,
	"dati_catastali" text DEFAULT '' NOT NULL,
	"official_url" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"source_id" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"geo_address" text,
	"geo_quartiere" text,
	"geo_source" text,
	"geo_manual" boolean DEFAULT false NOT NULL,
	"geo_verify" boolean DEFAULT false NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "confiscated_assets_slug_unique" UNIQUE("slug"),
	CONSTRAINT "confiscated_assets_source_id_unique" UNIQUE("source_id"),
	CONSTRAINT "confiscated_assets_status_check" CHECK ("confiscated_assets"."status" in ('sequestrato', 'confiscato', 'assegnato', 'riutilizzato')),
	CONSTRAINT "confiscated_assets_source_check" CHECK ("confiscated_assets"."source" in ('manual', 'auto'))
);
--> statement-breakpoint
CREATE TABLE "accesso_civico_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"oggetto" text NOT NULL,
	"tipo" text DEFAULT 'generalizzato' NOT NULL,
	"ente" text DEFAULT 'Comune di Lamezia Terme' NOT NULL,
	"descrizione" text DEFAULT '' NOT NULL,
	"request_text" text DEFAULT '' NOT NULL,
	"requester_name" text,
	"request_date" timestamp with time zone,
	"stato" text DEFAULT 'in-attesa' NOT NULL,
	"esito_note" text DEFAULT '' NOT NULL,
	"response_date" timestamp with time zone,
	"response_url" text,
	"response_label" text,
	"theme_id" integer,
	"pnrr_project_id" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accesso_civico_tipo_check" CHECK ("accesso_civico_requests"."tipo" in ('generalizzato', 'semplice', 'documentale')),
	CONSTRAINT "accesso_civico_stato_check" CHECK ("accesso_civico_requests"."stato" in ('in-attesa', 'accolta', 'rifiutata')),
	CONSTRAINT "accesso_civico_status_check" CHECK ("accesso_civico_requests"."status" in ('pending', 'published'))
);
--> statement-breakpoint
ALTER TABLE "themes" ADD CONSTRAINT "themes_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_documents" ADD CONSTRAINT "theme_documents_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_posts" ADD CONSTRAINT "theme_posts_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_emails" ADD CONSTRAINT "theme_emails_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_metrics" ADD CONSTRAINT "theme_metrics_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_indicators" ADD CONSTRAINT "performance_indicators_category_id_performance_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."performance_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_indicator_values" ADD CONSTRAINT "performance_indicator_values_indicator_id_performance_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."performance_indicators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "acts" ADD CONSTRAINT "acts_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitoring_reports" ADD CONSTRAINT "monitoring_reports_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitoring_reports" ADD CONSTRAINT "monitoring_reports_pnrr_project_id_attuazione_pnrr_projects_id_fk" FOREIGN KEY ("pnrr_project_id") REFERENCES "public"."attuazione_pnrr_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shares" ADD CONSTRAINT "shares_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_relevance_events" ADD CONSTRAINT "theme_relevance_events_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opendata_resources" ADD CONSTRAINT "opendata_resources_dataset_id_opendata_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."opendata_datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_followers" ADD CONSTRAINT "theme_followers_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_interventions" ADD CONSTRAINT "session_interventions_report_id_session_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."session_reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_reports" ADD CONSTRAINT "session_reports_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_reports" ADD CONSTRAINT "session_reports_seduta_id_sedute_id_fk" FOREIGN KEY ("seduta_id") REFERENCES "public"."sedute"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_activities" ADD CONSTRAINT "official_activities_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_declarations" ADD CONSTRAINT "official_declarations_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_remunerations" ADD CONSTRAINT "official_remunerations_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_votes" ADD CONSTRAINT "official_votes_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_votes" ADD CONSTRAINT "official_votes_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_votes" ADD CONSTRAINT "official_votes_seduta_id_sedute_id_fk" FOREIGN KEY ("seduta_id") REFERENCES "public"."sedute"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organi_members" ADD CONSTRAINT "organi_members_organo_id_organi_id_fk" FOREIGN KEY ("organo_id") REFERENCES "public"."organi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organi_members" ADD CONSTRAINT "organi_members_official_id_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."officials"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sedute" ADD CONSTRAINT "sedute_organo_id_organi_id_fk" FOREIGN KEY ("organo_id") REFERENCES "public"."organi"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sedute" ADD CONSTRAINT "sedute_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oversight_opinion_documents" ADD CONSTRAINT "oversight_opinion_documents_opinion_id_oversight_opinions_id_fk" FOREIGN KEY ("opinion_id") REFERENCES "public"."oversight_opinions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundamental_acts" ADD CONSTRAINT "fundamental_acts_linked_publication_id_publications_id_fk" FOREIGN KEY ("linked_publication_id") REFERENCES "public"."publications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fundamental_acts" ADD CONSTRAINT "fundamental_acts_suggested_publication_id_publications_id_fk" FOREIGN KEY ("suggested_publication_id") REFERENCES "public"."publications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legality_requirements" ADD CONSTRAINT "legality_requirements_area_id_legality_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."legality_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bando_matches" ADD CONSTRAINT "bando_matches_bando_id_bandi_id_fk" FOREIGN KEY ("bando_id") REFERENCES "public"."bandi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bando_matches" ADD CONSTRAINT "bando_matches_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bando_matches" ADD CONSTRAINT "bando_matches_contract_id_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."contracts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bando_matches" ADD CONSTRAINT "bando_matches_pnrr_project_id_attuazione_pnrr_projects_id_fk" FOREIGN KEY ("pnrr_project_id") REFERENCES "public"."attuazione_pnrr_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accesso_civico_requests" ADD CONSTRAINT "accesso_civico_requests_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accesso_civico_requests" ADD CONSTRAINT "accesso_civico_requests_pnrr_project_id_attuazione_pnrr_projects_id_fk" FOREIGN KEY ("pnrr_project_id") REFERENCES "public"."attuazione_pnrr_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "themes_category_id_idx" ON "themes" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "themes_status_idx" ON "themes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "theme_documents_theme_id_idx" ON "theme_documents" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "theme_posts_theme_id_idx" ON "theme_posts" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "theme_emails_theme_id_idx" ON "theme_emails" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "theme_metrics_theme_id_idx" ON "theme_metrics" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "performance_indicators_category_id_idx" ON "performance_indicators" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "performance_indicator_values_indicator_period_idx" ON "performance_indicator_values" USING btree ("indicator_id","period");--> statement-breakpoint
CREATE INDEX "performance_indicator_values_indicator_id_idx" ON "performance_indicator_values" USING btree ("indicator_id");--> statement-breakpoint
CREATE INDEX "contracts_theme_id_idx" ON "contracts" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "contracts_cig_idx" ON "contracts" USING btree ("cig");--> statement-breakpoint
CREATE INDEX "contracts_cup_idx" ON "contracts" USING btree ("cup");--> statement-breakpoint
CREATE INDEX "contracts_status_idx" ON "contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contracts_award_date_idx" ON "contracts" USING btree ("award_date");--> statement-breakpoint
CREATE INDEX "contracts_macrotema_idx" ON "contracts" USING btree ("macrotema");--> statement-breakpoint
CREATE INDEX "acts_theme_id_idx" ON "acts" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_category_idx" ON "reports" USING btree ("category");--> statement-breakpoint
CREATE INDEX "reports_created_at_idx" ON "reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "monitoring_reports_status_idx" ON "monitoring_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "monitoring_reports_contract_id_idx" ON "monitoring_reports" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "monitoring_reports_pnrr_project_id_idx" ON "monitoring_reports" USING btree ("pnrr_project_id");--> statement-breakpoint
CREATE INDEX "monitoring_reports_created_at_idx" ON "monitoring_reports" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "shares_theme_id_idx" ON "shares" USING btree ("theme_id");--> statement-breakpoint
CREATE UNIQUE INDEX "shares_theme_channel_dedupe_unique" ON "shares" USING btree ("theme_id","channel","dedupe_key");--> statement-breakpoint
CREATE INDEX "theme_relevance_events_theme_id_idx" ON "theme_relevance_events" USING btree ("theme_id");--> statement-breakpoint
CREATE UNIQUE INDEX "theme_relevance_events_theme_dedupe_unique" ON "theme_relevance_events" USING btree ("theme_id","dedupe_key");--> statement-breakpoint
CREATE INDEX "publications_category_idx" ON "publications" USING btree ("category");--> statement-breakpoint
CREATE INDEX "publications_is_pnrr_idx" ON "publications" USING btree ("is_pnrr");--> statement-breakpoint
CREATE INDEX "publications_data_atto_idx" ON "publications" USING btree ("data_atto");--> statement-breakpoint
CREATE INDEX "publications_pub_start_idx" ON "publications" USING btree ("pub_start");--> statement-breakpoint
CREATE INDEX "publications_last_seen_at_idx" ON "publications" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "attuazione_pnrr_projects_cup_idx" ON "attuazione_pnrr_projects" USING btree ("cup");--> statement-breakpoint
CREATE INDEX "attuazione_pnrr_projects_status_idx" ON "attuazione_pnrr_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "attuazione_pnrr_projects_published_at_idx" ON "attuazione_pnrr_projects" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "attuazione_pnrr_projects_last_seen_at_idx" ON "attuazione_pnrr_projects" USING btree ("last_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "theme_followers_theme_email_unique" ON "theme_followers" USING btree ("theme_id","email");--> statement-breakpoint
CREATE INDEX "theme_followers_email_idx" ON "theme_followers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "session_interventions_report_id_idx" ON "session_interventions" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "session_reports_seduta_id_idx" ON "session_reports" USING btree ("seduta_id");--> statement-breakpoint
CREATE INDEX "official_activities_official_id_idx" ON "official_activities" USING btree ("official_id");--> statement-breakpoint
CREATE INDEX "official_declarations_official_id_idx" ON "official_declarations" USING btree ("official_id");--> statement-breakpoint
CREATE INDEX "official_remunerations_official_id_idx" ON "official_remunerations" USING btree ("official_id");--> statement-breakpoint
CREATE INDEX "official_votes_publication_id_idx" ON "official_votes" USING btree ("publication_id");--> statement-breakpoint
CREATE INDEX "official_votes_seduta_id_idx" ON "official_votes" USING btree ("seduta_id");--> statement-breakpoint
CREATE INDEX "officials_status_idx" ON "officials" USING btree ("status");--> statement-breakpoint
CREATE INDEX "officials_role_idx" ON "officials" USING btree ("role");--> statement-breakpoint
CREATE INDEX "organi_members_official_id_idx" ON "organi_members" USING btree ("official_id");--> statement-breakpoint
CREATE INDEX "sedute_organo_id_idx" ON "sedute" USING btree ("organo_id");--> statement-breakpoint
CREATE INDEX "sedute_date_idx" ON "sedute" USING btree ("date");--> statement-breakpoint
CREATE INDEX "fundamental_acts_sort_order_idx" ON "fundamental_acts" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "legality_requirements_area_id_idx" ON "legality_requirements" USING btree ("area_id");--> statement-breakpoint
CREATE INDEX "bandi_status_idx" ON "bandi" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bandi_source_idx" ON "bandi" USING btree ("source");--> statement-breakpoint
CREATE INDEX "bandi_settore_idx" ON "bandi" USING btree ("settore");--> statement-breakpoint
CREATE INDEX "bando_matches_bando_id_idx" ON "bando_matches" USING btree ("bando_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bando_matches_unique_publication" ON "bando_matches" USING btree ("bando_id","publication_id") WHERE "bando_matches"."publication_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "bando_matches_unique_contract" ON "bando_matches" USING btree ("bando_id","contract_id") WHERE "bando_matches"."contract_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "bando_matches_unique_pnrr" ON "bando_matches" USING btree ("bando_id","pnrr_project_id") WHERE "bando_matches"."pnrr_project_id" is not null;--> statement-breakpoint
CREATE INDEX "confiscated_assets_status_idx" ON "confiscated_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "confiscated_assets_source_idx" ON "confiscated_assets" USING btree ("source");--> statement-breakpoint
CREATE INDEX "confiscated_assets_tipologia_idx" ON "confiscated_assets" USING btree ("tipologia");--> statement-breakpoint
CREATE INDEX "accesso_civico_stato_idx" ON "accesso_civico_requests" USING btree ("stato");--> statement-breakpoint
CREATE INDEX "accesso_civico_status_idx" ON "accesso_civico_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "accesso_civico_tipo_idx" ON "accesso_civico_requests" USING btree ("tipo");--> statement-breakpoint
CREATE INDEX "accesso_civico_theme_id_idx" ON "accesso_civico_requests" USING btree ("theme_id");