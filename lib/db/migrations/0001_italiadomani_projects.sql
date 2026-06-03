CREATE TABLE "italiadomani_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"cup" text NOT NULL,
	"clp" text,
	"title" text NOT NULL,
	"mission" text,
	"component" text,
	"investment" text,
	"holder" text,
	"attuatore" text,
	"importo_finanziato" numeric(16, 2),
	"status" text,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"italiadomani_updated_at" timestamp with time zone,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "italiadomani_projects_cup_unique" UNIQUE("cup")
);
--> statement-breakpoint
CREATE INDEX "italiadomani_projects_cup_idx" ON "italiadomani_projects" USING btree ("cup");
--> statement-breakpoint
CREATE INDEX "italiadomani_projects_status_idx" ON "italiadomani_projects" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "italiadomani_projects_last_seen_at_idx" ON "italiadomani_projects" USING btree ("last_seen_at");
