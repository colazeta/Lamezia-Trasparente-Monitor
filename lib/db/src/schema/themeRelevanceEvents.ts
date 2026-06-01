import {
  pgTable,
  serial,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const themeRelevanceEventsTable = pgTable(
  "theme_relevance_events",
  {
    id: serial("id").primaryKey(),
    themeId: integer("theme_id")
      .notNull()
      .references(() => themesTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    themeIdIdx: index("theme_relevance_events_theme_id_idx").on(t.themeId),
  }),
);

export type ThemeRelevanceEvent = typeof themeRelevanceEventsTable.$inferSelect;
export type InsertThemeRelevanceEvent =
  typeof themeRelevanceEventsTable.$inferInsert;
