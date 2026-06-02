import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

// Aree tematiche della sezione "Monitoraggio Legalità e Trasparenza": ogni area
// raggruppa una serie di requisiti che il Comune dovrebbe soddisfare (es.
// Trasparenza, Partecipazione democratica, Antiriciclaggio, Contrasto alla
// criminalità organizzata). Tutti i contenuti sono inseriti a mano dalla
// Redazione: non esiste alcuna ingestione automatica su questa sezione.
export const legalityAreasTable = pgTable("legality_areas", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  // Giudizio finale dell'area, scritto dalla Redazione.
  finalJudgment: text("final_judgment").notNull().default(""),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type LegalityArea = typeof legalityAreasTable.$inferSelect;
export type InsertLegalityArea = typeof legalityAreasTable.$inferInsert;
