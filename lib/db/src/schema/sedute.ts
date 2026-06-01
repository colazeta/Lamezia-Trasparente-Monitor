import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { organiTable } from "./organi";
import { publicationsTable } from "./publications";

export const seduteTable = pgTable(
  "sedute",
  {
    id: serial("id").primaryKey(),
    organoId: integer("organo_id").references(() => organiTable.id, {
      onDelete: "set null",
    }),
    publicationId: integer("publication_id")
      .unique()
      .references(() => publicationsTable.id, { onDelete: "set null" }),
    type: text("type").notNull(),
    date: timestamp("date", { withTimezone: true }),
    agenda: text("agenda"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    organoIdIdx: index("sedute_organo_id_idx").on(t.organoId),
    dateIdx: index("sedute_date_idx").on(t.date),
  }),
);

export type Seduta = typeof seduteTable.$inferSelect;
export type InsertSeduta = typeof seduteTable.$inferInsert;
