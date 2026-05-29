import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const themeEmailsTable = pgTable("theme_emails", {
  id: serial("id").primaryKey(),
  themeId: integer("theme_id")
    .notNull()
    .references(() => themesTable.id),
  subject: text("subject").notNull(),
  sender: text("sender").notNull(),
  recipient: text("recipient").notNull(),
  direction: text("direction").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
  body: text("body").notNull(),
});

export type ThemeEmail = typeof themeEmailsTable.$inferSelect;
export type InsertThemeEmail = typeof themeEmailsTable.$inferInsert;
