-- #1096: align the physical brief override flag with the existing Drizzle model.
-- Run through the transactional migrator. Never classify an existing brief as
-- automatic merely because a legacy nullable flag has no value.
SET LOCAL lock_timeout = '3s';
--> statement-breakpoint
LOCK TABLE public.publications IN ACCESS EXCLUSIVE MODE;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.publications
    WHERE brief_manual IS NULL AND brief IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'brief_manual convergence requires review: existing briefs have unknown override status';
  END IF;
END $$;
--> statement-breakpoint
UPDATE public.publications
SET brief_manual = false
WHERE brief_manual IS NULL AND brief IS NULL;
--> statement-breakpoint
ALTER TABLE public.publications ALTER COLUMN brief_manual SET DEFAULT false;
--> statement-breakpoint
ALTER TABLE public.publications ALTER COLUMN brief_manual SET NOT NULL;
