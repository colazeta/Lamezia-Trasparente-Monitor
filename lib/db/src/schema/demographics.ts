import {
  pgTable,
  serial,
  integer,
  text,
  numeric,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const DEMOGRAPHIC_REFERENCE_TYPES = ["stock", "flow"] as const;
export type DemographicReferenceType =
  (typeof DEMOGRAPHIC_REFERENCE_TYPES)[number];

export const DEMOGRAPHIC_SOURCE_STATUSES = [
  "final",
  "provisional",
  "estimated",
  "reconstructed",
  "forecast",
  "unknown",
] as const;
export type DemographicSourceStatus =
  (typeof DEMOGRAPHIC_SOURCE_STATUSES)[number];

export type DemographicDimensions = Record<string, string>;
export type DemographicReleaseMetadata = Record<
  string,
  string | number | boolean | null
>;

// Catalogo canonico delle serie demografiche. Non contiene i valori: definisce
// semantica, fonte e granularità della serie. Le release e le osservazioni sono
// append-only e vivono nelle tabelle sottostanti.
export const demographicSeriesTable = pgTable(
  "demographic_series",
  {
    id: serial("id").primaryKey(),
    seriesKey: text("series_key").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    unit: text("unit").notNull(),
    geographyLevel: text("geography_level").notNull().default("municipality"),
    referenceType: text("reference_type").notNull(),
    source: text("source").notNull(),
    sourceDataset: text("source_dataset").notNull(),
    sourceUrl: text("source_url"),
    externalKey: text("external_key"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    referenceTypeCheck: check(
      "demographic_series_reference_type_check",
      sql`${t.referenceType} in ('stock', 'flow')`,
    ),
    externalKeyIdx: index("demographic_series_external_key_idx").on(
      t.externalKey,
    ),
  }),
);

// Una release rappresenta una risposta sorgente acquisita in un momento
// preciso. Lo stesso dataset può quindi avere molte release nel tempo. L'hash
// rende l'ingestione idempotente: una risposta identica non genera duplicati.
export const demographicReleasesTable = pgTable(
  "demographic_releases",
  {
    id: serial("id").primaryKey(),
    seriesId: integer("series_id")
      .notNull()
      .references(() => demographicSeriesTable.id, { onDelete: "cascade" }),
    sourceDataset: text("source_dataset").notNull(),
    sourceUrl: text("source_url").notNull(),
    sourceHash: text("source_hash").notNull(),
    sourceVersion: text("source_version"),
    releaseDate: timestamp("release_date", { withTimezone: true }),
    acquiredAt: timestamp("acquired_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    httpEtag: text("http_etag"),
    httpLastModified: text("http_last_modified"),
    // Per le serie comunali correnti il CSV è piccolo e viene conservato per
    // audit. Dataset futuri più voluminosi potranno usare object storage e
    // registrare qui soltanto il relativo riferimento nei metadata.
    rawPayload: text("raw_payload"),
    metadata: jsonb("metadata")
      .$type<DemographicReleaseMetadata>()
      .notNull()
      .default({}),
  },
  (t) => ({
    seriesHashUnique: uniqueIndex("demographic_releases_series_hash_idx").on(
      t.seriesId,
      t.sourceHash,
    ),
    seriesAcquiredIdx: index("demographic_releases_series_acquired_idx").on(
      t.seriesId,
      t.acquiredAt,
    ),
  }),
);

// Osservazione canonica appartenente a una specifica release. Più release
// possono contenere lo stesso periodo: è precisamente ciò che consente di
// conservare revisioni, passaggi provisional→final e rettifiche della fonte.
export const demographicObservationsTable = pgTable(
  "demographic_observations",
  {
    id: serial("id").primaryKey(),
    seriesId: integer("series_id")
      .notNull()
      .references(() => demographicSeriesTable.id, { onDelete: "cascade" }),
    releaseId: integer("release_id")
      .notNull()
      .references(() => demographicReleasesTable.id, { onDelete: "cascade" }),
    geographyCode: text("geography_code").notNull(),
    referencePeriod: text("reference_period").notNull(),
    referenceType: text("reference_type").notNull(),
    dimensions: jsonb("dimensions")
      .$type<DemographicDimensions>()
      .notNull()
      .default({}),
    // Forma canonica e ordinata di `dimensions`, usata nell'identità logica
    // dell'osservazione e quindi indicizzabile senza affidarsi all'ordine JSON.
    dimensionKey: text("dimension_key").notNull().default("{}"),
    value: numeric("value", { precision: 18, scale: 4 }).notNull(),
    unit: text("unit").notNull(),
    sourceStatus: text("source_status").notNull().default("unknown"),
    // Codice grezzo eventualmente fornito dalla fonte (es. OBS_STATUS SDMX).
    sourceObservationStatus: text("source_observation_status"),
    qualityFlags: jsonb("quality_flags")
      .$type<string[]>()
      .notNull()
      .default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    releaseObservationUnique: uniqueIndex(
      "demographic_observations_release_identity_idx",
    ).on(t.releaseId, t.geographyCode, t.referencePeriod, t.dimensionKey),
    seriesPeriodIdx: index("demographic_observations_series_period_idx").on(
      t.seriesId,
      t.geographyCode,
      t.referencePeriod,
    ),
    releaseIdx: index("demographic_observations_release_idx").on(t.releaseId),
    referenceTypeCheck: check(
      "demographic_observations_reference_type_check",
      sql`${t.referenceType} in ('stock', 'flow')`,
    ),
    sourceStatusCheck: check(
      "demographic_observations_source_status_check",
      sql`${t.sourceStatus} in ('final', 'provisional', 'estimated', 'reconstructed', 'forecast', 'unknown')`,
    ),
  }),
);

export type DemographicSeries = typeof demographicSeriesTable.$inferSelect;
export type InsertDemographicSeries = typeof demographicSeriesTable.$inferInsert;
export type DemographicRelease = typeof demographicReleasesTable.$inferSelect;
export type InsertDemographicRelease =
  typeof demographicReleasesTable.$inferInsert;
export type DemographicObservation =
  typeof demographicObservationsTable.$inferSelect;
export type InsertDemographicObservation =
  typeof demographicObservationsTable.$inferInsert;
