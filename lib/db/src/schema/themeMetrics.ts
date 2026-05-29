import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const themeMetricsTable = pgTable("theme_metrics", {
  id: serial("id").primaryKey(),
  themeId: integer("theme_id")
    .notNull()
    .references(() => themesTable.id),
  label: text("label").notNull(),
  value: text("value").notNull(),
  unit: text("unit").notNull(),
});

export type ThemeMetric = typeof themeMetricsTable.$inferSelect;
export type InsertThemeMetric = typeof themeMetricsTable.$inferInsert;
