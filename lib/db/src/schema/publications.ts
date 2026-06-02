import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

export type PublicationAttachment = {
  // Allegato display name from the official viewer (NOMEALLEGATO).
  name: string;
  // Official Tinn allegato type code (X, P, ...), kept to rebuild the URL.
  tipo: string;
  // Direct download URL of the specific document on the official portal.
  officialUrl: string;
  // Path of the locally-archived copy, served via /api/storage/public-objects/.
  // Null when the file could not be archived (best-effort).
  storagePath: string | null;
  contentType: string | null;
  size: number | null;
};

export const publicationsTable = pgTable(
  "publications",
  {
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
    attachments: jsonb("attachments")
      .$type<PublicationAttachment[]>()
      .notNull()
      .default([]),
    detailFetchedAt: timestamp("detail_fetched_at", { withTimezone: true }),
    // Testo pulito in Markdown estratto dall'allegato PDF principale, archiviato
    // per l'API pubblica/MCP (giornalisti, assistenti AI). Best-effort: null
    // finché non viene estratto (o se nessun allegato è leggibile).
    markdownText: text("markdown_text"),
    // Nome dell'allegato da cui è stato estratto il testo (tracciabilità fonte).
    markdownSource: text("markdown_source"),
    markdownExtractedAt: timestamp("markdown_extracted_at", {
      withTimezone: true,
    }),
    isNew: boolean("is_new").notNull().default(true),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    categoryIdx: index("publications_category_idx").on(t.category),
    isPnrrIdx: index("publications_is_pnrr_idx").on(t.isPnrr),
    dataAttoIdx: index("publications_data_atto_idx").on(t.dataAtto),
    pubStartIdx: index("publications_pub_start_idx").on(t.pubStart),
    lastSeenAtIdx: index("publications_last_seen_at_idx").on(t.lastSeenAt),
  }),
);

export type Publication = typeof publicationsTable.$inferSelect;
export type InsertPublication = typeof publicationsTable.$inferInsert;
