import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const sharesTable = pgTable(
  "shares",
  {
    id: serial("id").primaryKey(),
    themeId: integer("theme_id")
      .notNull()
      .references(() => themesTable.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(),
    // Chiave anti-abuso che identifica la sorgente della condivisione (hash
    // della provenienza, p.es. IP). Insieme al canale permette di deduplicare
    // le condivisioni ripetute (una per sorgente e per canale) e fa sì che la
    // riconciliazione ricalcoli un conteggio onesto contando le righe. È
    // nullable per compatibilità con le condivisioni storiche.
    dedupeKey: text("dedupe_key"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    themeIdIdx: index("shares_theme_id_idx").on(t.themeId),
    // I NULL sono considerati distinti da Postgres, quindi le righe storiche
    // senza chiave non entrano in conflitto fra loro.
    themeChannelDedupeUnique: uniqueIndex(
      "shares_theme_channel_dedupe_unique",
    ).on(t.themeId, t.channel, t.dedupeKey),
  }),
);

export type Share = typeof sharesTable.$inferSelect;
export type InsertShare = typeof sharesTable.$inferInsert;
