import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const actsTable = pgTable("acts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  number: text("number").notNull(),
  summary: text("summary").notNull(),
  publishDate: timestamp("publish_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull().defaultNow(),
  themeId: integer("theme_id").references(() => themesTable.id),
});

export type Act = typeof actsTable.$inferSelect;
export type InsertAct = typeof actsTable.$inferInsert;
