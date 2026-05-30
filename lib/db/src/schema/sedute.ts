import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { organiTable } from "./organi";
import { publicationsTable } from "./publications";

export const seduteTable = pgTable("sedute", {
  id: serial("id").primaryKey(),
  organoId: integer("organo_id").references(() => organiTable.id),
  publicationId: integer("publication_id")
    .unique()
    .references(() => publicationsTable.id),
  type: text("type").notNull(),
  date: timestamp("date", { withTimezone: true }),
  agenda: text("agenda"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Seduta = typeof seduteTable.$inferSelect;
export type InsertSeduta = typeof seduteTable.$inferInsert;
