ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "initial_source_type" text;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "initial_source_url" text;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "public_emergence_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "involved_sector" text;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "competent_office" text;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "formal_act" text;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "institutional_response" text;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "institutional_response_date" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "available_data" text;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "missing_data" text;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "foia_link" text;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "outcome" text DEFAULT 'aperta' NOT NULL;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "verification_status" text DEFAULT 'non_verificata' NOT NULL;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "interpretive_caution" text DEFAULT 'Scheda da leggere come tracciamento civico: la presenza nel registro non indica responsabilità o irregolarità accertate.' NOT NULL;
--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reports" ADD CONSTRAINT "reports_outcome_check" CHECK ("outcome" in ('aperta', 'risolta', 'parzialmente_risolta', 'non_risolta', 'non_verificabile', 'archiviata'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "reports" ADD CONSTRAINT "reports_verification_status_check" CHECK ("verification_status" in ('non_verificata', 'in_verifica', 'documentata', 'risposta_ricevuta', 'chiusa', 'archiviata', 'da_aggiornare'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_competent_office_idx" ON "reports" USING btree ("competent_office");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_outcome_idx" ON "reports" USING btree ("outcome");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reports_verification_status_idx" ON "reports" USING btree ("verification_status");
