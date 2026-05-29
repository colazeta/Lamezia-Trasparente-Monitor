import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { publicationsTable } from "./publications";

export const officialsTable = pgTable("officials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  role: text("role").notNull(),
  roleTitle: text("role_title"),
  group: text("group"),
  status: text("status").notNull().default("in_carica"),
  appointmentDate: timestamp("appointment_date", { withTimezone: true }),
  biography: text("biography"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const officialActivitiesTable = pgTable("official_activities", {
  id: serial("id").primaryKey(),
  officialId: integer("official_id")
    .notNull()
    .references(() => officialsTable.id),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date", { withTimezone: true }),
  position: integer("position").notNull().default(0),
});

export const officialRemunerationsTable = pgTable("official_remunerations", {
  id: serial("id").primaryKey(),
  officialId: integer("official_id")
    .notNull()
    .references(() => officialsTable.id),
  year: integer("year").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }),
  type: text("type").notNull(),
  note: text("note"),
  position: integer("position").notNull().default(0),
});

export const officialDeclarationsTable = pgTable("official_declarations", {
  id: serial("id").primaryKey(),
  officialId: integer("official_id")
    .notNull()
    .references(() => officialsTable.id),
  title: text("title").notNull(),
  date: timestamp("date", { withTimezone: true }),
  content: text("content"),
  url: text("url"),
  position: integer("position").notNull().default(0),
});

export const officialVotesTable = pgTable(
  "official_votes",
  {
    id: serial("id").primaryKey(),
    officialId: integer("official_id")
      .notNull()
      .references(() => officialsTable.id),
    publicationId: integer("publication_id")
      .notNull()
      .references(() => publicationsTable.id),
    vote: text("vote").notNull(),
    position: integer("position").notNull().default(0),
  },
  (t) => ({
    officialPublicationUnique: unique().on(t.officialId, t.publicationId),
  }),
);

export type Official = typeof officialsTable.$inferSelect;
export type InsertOfficial = typeof officialsTable.$inferInsert;
export type OfficialActivity = typeof officialActivitiesTable.$inferSelect;
export type InsertOfficialActivity =
  typeof officialActivitiesTable.$inferInsert;
export type OfficialRemuneration =
  typeof officialRemunerationsTable.$inferSelect;
export type InsertOfficialRemuneration =
  typeof officialRemunerationsTable.$inferInsert;
export type OfficialDeclaration =
  typeof officialDeclarationsTable.$inferSelect;
export type InsertOfficialDeclaration =
  typeof officialDeclarationsTable.$inferInsert;
export type OfficialVote = typeof officialVotesTable.$inferSelect;
export type InsertOfficialVote = typeof officialVotesTable.$inferInsert;
