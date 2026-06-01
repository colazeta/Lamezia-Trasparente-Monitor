import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { publicationsTable } from "./publications";
import { seduteTable } from "./sedute";

export const sessionReportsTable = pgTable(
  "session_reports",
  {
    id: serial("id").primaryKey(),
    publicationId: integer("publication_id")
      .notNull()
      .unique()
      .references(() => publicationsTable.id, { onDelete: "cascade" }),
    sedutaId: integer("seduta_id").references(() => seduteTable.id, {
      onDelete: "set null",
    }),
    summary: text("summary"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sedutaIdIdx: index("session_reports_seduta_id_idx").on(t.sedutaId),
  }),
);

export const sessionInterventionsTable = pgTable(
  "session_interventions",
  {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
      .notNull()
      .references(() => sessionReportsTable.id, { onDelete: "cascade" }),
    speakerName: text("speaker_name").notNull(),
    speakerRole: text("speaker_role"),
    content: text("content").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => ({
    reportIdIdx: index("session_interventions_report_id_idx").on(t.reportId),
  }),
);

export type SessionReport = typeof sessionReportsTable.$inferSelect;
export type InsertSessionReport = typeof sessionReportsTable.$inferInsert;
export type SessionIntervention = typeof sessionInterventionsTable.$inferSelect;
export type InsertSessionIntervention =
  typeof sessionInterventionsTable.$inferInsert;
