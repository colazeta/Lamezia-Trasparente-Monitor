import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { officialsTable } from "./officials";

export const organiTable = pgTable("organi", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const organiMembersTable = pgTable(
  "organi_members",
  {
    id: serial("id").primaryKey(),
    organoId: integer("organo_id")
      .notNull()
      .references(() => organiTable.id, { onDelete: "cascade" }),
    officialId: integer("official_id")
      .notNull()
      .references(() => officialsTable.id, { onDelete: "cascade" }),
    membershipRole: text("membership_role"),
    position: integer("position").notNull().default(0),
  },
  (t) => ({
    organoOfficialUnique: unique().on(t.organoId, t.officialId),
    officialIdIdx: index("organi_members_official_id_idx").on(t.officialId),
  }),
);

export type Organo = typeof organiTable.$inferSelect;
export type InsertOrgano = typeof organiTable.$inferInsert;
export type OrganoMember = typeof organiMembersTable.$inferSelect;
export type InsertOrganoMember = typeof organiMembersTable.$inferInsert;
