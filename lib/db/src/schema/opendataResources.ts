import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { opendataDatasetsTable } from "./opendataDatasets";

export const opendataResourcesTable = pgTable("opendata_resources", {
  id: serial("id").primaryKey(),
  // Stable idempotency key for ingestion (Maggioli/CKAN resource id).
  sourceId: text("source_id").notNull().unique(),
  datasetId: integer("dataset_id")
    .notNull()
    .references(() => opendataDatasetsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull().default(""),
  description: text("description"),
  // Resource format, upper-cased (e.g. CSV, JSON, PDF).
  format: text("format"),
  // Public direct-download URL.
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
  lastModified: timestamp("last_modified", { withTimezone: true }),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type OpendataResource = typeof opendataResourcesTable.$inferSelect;
export type InsertOpendataResource =
  typeof opendataResourcesTable.$inferInsert;
