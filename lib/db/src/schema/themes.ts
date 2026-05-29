import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { categoriesTable } from "./categories";

export const themesTable = pgTable("themes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  status: text("status").notNull().default("aperto"),
  relevanceCount: integer("relevance_count").notNull().default(0),
  shareCount: integer("share_count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Theme = typeof themesTable.$inferSelect;
export type InsertTheme = typeof themesTable.$inferInsert;
