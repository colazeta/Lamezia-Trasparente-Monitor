-- Publications: add persisted macrotema + manual override flag
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "macrotema" text;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "macrotema_manual" boolean DEFAULT false NOT NULL;
