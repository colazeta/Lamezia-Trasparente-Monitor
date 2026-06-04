import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { themesTable } from "./themes";
import { attuazionePnrrProjectsTable } from "./attuazionePnrr";

// Tipo di richiesta di accesso, con i relativi riferimenti normativi.
// - "generalizzato": accesso civico generalizzato (FOIA), art. 5 c.2 d.lgs. 33/2013
// - "semplice": accesso civico semplice su dati a pubblicazione obbligatoria,
//   art. 5 c.1 d.lgs. 33/2013
// - "documentale": accesso documentale, artt. 22 e ss. l. 241/1990
export const ACCESSO_CIVICO_TIPI = [
  "generalizzato",
  "semplice",
  "documentale",
] as const;
export type AccessoCivicoTipo = (typeof ACCESSO_CIVICO_TIPI)[number];

// Esito della richiesta tracciata dal cittadino.
export const ACCESSO_CIVICO_STATI = [
  "in-attesa",
  "accolta",
  "rifiutata",
] as const;
export type AccessoCivicoStato = (typeof ACCESSO_CIVICO_STATI)[number];

// Stato di moderazione: le richieste inviate dai cittadini partono in "pending"
// e diventano pubbliche solo dopo la revisione della redazione.
export const ACCESSO_CIVICO_MODERAZIONE = ["pending", "published"] as const;
export type AccessoCivicoModerazione =
  (typeof ACCESSO_CIVICO_MODERAZIONE)[number];

// Origine della voce: "cittadino" per le richieste inserite dai cittadini via
// portale, "registro-ufficiale" per le voci importate dal Registro degli accessi
// pubblicato dall'ente.
export const ACCESSO_CIVICO_ORIGINI = [
  "cittadino",
  "registro-ufficiale",
] as const;
export type AccessoCivicoOrigine = (typeof ACCESSO_CIVICO_ORIGINI)[number];

// Registro pubblico delle richieste di accesso civico / FOIA inviate al Comune
// dai cittadini, con il relativo esito ed eventuale documento di risposta. Le
// richieste sono inviate manualmente dal cittadino all'ente; qui se ne tiene
// solo traccia pubblica. La creazione è pubblica ma la voce resta in moderazione
// finché la redazione non la pubblica (gate ingest, come le altre sezioni).
export const accessoCivicoRequestsTable = pgTable(
  "accesso_civico_requests",
  {
    id: serial("id").primaryKey(),
    // Oggetto della richiesta (cosa si chiede, in breve).
    oggetto: text("oggetto").notNull(),
    // Tipo di accesso (determina i riferimenti normativi).
    tipo: text("tipo").$type<AccessoCivicoTipo>().notNull().default(
      "generalizzato",
    ),
    // Ente destinatario della richiesta.
    ente: text("ente").notNull().default("Comune di Lamezia Terme"),
    // Descrizione dei dati/documenti richiesti.
    descrizione: text("descrizione").notNull().default(""),
    // Testo integrale della richiesta inviata (generato dall'assistente).
    requestText: text("request_text").notNull().default(""),
    // Nome del richiedente (facoltativo, mostrato pubblicamente se fornito).
    requesterName: text("requester_name"),
    // Data di invio della richiesta all'ente.
    requestDate: timestamp("request_date", { withTimezone: true }),
    // Esito della richiesta.
    stato: text("stato").$type<AccessoCivicoStato>().notNull().default(
      "in-attesa",
    ),
    // Note sull'esito (motivazione dell'ente, dettagli, ecc.).
    esitoNote: text("esito_note").notNull().default(""),
    // Data della risposta dell'ente.
    responseDate: timestamp("response_date", { withTimezone: true }),
    // Documento di risposta allegato (object storage o URL ufficiale).
    responseUrl: text("response_url"),
    // Etichetta/nome del documento di risposta.
    responseLabel: text("response_label"),
    // Collegamento facoltativo a un tema pertinente.
    themeId: integer("theme_id").references(() => themesTable.id, {
      onDelete: "set null",
    }),
    // Collegamento facoltativo a un progetto PNRR pertinente.
    pnrrProjectId: integer("pnrr_project_id").references(
      () => attuazionePnrrProjectsTable.id,
      { onDelete: "set null" },
    ),
    // Stato di moderazione.
    status: text("status")
      .$type<AccessoCivicoModerazione>()
      .notNull()
      .default("pending"),
    // Origine della voce: "cittadino" (inserita dal portale) o
    // "registro-ufficiale" (importata dal registro ufficiale del Comune).
    origine: text("origine")
      .$type<AccessoCivicoOrigine>()
      .notNull()
      .default("cittadino"),
    // Chiave di deduplica per le voci del registro ufficiale (null per le voci
    // dei cittadini). Garantisce che la re-importazione non crei duplicati.
    deduplicaKey: text("deduplica_key"),
    // URL della fonte ufficiale (registro del Comune o atto pubblicato).
    fonteUrl: text("fonte_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statoIdx: index("accesso_civico_stato_idx").on(t.stato),
    statusIdx: index("accesso_civico_status_idx").on(t.status),
    tipoIdx: index("accesso_civico_tipo_idx").on(t.tipo),
    themeIdIdx: index("accesso_civico_theme_id_idx").on(t.themeId),
    origineIdx: index("accesso_civico_origine_idx").on(t.origine),
    deduplicaKeyIdx: uniqueIndex("accesso_civico_deduplica_key_idx")
      .on(t.deduplicaKey)
      .where(sql`${t.deduplicaKey} IS NOT NULL`),
    tipoCheck: check(
      "accesso_civico_tipo_check",
      sql`${t.tipo} in ('generalizzato', 'semplice', 'documentale')`,
    ),
    statoCheck: check(
      "accesso_civico_stato_check",
      sql`${t.stato} in ('in-attesa', 'accolta', 'rifiutata')`,
    ),
    statusCheck: check(
      "accesso_civico_status_check",
      sql`${t.status} in ('pending', 'published')`,
    ),
    origineCheck: check(
      "accesso_civico_origine_check",
      sql`${t.origine} in ('cittadino', 'registro-ufficiale')`,
    ),
  }),
);

export type AccessoCivicoRequest =
  typeof accessoCivicoRequestsTable.$inferSelect;
export type InsertAccessoCivicoRequest =
  typeof accessoCivicoRequestsTable.$inferInsert;
