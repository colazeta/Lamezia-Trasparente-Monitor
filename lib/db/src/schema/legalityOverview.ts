import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";

// Giudizio complessivo dell'intera sezione "Monitoraggio Legalità e
// Trasparenza", scritto dalla Redazione. È una singola riga (id = 1): la
// sezione ha un unico giudizio di sintesi a livello generale.
export const legalityOverviewTable = pgTable("legality_overview", {
  id: integer("id").primaryKey().default(1),
  overallJudgment: text("overall_judgment").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type LegalityOverview = typeof legalityOverviewTable.$inferSelect;
export type InsertLegalityOverview = typeof legalityOverviewTable.$inferInsert;
