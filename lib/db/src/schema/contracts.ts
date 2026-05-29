import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  supplier: text("supplier").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  procedureType: text("procedure_type").notNull(),
  status: text("status").notNull(),
  awardDate: timestamp("award_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  themeId: integer("theme_id").references(() => themesTable.id),
});

export type Contract = typeof contractsTable.$inferSelect;
export type InsertContract = typeof contractsTable.$inferInsert;
