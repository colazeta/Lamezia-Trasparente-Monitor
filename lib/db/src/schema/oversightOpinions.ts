import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const oversightOpinionsTable = pgTable("oversight_opinions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  issuingBody: text("issuing_body").notNull(),
  opinionType: text("opinion_type").notNull(),
  subject: text("subject").notNull(),
  outcome: text("outcome"),
  body: text("body"),
  // Anno di riferimento del parere, distinto dalla data di emissione (es. un
  // parere emesso nel 2026 ma relativo al bilancio 2024). Usato per ordinamento
  // e filtro nella pagina pubblica.
  referenceYear: integer("reference_year"),
  status: text("status").notNull().default("pubblicato"),
  opinionDate: timestamp("opinion_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const oversightOpinionDocumentsTable = pgTable(
  "oversight_opinion_documents",
  {
    id: serial("id").primaryKey(),
    opinionId: integer("opinion_id")
      .notNull()
      .references(() => oversightOpinionsTable.id),
    title: text("title").notNull(),
    type: text("type").notNull(),
    url: text("url"),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  },
);

export type OversightOpinion = typeof oversightOpinionsTable.$inferSelect;
export type InsertOversightOpinion = typeof oversightOpinionsTable.$inferInsert;
export type OversightOpinionDocument =
  typeof oversightOpinionDocumentsTable.$inferSelect;
export type InsertOversightOpinionDocument =
  typeof oversightOpinionDocumentsTable.$inferInsert;
