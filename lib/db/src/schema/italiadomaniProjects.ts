import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const italiadomaniProjectsTable = pgTable(
  "italiadomani_projects",
  {
    id: serial("id").primaryKey(),
    cup: text("cup").notNull().unique(),
    clp: text("clp"),
    title: text("title").notNull(),
    mission: text("mission"),
    component: text("component"),
    investment: text("investment"),
    holder: text("holder"),
    attuatore: text("attuatore"),
    importoFinanziato: numeric("importo_finanziato", {
      precision: 16,
      scale: 2,
    }),
    status: text("status"),
    startDate: timestamp("start_date", { withTimezone: true }),
    endDate: timestamp("end_date", { withTimezone: true }),
    italiadomaniUpdatedAt: timestamp("italiadomani_updated_at", {
      withTimezone: true,
    }),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    cupIdx: index("italiadomani_projects_cup_idx").on(t.cup),
    statusIdx: index("italiadomani_projects_status_idx").on(t.status),
    lastSeenAtIdx: index("italiadomani_projects_last_seen_at_idx").on(
      t.lastSeenAt,
    ),
  }),
);

export type ItaliadomaniProject =
  typeof italiadomaniProjectsTable.$inferSelect;
export type InsertItaliadomaniProject =
  typeof italiadomaniProjectsTable.$inferInsert;
