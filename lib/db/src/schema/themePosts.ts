import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const themePostsTable = pgTable(
  "theme_posts",
  {
    id: serial("id").primaryKey(),
    themeId: integer("theme_id")
      .notNull()
      .references(() => themesTable.id, { onDelete: "cascade" }),
    title: text("title"),
    body: text("body").notNull(),
    eventDate: timestamp("event_date", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    themeIdIdx: index("theme_posts_theme_id_idx").on(t.themeId),
  }),
);

export type ThemePost = typeof themePostsTable.$inferSelect;
export type InsertThemePost = typeof themePostsTable.$inferInsert;
