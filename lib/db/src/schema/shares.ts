import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const sharesTable = pgTable("shares", {
  id: serial("id").primaryKey(),
  themeId: integer("theme_id")
    .notNull()
    .references(() => themesTable.id),
  channel: text("channel").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Share = typeof sharesTable.$inferSelect;
export type InsertShare = typeof sharesTable.$inferInsert;
