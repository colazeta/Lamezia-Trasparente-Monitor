import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const opendataDatasetsTable = pgTable("opendata_datasets", {
  id: serial("id").primaryKey(),
  // Stable idempotency key for ingestion (Maggioli/CKAN dataset id).
  sourceId: text("source_id").notNull().unique(),
  // CKAN url slug (used to build the official portal link).
  slug: text("slug"),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  // Catalog category (CKAN group, e.g. "Governo").
  category: text("category"),
  // DCAT-AP theme code (e.g. "GOVE").
  theme: text("theme"),
  frequency: text("frequency"),
  licenseId: text("license_id"),
  licenseTitle: text("license_title"),
  holderName: text("holder_name"),
  // Link to the dataset page on the official open-data portal.
  portalUrl: text("portal_url"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  resourceCount: integer("resource_count").notNull().default(0),
  metadataModified: timestamp("metadata_modified", { withTimezone: true }),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type OpendataDataset = typeof opendataDatasetsTable.$inferSelect;
export type InsertOpendataDataset = typeof opendataDatasetsTable.$inferInsert;
