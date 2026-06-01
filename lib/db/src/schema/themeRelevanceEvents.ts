import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const themeRelevanceEventsTable = pgTable(
  "theme_relevance_events",
  {
    id: serial("id").primaryKey(),
    themeId: integer("theme_id")
      .notNull()
      .references(() => themesTable.id, { onDelete: "cascade" }),
    // Chiave anti-abuso che identifica la sorgente del segnale (hash della
    // provenienza, p.es. IP). Permette di deduplicare i clic ripetuti e fa sì
    // che la riconciliazione ricalcoli un conteggio onesto contando le righe
    // (una per sorgente). È nullable per compatibilità con gli eventi storici.
    dedupeKey: text("dedupe_key"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    themeIdIdx: index("theme_relevance_events_theme_id_idx").on(t.themeId),
    // I NULL sono considerati distinti da Postgres, quindi le righe storiche
    // senza chiave non entrano in conflitto fra loro.
    themeDedupeUnique: uniqueIndex(
      "theme_relevance_events_theme_dedupe_unique",
    ).on(t.themeId, t.dedupeKey),
  }),
);

export type ThemeRelevanceEvent = typeof themeRelevanceEventsTable.$inferSelect;
export type InsertThemeRelevanceEvent =
  typeof themeRelevanceEventsTable.$inferInsert;
