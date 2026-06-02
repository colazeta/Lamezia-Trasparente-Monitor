import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Stato del bando rispetto alla scadenza:
// - "aperto": ancora candidabile, scadenza lontana o assente
// - "in-scadenza": aperto ma in prossimità della scadenza
// - "concluso": termine scaduto (su questi si stimano le risorse perse)
export const BANDO_STATUSES = ["aperto", "in-scadenza", "concluso"] as const;
export type BandoStatus = (typeof BANDO_STATUSES)[number];

// Origine della voce:
// - "manual": bando curato/confermato dalla redazione (visibile al pubblico)
// - "suggested": candidato proposto in automatico dai contenuti già ingeriti
//   (Albo/contratti/PNRR), visibile solo in area redazione finché non confermato
export const BANDO_SOURCES = ["manual", "suggested"] as const;
export type BandoSource = (typeof BANDO_SOURCES)[number];

// Catalogo dei bandi e finanziamenti pubblici a cui il Comune è potenzialmente
// eligible. I bandi "manual" sono curati a mano dalla redazione; i "suggested"
// sono candidati proposti dal sistema. Lo stile (slug/source/keywords) segue le
// altre sezioni editoriali (Atti Fondamentali, Legalità).
export const bandiTable = pgTable(
  "bandi",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    // Ente erogatore (es. "Regione Calabria", "Ministero dell'Interno", "UE").
    enteErogatore: text("ente_erogatore").notNull().default(""),
    description: text("description").notNull().default(""),
    // Requisiti di eligibility (testo libero redazionale).
    eligibility: text("eligibility").notNull().default(""),
    // Importo stanziato dal bando (plafond complessivo).
    importoStanziato: numeric("importo_stanziato", { precision: 14, scale: 2 }),
    // Importo medio aggiudicato per quel bando: base per la stima delle risorse
    // perse sui bandi conclusi senza partecipazione.
    importoMedioAggiudicato: numeric("importo_medio_aggiudicato", {
      precision: 14,
      scale: 2,
    }),
    scadenza: timestamp("scadenza", { withTimezone: true }),
    status: text("status").$type<BandoStatus>().notNull().default("aperto"),
    // Settore/macrotema condiviso con i contratti (ambiente, scuole, …).
    settore: text("settore"),
    officialUrl: text("official_url"),
    source: text("source").$type<BandoSource>().notNull().default("manual"),
    // Parole chiave per il matching automatico della partecipazione.
    keywords: text("keywords").array().notNull().default([]),
    // Note redazionali (interne, non mostrate al pubblico).
    notes: text("notes").notNull().default(""),
    // Riferimento idempotente alla fonte del suggerimento (es. "pub-<progressivo>"),
    // usato per non duplicare i candidati auto-proposti. Null per i bandi manuali.
    suggestedSourceRef: text("suggested_source_ref").unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statusIdx: index("bandi_status_idx").on(t.status),
    sourceIdx: index("bandi_source_idx").on(t.source),
    settoreIdx: index("bandi_settore_idx").on(t.settore),
    statusCheck: check(
      "bandi_status_check",
      sql`${t.status} in ('aperto', 'in-scadenza', 'concluso')`,
    ),
    sourceCheck: check(
      "bandi_source_check",
      sql`${t.source} in ('manual', 'suggested')`,
    ),
  }),
);

export type Bando = typeof bandiTable.$inferSelect;
export type InsertBando = typeof bandiTable.$inferInsert;
