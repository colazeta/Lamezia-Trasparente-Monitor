import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export type PnrrAttachment = {
  title: string;
  url: string;
};

export const attuazionePnrrProjectsTable = pgTable("attuazione_pnrr_projects", {
  id: serial("id").primaryKey(),
  sourceId: text("source_id").notNull().unique(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  mission: text("mission"),
  component: text("component"),
  investment: text("investment"),
  intervention: text("intervention"),
  holder: text("holder"),
  attuatore: text("attuatore"),
  cup: text("cup"),
  importoFinanziato: text("importo_finanziato"),
  status: text("status"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  attachments: jsonb("attachments")
    .$type<PnrrAttachment[]>()
    .notNull()
    .default([]),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AttuazionePnrrProject =
  typeof attuazionePnrrProjectsTable.$inferSelect;
export type InsertAttuazionePnrrProject =
  typeof attuazionePnrrProjectsTable.$inferInsert;
