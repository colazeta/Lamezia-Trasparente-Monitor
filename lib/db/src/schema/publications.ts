import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const publicationsTable = pgTable("publications", {
  id: serial("id").primaryKey(),
  progressivo: text("progressivo").notNull().unique(),
  tipologia: text("tipologia").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  provenienza: text("provenienza"),
  oggetto: text("oggetto").notNull(),
  dataAtto: timestamp("data_atto", { withTimezone: true }),
  pubStart: timestamp("pub_start", { withTimezone: true }),
  pubEnd: timestamp("pub_end", { withTimezone: true }),
  numRegSet: text("num_reg_set"),
  numRegGen: text("num_reg_gen"),
  cups: text("cups").array().notNull().default([]),
  pnrrMission: text("pnrr_mission"),
  isPnrr: boolean("is_pnrr").notNull().default(false),
  isNew: boolean("is_new").notNull().default(true),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Publication = typeof publicationsTable.$inferSelect;
export type InsertPublication = typeof publicationsTable.$inferInsert;
