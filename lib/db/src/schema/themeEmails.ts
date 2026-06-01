import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const themeEmailsTable = pgTable(
  "theme_emails",
  {
    id: serial("id").primaryKey(),
    themeId: integer("theme_id")
      .notNull()
      .references(() => themesTable.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    sender: text("sender").notNull(),
    recipient: text("recipient").notNull(),
    direction: text("direction").notNull(),
    date: timestamp("date", { withTimezone: true }).notNull().defaultNow(),
    body: text("body").notNull(),
  },
  (t) => ({
    themeIdIdx: index("theme_emails_theme_id_idx").on(t.themeId),
  }),
);

export type ThemeEmail = typeof themeEmailsTable.$inferSelect;
export type InsertThemeEmail = typeof themeEmailsTable.$inferInsert;
