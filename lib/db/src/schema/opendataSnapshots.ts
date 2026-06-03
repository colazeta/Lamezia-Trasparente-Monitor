import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { opendataResourcesTable } from "./opendataResources";

type ColumnType = "number" | "date" | "string";
type TableColumn = { name: string; type: ColumnType };

export const opendataSnapshotsTable = pgTable("opendata_snapshots", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id")
    .notNull()
    .references(() => opendataResourcesTable.id, { onDelete: "cascade" }),
  capturedAt: timestamp("captured_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  checksum: text("checksum").notNull(),
  // HTTP validators captured from the resource response, used to short-circuit
  // re-ingestion via conditional requests (If-None-Match / If-Modified-Since).
  etag: text("etag"),
  lastModified: text("last_modified"),
  // Bumped on every ingestion run that re-verifies this (latest) snapshot,
  // even when the underlying file is unchanged, so the feed reflects the run.
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  rowCount: integer("row_count").notNull().default(0),
  changed: boolean("changed").notNull().default(true),
  columns: jsonb("columns").$type<TableColumn[]>().notNull().default([]),
  rows: jsonb("rows")
    .$type<Record<string, string | number | null>[]>()
    .notNull()
    .default([]),
});

export type OpendataSnapshot = typeof opendataSnapshotsTable.$inferSelect;
export type InsertOpendataSnapshot =
  typeof opendataSnapshotsTable.$inferInsert;
