import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { categoriesTable } from "./categories";

export const THEME_STATUSES = [
  "aperto",
  "in_corso",
  "monitoraggio",
  "chiuso",
] as const;
export type ThemeStatusValue = (typeof THEME_STATUSES)[number];

export const themesTable = pgTable(
  "themes",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    summary: text("summary").notNull(),
    description: text("description").notNull(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categoriesTable.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("aperto"),
    relevanceCount: integer("relevance_count").notNull().default(0),
    shareCount: integer("share_count").notNull().default(0),
    followerCount: integer("follower_count").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    categoryIdIdx: index("themes_category_id_idx").on(t.categoryId),
    statusIdx: index("themes_status_idx").on(t.status),
    statusCheck: check(
      "themes_status_check",
      sql`${t.status} in ('aperto', 'in_corso', 'monitoraggio', 'chiuso')`,
    ),
  }),
);

export type Theme = typeof themesTable.$inferSelect;
export type InsertTheme = typeof themesTable.$inferInsert;
