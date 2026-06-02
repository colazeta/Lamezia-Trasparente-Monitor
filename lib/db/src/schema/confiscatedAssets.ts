import {
  pgTable,
  serial,
  text,
  numeric,
  boolean,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Stato del bene confiscato lungo l'iter di sottrazione alla criminalità:
// - "sequestrato": sottoposto a sequestro (fase cautelare)
// - "confiscato": confisca definitiva, trasferito al patrimonio dello Stato
// - "assegnato": destinato/assegnato a un ente o a una associazione
// - "riutilizzato": effettivamente riutilizzato a fini sociali/istituzionali
export const CONFISCATED_ASSET_STATUSES = [
  "sequestrato",
  "confiscato",
  "assegnato",
  "riutilizzato",
] as const;
export type ConfiscatedAssetStatus =
  (typeof CONFISCATED_ASSET_STATUSES)[number];

// Origine della voce:
// - "manual": bene curato/inserito dalla redazione (precedenza sull'automatico)
// - "auto": bene importato dall'open data ANBSC
export const CONFISCATED_ASSET_SOURCES = ["manual", "auto"] as const;
export type ConfiscatedAssetSource =
  (typeof CONFISCATED_ASSET_SOURCES)[number];

// Catalogo dei beni confiscati alle mafie nel territorio comunale (ispirato a
// ConfiscatiBene). I beni "auto" sono importati dall'open data ANBSC e
// geolocalizzati col geocoder condiviso; i beni "manual" sono curati dalla
// redazione e hanno sempre la precedenza (l'ingestione non li sovrascrive).
// Lo stile (slug/source/geo*) segue le altre sezioni (contratti, bandi).
export const confiscatedAssetsTable = pgTable(
  "confiscated_assets",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    // Denominazione sintetica del bene (titolo mostrato in lista/mappa).
    denominazione: text("denominazione").notNull(),
    description: text("description").notNull().default(""),
    // Tipologia del bene (es. "Appartamento", "Terreno", "Capannone", "Azienda").
    tipologia: text("tipologia").notNull().default(""),
    status: text("status")
      .$type<ConfiscatedAssetStatus>()
      .notNull()
      .default("confiscato"),
    // Indirizzo/ubicazione testuale del bene (usato anche per il geocoding).
    indirizzo: text("indirizzo").notNull().default(""),
    // Ente o associazione assegnataria (quando assegnato/riutilizzato).
    assegnatario: text("assegnatario").notNull().default(""),
    // Destinazione d'uso prevista/effettiva (es. "Sede associazione", "Alloggi").
    destinazioneUso: text("destinazione_uso").notNull().default(""),
    // Dati catastali / consistenza (testo libero, opzionale).
    datiCatastali: text("dati_catastali").notNull().default(""),
    officialUrl: text("official_url"),
    source: text("source")
      .$type<ConfiscatedAssetSource>()
      .notNull()
      .default("manual"),
    // Riferimento idempotente alla fonte ANBSC (es. "anbsc-<id>"), usato per non
    // duplicare i beni importati. Null per i beni inseriti manualmente.
    sourceId: text("source_id").unique(),
    // --- Geolocalizzazione (stessa convenzione dei contratti) ---
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    geoAddress: text("geo_address"),
    geoQuartiere: text("geo_quartiere"),
    // Origine della posizione: "auto" (geocoder) o "manual" (redazione).
    geoSource: text("geo_source"),
    // true se la posizione è stata fissata a mano: blocca il geocoding automatico.
    geoManual: boolean("geo_manual").notNull().default(false),
    // true se la posizione è approssimata e "da verificare" dalla redazione.
    geoVerify: boolean("geo_verify").notNull().default(false),
    // Note redazionali (interne, non mostrate al pubblico).
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statusIdx: index("confiscated_assets_status_idx").on(t.status),
    sourceIdx: index("confiscated_assets_source_idx").on(t.source),
    tipologiaIdx: index("confiscated_assets_tipologia_idx").on(t.tipologia),
    statusCheck: check(
      "confiscated_assets_status_check",
      sql`${t.status} in ('sequestrato', 'confiscato', 'assegnato', 'riutilizzato')`,
    ),
    sourceCheck: check(
      "confiscated_assets_source_check",
      sql`${t.source} in ('manual', 'auto')`,
    ),
  }),
);

export type ConfiscatedAsset = typeof confiscatedAssetsTable.$inferSelect;
export type InsertConfiscatedAsset =
  typeof confiscatedAssetsTable.$inferInsert;
