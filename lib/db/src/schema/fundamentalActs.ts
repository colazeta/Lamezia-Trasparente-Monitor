import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { publicationsTable } from "./publications";

// File caricato a mano dalla redazione e archiviato nello storage pubblico.
// `storagePath` è l'URL servibile (es. /api/storage/objects/<id>), coerente con
// il pattern degli allegati ufficiali (PublicationAttachment.storagePath).
export type FundamentalActFile = {
  name: string;
  storagePath: string;
  contentType: string | null;
  size: number | null;
};

// Fonte pubblicata della voce corrente:
// - "none": tipo definito ma senza contenuto pubblicato (resta nascosto al pubblico)
// - "manual": file caricato o link ufficiale inseriti dalla redazione
// - "auto": atto trovato in automatico tra le pubblicazioni e confermato
export const FUNDAMENTAL_ACT_SOURCES = ["none", "manual", "auto"] as const;
export type FundamentalActSource = (typeof FUNDAMENTAL_ACT_SOURCES)[number];

// Catalogo estendibile dei tipi di atto fondamentale (PIAO, DUP, Bilancio…).
// Ogni riga rappresenta sia il tipo (slug/label/keywords) sia la sua "voce
// corrente" (titolo/descrizione/fonte): relazione 1:1, una sola versione per
// tipo (niente storico per anno).
export const fundamentalActsTable = pgTable(
  "fundamental_acts",
  {
    id: serial("id").primaryKey(),
    // Identificativo stabile del tipo, es. "piao", "dup", "bilancio-previsione".
    slug: text("slug").notNull().unique(),
    // Etichetta mostrata, es. "PIAO (Piano Integrato di Attività e Organizzazione)".
    label: text("label").notNull(),
    // Parole chiave per l'aggancio automatico (match su oggetto/tipologia).
    keywords: text("keywords").array().notNull().default([]),
    sortOrder: integer("sort_order").notNull().default(0),

    // Voce corrente (gestita dalla redazione).
    title: text("title"),
    description: text("description"),
    source: text("source")
      .$type<FundamentalActSource>()
      .notNull()
      .default("none"),

    // Fonte manuale: link ufficiale e/o file archiviato.
    manualOfficialUrl: text("manual_official_url"),
    manualFile: jsonb("manual_file").$type<FundamentalActFile | null>(),

    // Aggancio automatico confermato dalla redazione.
    linkedPublicationId: integer("linked_publication_id").references(
      () => publicationsTable.id,
      { onDelete: "set null" },
    ),
    // Suggerimento automatico più recente (non ancora confermato).
    suggestedPublicationId: integer("suggested_publication_id").references(
      () => publicationsTable.id,
      { onDelete: "set null" },
    ),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sortOrderIdx: index("fundamental_acts_sort_order_idx").on(t.sortOrder),
  }),
);

export type FundamentalAct = typeof fundamentalActsTable.$inferSelect;
export type InsertFundamentalAct = typeof fundamentalActsTable.$inferInsert;
