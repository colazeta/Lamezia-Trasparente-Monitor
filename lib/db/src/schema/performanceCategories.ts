import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

// Categorie della sezione "Performance del Comune": raggruppano gli indicatori
// di qualità della vita. Coprono le sei dimensioni dell'indice Qualità della
// Vita del Sole 24 Ore più alcune dimensioni aggiuntive riconosciute
// (mobilità sostenibile, istruzione, ambiente urbano). Sono distinte dalle
// `categories` dei temi, che hanno tutt'altra finalità.
export const performanceCategoriesTable = pgTable("performance_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  position: integer("position").notNull().default(0),
});

export type PerformanceCategory =
  typeof performanceCategoriesTable.$inferSelect;
export type InsertPerformanceCategory =
  typeof performanceCategoriesTable.$inferInsert;
