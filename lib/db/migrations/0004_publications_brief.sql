-- Albo Pretorio: add AI brief columns to publications
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "brief" text;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "brief_manual" boolean;
ALTER TABLE "publications" ADD COLUMN IF NOT EXISTS "brief_generated_at" timestamp with time zone;
