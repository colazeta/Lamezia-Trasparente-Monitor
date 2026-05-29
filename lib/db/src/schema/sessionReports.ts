import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { publicationsTable } from "./publications";

export const sessionReportsTable = pgTable("session_reports", {
  id: serial("id").primaryKey(),
  publicationId: integer("publication_id")
    .notNull()
    .unique()
    .references(() => publicationsTable.id),
  summary: text("summary"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessionInterventionsTable = pgTable("session_interventions", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id")
    .notNull()
    .references(() => sessionReportsTable.id),
  speakerName: text("speaker_name").notNull(),
  speakerRole: text("speaker_role"),
  content: text("content").notNull(),
  position: integer("position").notNull().default(0),
});

export type SessionReport = typeof sessionReportsTable.$inferSelect;
export type InsertSessionReport = typeof sessionReportsTable.$inferInsert;
export type SessionIntervention = typeof sessionInterventionsTable.$inferSelect;
export type InsertSessionIntervention =
  typeof sessionInterventionsTable.$inferInsert;
