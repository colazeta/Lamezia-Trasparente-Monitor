-- Compatibility convergence for two legacy application tables that were present
-- in the Drizzle schema (and may already exist on databases historically
-- bootstrapped with `drizzle-kit push`) but were absent from the versioned
-- migration chain. Additive and idempotent: fresh databases create the exact
-- current schema; legacy databases with the tables already present are left
-- untouched.

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" serial PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "conversation_id" integer NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "messages_conversation_id_conversations_id_fk"
    FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id")
    ON DELETE cascade
);
