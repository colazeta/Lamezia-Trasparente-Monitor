import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const themeFollowersTable = pgTable(
  "theme_followers",
  {
    id: serial("id").primaryKey(),
    themeId: integer("theme_id")
      .notNull()
      .references(() => themesTable.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    unsubscribeToken: text("unsubscribe_token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueThemeEmail: uniqueIndex("theme_followers_theme_email_unique").on(
      table.themeId,
      table.email,
    ),
    emailIdx: index("theme_followers_email_idx").on(table.email),
  }),
);

export type ThemeFollower = typeof themeFollowersTable.$inferSelect;
export type InsertThemeFollower = typeof themeFollowersTable.$inferInsert;
