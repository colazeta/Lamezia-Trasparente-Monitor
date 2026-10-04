CREATE TABLE "taxonomy_classifications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_record_id" uuid NOT NULL,
	"scheme_key" text NOT NULL,
	"version" text NOT NULL,
	"facet" text NOT NULL,
	"concept_code" text,
	"status" text NOT NULL,
	"method" text NOT NULL,
	"evidence_assertion_id" uuid NOT NULL,
	CONSTRAINT "taxonomy_classifications_record_facet_method_uq" UNIQUE("source_record_id","scheme_key","version","facet","method"),
	CONSTRAINT "taxonomy_classifications_uuidv7" CHECK ("taxonomy_classifications"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "taxonomy_classifications_state" CHECK (("taxonomy_classifications"."status" = 'classified' AND "taxonomy_classifications"."concept_code" IS NOT NULL) OR ("taxonomy_classifications"."status" IN ('unknown','not_applicable','insufficient_evidence','review_required') AND "taxonomy_classifications"."concept_code" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "taxonomy_concepts" (
	"scheme_key" text NOT NULL,
	"version" text NOT NULL,
	"code" text NOT NULL,
	"facet" text NOT NULL,
	CONSTRAINT "taxonomy_concepts_scheme_key_version_code_pk" PRIMARY KEY("scheme_key","version","code"),
	CONSTRAINT "taxonomy_concepts_facet_uq" UNIQUE("scheme_key","version","code","facet")
);
--> statement-breakpoint
CREATE TABLE "taxonomy_schemes" (
	"scheme_key" text NOT NULL,
	"version" text NOT NULL,
	"definition_hash" text NOT NULL,
	CONSTRAINT "taxonomy_schemes_scheme_key_version_pk" PRIMARY KEY("scheme_key","version"),
	CONSTRAINT "taxonomy_schemes_hash" CHECK ("taxonomy_schemes"."definition_hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "document_acts" (
	"subject_kind" text DEFAULT 'entity' NOT NULL,
	"domain_type" text DEFAULT 'document.act' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"issuer_key" text NOT NULL,
	"office" text NOT NULL,
	"act_type" text NOT NULL,
	"act_number" text NOT NULL,
	"act_date" date NOT NULL,
	CONSTRAINT "document_acts_qualified_identity_uq" UNIQUE("issuer_key","office","act_type","act_number","act_date"),
	CONSTRAINT "document_act_typed_kind" CHECK ("document_acts"."subject_kind" = 'entity' AND "document_acts"."domain_type" = 'document.act'),
	CONSTRAINT "document_acts_identity_nonempty" CHECK (btrim("document_acts"."issuer_key") <> '' AND btrim("document_acts"."office") <> '' AND btrim("document_acts"."act_type") <> '' AND btrim("document_acts"."act_number") <> '')
);
--> statement-breakpoint
CREATE TABLE "document_documents" (
	"subject_kind" text DEFAULT 'entity' NOT NULL,
	"domain_type" text DEFAULT 'document.document' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"source_url" text NOT NULL,
	CONSTRAINT "document_documents_source_url_unique" UNIQUE("source_url"),
	CONSTRAINT "document_document_typed_kind" CHECK ("document_documents"."subject_kind" = 'entity' AND "document_documents"."domain_type" = 'document.document'),
	CONSTRAINT "document_documents_source_origin" CHECK ("document_documents"."source_url" ~ '^https://albo[.]tinnvision[.]cloud/')
);
--> statement-breakpoint
CREATE TABLE "document_publication_acts" (
	"source_record_id" uuid PRIMARY KEY NOT NULL,
	"act_id" uuid NOT NULL,
	"evidence_assertion_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_publication_documents" (
	"source_record_id" uuid NOT NULL,
	"document_id" uuid NOT NULL,
	"evidence_assertion_id" uuid NOT NULL,
	"role" text NOT NULL,
	CONSTRAINT "document_publication_documents_record_document_uq" UNIQUE("source_record_id","document_id"),
	CONSTRAINT "document_publication_documents_role" CHECK ("document_publication_documents"."role" IN ('main','attachment'))
);
--> statement-breakpoint
CREATE TABLE "document_publication_versions" (
	"source_record_id" uuid PRIMARY KEY NOT NULL,
	"publication_id" uuid,
	"source_url" text NOT NULL,
	"title" text,
	"publication_start" date,
	"publication_end" date,
	"public_visibility" text NOT NULL,
	"policy_version" text,
	"resolver_version" text NOT NULL,
	CONSTRAINT "document_versions_visibility" CHECK ("document_publication_versions"."public_visibility" IN ('publishable','metadata_only','do_not_publish')),
	CONSTRAINT "document_versions_private_title" CHECK ("document_publication_versions"."public_visibility" = 'publishable' OR "document_publication_versions"."title" IS NULL),
	CONSTRAINT "document_versions_dates" CHECK ("document_publication_versions"."publication_end" IS NULL OR "document_publication_versions"."publication_start" IS NULL OR "document_publication_versions"."publication_end" >= "document_publication_versions"."publication_start")
);
--> statement-breakpoint
CREATE TABLE "document_publications" (
	"subject_kind" text DEFAULT 'event' NOT NULL,
	"domain_type" text DEFAULT 'document.publication' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"register_key" text NOT NULL,
	"publication_number" text NOT NULL,
	CONSTRAINT "document_publications_register_number_uq" UNIQUE("register_key","publication_number"),
	CONSTRAINT "document_publication_typed_kind" CHECK ("document_publications"."subject_kind" = 'event' AND "document_publications"."domain_type" = 'document.publication'),
	CONSTRAINT "document_publications_number" CHECK ("document_publications"."publication_number" ~ '^[0-9]{4}/[0-9]+$'),
	CONSTRAINT "document_publications_register" CHECK ("document_publications"."register_key" = 'it.00301390795.albo')
);
--> statement-breakpoint
CREATE TABLE "procurement_contracts" (
	"subject_kind" text DEFAULT 'entity' NOT NULL,
	"domain_type" text DEFAULT 'procurement.contract' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"lot_id" uuid NOT NULL,
	"source_identifier" text NOT NULL,
	"signed_on" date,
	"evidence_assertion_id" uuid NOT NULL,
	CONSTRAINT "procurement_contracts_lot_identifier_uq" UNIQUE("lot_id","source_identifier"),
	CONSTRAINT "procurement_contract_typed_kind" CHECK ("procurement_contracts"."subject_kind" = 'entity' AND "procurement_contracts"."domain_type" = 'procurement.contract'),
	CONSTRAINT "procurement_contracts_identifier_nonempty" CHECK (btrim("procurement_contracts"."source_identifier") <> '')
);
--> statement-breakpoint
CREATE TABLE "procurement_financial_events" (
	"subject_kind" text DEFAULT 'event' NOT NULL,
	"domain_type" text DEFAULT 'procurement.financial_event' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"contract_id" uuid NOT NULL,
	"event_kind" text NOT NULL,
	"amount" numeric(18, 2) NOT NULL,
	"currency" text NOT NULL,
	"occurred_on" date,
	"evidence_assertion_id" uuid NOT NULL,
	CONSTRAINT "procurement_financial_event_typed_kind" CHECK ("procurement_financial_events"."subject_kind" = 'event' AND "procurement_financial_events"."domain_type" = 'procurement.financial_event'),
	CONSTRAINT "procurement_financial_events_amount_sign" CHECK (("procurement_financial_events"."event_kind" = 'reversal' AND "procurement_financial_events"."amount" <= 0) OR ("procurement_financial_events"."event_kind" <> 'reversal' AND "procurement_financial_events"."amount" >= 0)),
	CONSTRAINT "procurement_financial_events_kind" CHECK ("procurement_financial_events"."event_kind" IN ('commitment','liquidation','payment','reversal')),
	CONSTRAINT "procurement_financial_events_currency" CHECK ("procurement_financial_events"."currency" ~ '^[A-Z]{3}$')
);
--> statement-breakpoint
CREATE TABLE "procurement_lots" (
	"subject_kind" text DEFAULT 'entity' NOT NULL,
	"domain_type" text DEFAULT 'procurement.lot' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"procedure_id" uuid NOT NULL,
	"lot_number" text NOT NULL,
	"cig" text,
	"evidence_assertion_id" uuid NOT NULL,
	CONSTRAINT "procurement_lots_cig_unique" UNIQUE("cig"),
	CONSTRAINT "procurement_lots_procedure_number_uq" UNIQUE("procedure_id","lot_number"),
	CONSTRAINT "procurement_lot_typed_kind" CHECK ("procurement_lots"."subject_kind" = 'entity' AND "procurement_lots"."domain_type" = 'procurement.lot'),
	CONSTRAINT "procurement_lots_number_nonempty" CHECK (btrim("procurement_lots"."lot_number") <> ''),
	CONSTRAINT "procurement_lots_cig" CHECK ("procurement_lots"."cig" IS NULL OR "procurement_lots"."cig" ~ '^([0-9]{7}[A-F0-9]{3}|[A-UXYZ][A-F0-9]{9})$')
);
--> statement-breakpoint
CREATE TABLE "procurement_mentions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source_record_id" uuid NOT NULL,
	"candidate_key" text NOT NULL,
	"cig" text,
	"relevance" text NOT NULL,
	"phase" text NOT NULL,
	"evidence_assertion_id" uuid NOT NULL,
	CONSTRAINT "procurement_mentions_record_candidate_uq" UNIQUE("source_record_id","candidate_key"),
	CONSTRAINT "procurement_mentions_uuidv7" CHECK ("procurement_mentions"."id"::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'),
	CONSTRAINT "procurement_mentions_phase" CHECK ("procurement_mentions"."phase" IN ('programmazione','gara','affidamento','esecuzione','pagamento','conclusione','unknown','not_applicable')),
	CONSTRAINT "procurement_mentions_relevance" CHECK ("procurement_mentions"."relevance" IN ('possible','confirmed'))
);
--> statement-breakpoint
CREATE TABLE "procurement_procedures" (
	"subject_kind" text DEFAULT 'entity' NOT NULL,
	"domain_type" text DEFAULT 'procurement.procedure' NOT NULL,
	"id" uuid PRIMARY KEY NOT NULL,
	"authority_key" text NOT NULL,
	"source_identifier" text NOT NULL,
	"evidence_assertion_id" uuid NOT NULL,
	CONSTRAINT "procurement_procedures_qualified_identity_uq" UNIQUE("authority_key","source_identifier"),
	CONSTRAINT "procurement_procedure_typed_kind" CHECK ("procurement_procedures"."subject_kind" = 'entity' AND "procurement_procedures"."domain_type" = 'procurement.procedure'),
	CONSTRAINT "procurement_procedures_identity_nonempty" CHECK (btrim("procurement_procedures"."authority_key") <> '' AND btrim("procurement_procedures"."source_identifier") <> '')
);
--> statement-breakpoint
ALTER TABLE "taxonomy_classifications" ADD CONSTRAINT "taxonomy_classifications_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_classifications" ADD CONSTRAINT "taxonomy_classifications_scheme_fk" FOREIGN KEY ("scheme_key","version") REFERENCES "public"."taxonomy_schemes"("scheme_key","version") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_classifications" ADD CONSTRAINT "taxonomy_classifications_concept_fk" FOREIGN KEY ("scheme_key","version","concept_code","facet") REFERENCES "public"."taxonomy_concepts"("scheme_key","version","code","facet") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_classifications" ADD CONSTRAINT "taxonomy_classifications_evidence_fk" FOREIGN KEY ("evidence_assertion_id","source_record_id") REFERENCES "public"."core_assertions"("id","source_record_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxonomy_concepts" ADD CONSTRAINT "taxonomy_concepts_scheme_fk" FOREIGN KEY ("scheme_key","version") REFERENCES "public"."taxonomy_schemes"("scheme_key","version") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_acts" ADD CONSTRAINT "document_acts_id_canonical_subjects_subject_id_fk" FOREIGN KEY ("id") REFERENCES "public"."canonical_subjects"("subject_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_acts" ADD CONSTRAINT "document_act_typed_subject_fk" FOREIGN KEY ("id","subject_kind","domain_type") REFERENCES "public"."canonical_subjects"("subject_id","subject_kind","domain_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_documents" ADD CONSTRAINT "document_documents_id_canonical_subjects_subject_id_fk" FOREIGN KEY ("id") REFERENCES "public"."canonical_subjects"("subject_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_documents" ADD CONSTRAINT "document_document_typed_subject_fk" FOREIGN KEY ("id","subject_kind","domain_type") REFERENCES "public"."canonical_subjects"("subject_id","subject_kind","domain_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_publication_acts" ADD CONSTRAINT "document_publication_acts_source_record_id_document_publication_versions_source_record_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."document_publication_versions"("source_record_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_publication_acts" ADD CONSTRAINT "document_publication_acts_act_id_document_acts_id_fk" FOREIGN KEY ("act_id") REFERENCES "public"."document_acts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_publication_acts" ADD CONSTRAINT "document_publication_acts_evidence_fk" FOREIGN KEY ("evidence_assertion_id","source_record_id") REFERENCES "public"."core_assertions"("id","source_record_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_publication_documents" ADD CONSTRAINT "document_publication_documents_source_record_id_document_publication_versions_source_record_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."document_publication_versions"("source_record_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_publication_documents" ADD CONSTRAINT "document_publication_documents_document_id_document_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document_documents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_publication_documents" ADD CONSTRAINT "document_publication_documents_evidence_fk" FOREIGN KEY ("evidence_assertion_id","source_record_id") REFERENCES "public"."core_assertions"("id","source_record_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_publication_versions" ADD CONSTRAINT "document_publication_versions_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_publication_versions" ADD CONSTRAINT "document_publication_versions_publication_id_document_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."document_publications"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_publications" ADD CONSTRAINT "document_publications_id_canonical_subjects_subject_id_fk" FOREIGN KEY ("id") REFERENCES "public"."canonical_subjects"("subject_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_publications" ADD CONSTRAINT "document_publication_typed_subject_fk" FOREIGN KEY ("id","subject_kind","domain_type") REFERENCES "public"."canonical_subjects"("subject_id","subject_kind","domain_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_contracts" ADD CONSTRAINT "procurement_contracts_id_canonical_subjects_subject_id_fk" FOREIGN KEY ("id") REFERENCES "public"."canonical_subjects"("subject_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_contracts" ADD CONSTRAINT "procurement_contracts_lot_id_procurement_lots_id_fk" FOREIGN KEY ("lot_id") REFERENCES "public"."procurement_lots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_contracts" ADD CONSTRAINT "procurement_contracts_evidence_assertion_id_core_assertions_id_fk" FOREIGN KEY ("evidence_assertion_id") REFERENCES "public"."core_assertions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_contracts" ADD CONSTRAINT "procurement_contract_typed_subject_fk" FOREIGN KEY ("id","subject_kind","domain_type") REFERENCES "public"."canonical_subjects"("subject_id","subject_kind","domain_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_financial_events" ADD CONSTRAINT "procurement_financial_events_id_canonical_subjects_subject_id_fk" FOREIGN KEY ("id") REFERENCES "public"."canonical_subjects"("subject_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_financial_events" ADD CONSTRAINT "procurement_financial_events_contract_id_procurement_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."procurement_contracts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_financial_events" ADD CONSTRAINT "procurement_financial_events_evidence_assertion_id_core_assertions_id_fk" FOREIGN KEY ("evidence_assertion_id") REFERENCES "public"."core_assertions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_financial_events" ADD CONSTRAINT "procurement_financial_event_typed_subject_fk" FOREIGN KEY ("id","subject_kind","domain_type") REFERENCES "public"."canonical_subjects"("subject_id","subject_kind","domain_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_lots" ADD CONSTRAINT "procurement_lots_id_canonical_subjects_subject_id_fk" FOREIGN KEY ("id") REFERENCES "public"."canonical_subjects"("subject_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_lots" ADD CONSTRAINT "procurement_lots_procedure_id_procurement_procedures_id_fk" FOREIGN KEY ("procedure_id") REFERENCES "public"."procurement_procedures"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_lots" ADD CONSTRAINT "procurement_lots_evidence_assertion_id_core_assertions_id_fk" FOREIGN KEY ("evidence_assertion_id") REFERENCES "public"."core_assertions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_lots" ADD CONSTRAINT "procurement_lot_typed_subject_fk" FOREIGN KEY ("id","subject_kind","domain_type") REFERENCES "public"."canonical_subjects"("subject_id","subject_kind","domain_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_mentions" ADD CONSTRAINT "procurement_mentions_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_mentions" ADD CONSTRAINT "procurement_mentions_evidence_fk" FOREIGN KEY ("evidence_assertion_id","source_record_id") REFERENCES "public"."core_assertions"("id","source_record_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_procedures" ADD CONSTRAINT "procurement_procedures_id_canonical_subjects_subject_id_fk" FOREIGN KEY ("id") REFERENCES "public"."canonical_subjects"("subject_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_procedures" ADD CONSTRAINT "procurement_procedures_evidence_assertion_id_core_assertions_id_fk" FOREIGN KEY ("evidence_assertion_id") REFERENCES "public"."core_assertions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procurement_procedures" ADD CONSTRAINT "procurement_procedure_typed_subject_fk" FOREIGN KEY ("id","subject_kind","domain_type") REFERENCES "public"."canonical_subjects"("subject_id","subject_kind","domain_type") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "document_publication_versions_publication_idx" ON "document_publication_versions" USING btree ("publication_id");