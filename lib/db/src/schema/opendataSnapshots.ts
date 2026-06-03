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
