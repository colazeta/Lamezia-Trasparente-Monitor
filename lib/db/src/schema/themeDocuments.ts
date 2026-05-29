import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const themeDocumentsTable = pgTable("theme_documents", {
  id: serial("id").primaryKey(),
  themeId: integer("theme_id")
    .notNull()
    .references(() => themesTable.id),
  title: text("title").notNull(),
  type: text("type").notNull(),
  url: text("url"),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
});

export type ThemeDocument = typeof themeDocumentsTable.$inferSelect;
export type InsertThemeDocument = typeof themeDocumentsTable.$inferInsert;
