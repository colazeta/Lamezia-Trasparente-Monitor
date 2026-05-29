import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const feedStatusTable = pgTable("feed_status", {
  id: serial("id").primaryKey(),
  source: text("source").notNull().unique(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  status: text("status").notNull().default("pending"),
  error: text("error"),
  itemsTotal: integer("items_total").notNull().default(0),
  itemsNew: integer("items_new").notNull().default(0),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  lastUpdatedAt: timestamp("last_updated_at", { withTimezone: true }),
});

export type FeedStatus = typeof feedStatusTable.$inferSelect;
export type InsertFeedStatus = typeof feedStatusTable.$inferInsert;
