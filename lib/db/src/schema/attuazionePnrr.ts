import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export type PnrrAttachment = {
  title: string;
  url: string;
};

export const attuazionePnrrProjectsTable = pgTable(
  "attuazione_pnrr_projects",
  {
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
    importoFinanziato: numeric("importo_finanziato", {
      precision: 14,
      scale: 2,
    }),
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
  },
  (t) => ({
    cupIdx: index("attuazione_pnrr_projects_cup_idx").on(t.cup),
    statusIdx: index("attuazione_pnrr_projects_status_idx").on(t.status),
    publishedAtIdx: index("attuazione_pnrr_projects_published_at_idx").on(
      t.publishedAt,
    ),
    lastSeenAtIdx: index("attuazione_pnrr_projects_last_seen_at_idx").on(
      t.lastSeenAt,
    ),
  }),
);

export type AttuazionePnrrProject =
  typeof attuazionePnrrProjectsTable.$inferSelect;
export type InsertAttuazionePnrrProject =
  typeof attuazionePnrrProjectsTable.$inferInsert;
