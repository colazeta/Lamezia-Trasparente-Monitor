import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Page Layouts — block-based page composer
// ---------------------------------------------------------------------------

export const PAGE_SLUGS = [
  "home",
  "temi",
  "domande",
  "contratti",
  "pnrr",
  "albo",
  "delibere",
  "organi",
] as const;
export type PageSlug = (typeof PAGE_SLUGS)[number];

export const BLOCK_TYPES = [
  "hero",
  "stats",
  "quick_links",
  "questions_featured",
  "recent_activity",
  "themes_grid",
  "convocazioni",
  "cta_banner",
  "rich_text",
  "image",
  "call_to_action",
  "section_embed",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export const pageBlocksTable = pgTable(
  "page_blocks",
  {
    id: serial("id").primaryKey(),
    pageSlug: text("page_slug").notNull(),
    blockType: text("block_type").notNull(),
    position: integer("position").notNull().default(0),
    enabled: boolean("enabled").notNull().default(true),
    status: text("status").notNull().default("published"),
    content: jsonb("content").notNull().default({}),
    draftContent: jsonb("draft_content"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pageSlugIdx: index("page_blocks_page_slug_idx").on(t.pageSlug),
    positionIdx: index("page_blocks_position_idx").on(t.pageSlug, t.position),
  }),
);

export type PageBlock = typeof pageBlocksTable.$inferSelect;
export type InsertPageBlock = typeof pageBlocksTable.$inferInsert;

// ---------------------------------------------------------------------------
// Site Strings (micro-copy) — key → text with draft/published
// ---------------------------------------------------------------------------

export const siteStringsTable = pgTable(
  "site_strings",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull().unique(),
    namespace: text("namespace").notNull().default("general"),
    defaultValue: text("default_value").notNull().default(""),
    publishedValue: text("published_value"),
    draftValue: text("draft_value"),
    richText: boolean("rich_text").notNull().default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    namespaceIdx: index("site_strings_namespace_idx").on(t.namespace),
  }),
);

export type SiteString = typeof siteStringsTable.$inferSelect;
export type InsertSiteString = typeof siteStringsTable.$inferInsert;

// ---------------------------------------------------------------------------
// Helper Content editable overrides — replaces hardcoded helperContent.ts
// ---------------------------------------------------------------------------

export const helperOverridesTable = pgTable("helper_overrides", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  publishedJson: jsonb("published_json"),
  draftJson: jsonb("draft_json"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type HelperOverride = typeof helperOverridesTable.$inferSelect;
