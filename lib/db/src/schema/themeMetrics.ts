import { pgTable, serial, text, integer, index } from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const themeMetricsTable = pgTable(
  "theme_metrics",
  {
    id: serial("id").primaryKey(),
    themeId: integer("theme_id")
      .notNull()
      .references(() => themesTable.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    unit: text("unit").notNull(),
  },
  (t) => ({
    themeIdIdx: index("theme_metrics_theme_id_idx").on(t.themeId),
  }),
);

export type ThemeMetric = typeof themeMetricsTable.$inferSelect;
export type InsertThemeMetric = typeof themeMetricsTable.$inferInsert;
