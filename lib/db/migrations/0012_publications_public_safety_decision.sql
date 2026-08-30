-- Materialised by ingestion; public routes consume the attested decision.
ALTER TABLE "publications" ADD COLUMN "public_safety_decision" jsonb;
