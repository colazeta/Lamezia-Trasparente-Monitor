-- Accesso Civico: aggiungi origine, deduplica_key e fonte_url per supportare
-- l'importazione dello storico del Registro accessi del Comune.
ALTER TABLE "accesso_civico_requests" ADD COLUMN IF NOT EXISTS "origine" text NOT NULL DEFAULT 'cittadino';--> statement-breakpoint
ALTER TABLE "accesso_civico_requests" ADD COLUMN IF NOT EXISTS "deduplica_key" text;--> statement-breakpoint
ALTER TABLE "accesso_civico_requests" ADD COLUMN IF NOT EXISTS "fonte_url" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accesso_civico_origine_idx" ON "accesso_civico_requests" USING btree ("origine");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "accesso_civico_deduplica_key_idx" ON "accesso_civico_requests" ("deduplica_key") WHERE "deduplica_key" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "accesso_civico_requests" ADD CONSTRAINT "accesso_civico_origine_check" CHECK ("accesso_civico_requests"."origine" in ('cittadino', 'registro-ufficiale'));
