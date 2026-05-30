import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Domande curate ("Cosa puoi scoprire?"): voci scritte a mano dalla redazione
 * che traducono i dati del sito in domande chiare del cittadino e portano alla
 * sezione che contiene la risposta. Ogni nuova integrazione di dati deve
 * dichiarare almeno una Domanda prima di essere mostrata agli utenti.
 */
export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  // Testo della domanda, es. "Quanto ha speso il Comune in appalti?".
  text: text("text").notNull(),
  // Breve risposta/teaser opzionale mostrato sotto la domanda.
  teaser: text("teaser"),
  // Destinazione interna a cui porta la domanda (percorso + eventuali filtri),
  // es. "/contratti" o "/temi?sort=relevance".
  destinationPath: text("destination_path").notNull(),
  // Etichetta del pulsante/CTA, es. "Vai agli appalti".
  ctaLabel: text("cta_label").notNull(),
  // Argomento/tema di raggruppamento, es. "Soldi pubblici / Appalti".
  topic: text("topic").notNull(),
  // Flag "in evidenza" per la home / sezioni di rilievo.
  featured: boolean("featured").notNull().default(false),
  // Ordinamento manuale (più basso = prima).
  sortOrder: integer("sort_order").notNull().default(0),
  // Stato pubblicato/bozza: "published" | "draft".
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Question = typeof questionsTable.$inferSelect;
export type InsertQuestion = typeof questionsTable.$inferInsert;
