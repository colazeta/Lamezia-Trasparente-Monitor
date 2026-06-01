import {
  pgTable,
  serial,
  text,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const REPORT_STATUSES = [
  "ricevuta",
  "in_valutazione",
  "presa_in_carico",
  "archiviata",
] as const;
export type ReportStatusValue = (typeof REPORT_STATUSES)[number];

export const reportsTable = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    location: text("location").notNull(),
    status: text("status").notNull().default("ricevuta"),
    citizenName: text("citizen_name"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statusIdx: index("reports_status_idx").on(t.status),
    categoryIdx: index("reports_category_idx").on(t.category),
    createdAtIdx: index("reports_created_at_idx").on(t.createdAt),
    statusCheck: check(
      "reports_status_check",
      sql`${t.status} in ('ricevuta', 'in_valutazione', 'presa_in_carico', 'archiviata')`,
    ),
  }),
);

export type Report = typeof reportsTable.$inferSelect;
export type InsertReport = typeof reportsTable.$inferInsert;
