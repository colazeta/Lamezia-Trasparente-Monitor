import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { performanceCategoriesTable } from "./performanceCategories";

// Modalità di aggiornamento di un indicatore: inserito/corretto a mano dalla
// redazione ("manual") oppure popolato da una fonte automatica ("automatic").
export const PERFORMANCE_UPDATE_MODES = ["manual", "automatic"] as const;
export type PerformanceUpdateMode =
  (typeof PERFORMANCE_UPDATE_MODES)[number];

// Direzione di lettura dell'indicatore: serve alla visualizzazione per capire
// se un valore in aumento è positivo, negativo o neutro.
export const PERFORMANCE_POLARITIES = [
  "higher_better",
  "lower_better",
  "neutral",
] as const;
export type PerformancePolarity = (typeof PERFORMANCE_POLARITIES)[number];

// Catalogo degli indicatori di performance/qualità della vita. Ogni indicatore
// appartiene a una categoria e possiede una serie storica di valori
// (`performance_indicator_values`).
export const performanceIndicatorsTable = pgTable(
  "performance_indicators",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => performanceCategoriesTable.id, {
        onDelete: "restrict",
      }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    // Unità di misura (es. "abitanti", "%", "€", "n.").
    unit: text("unit").notNull(),
    // Fonte del dato (es. "ISTAT", "Comune di Lamezia Terme", "Redazione").
    source: text("source").notNull().default("Redazione"),
    sourceUrl: text("source_url"),
    updateMode: text("update_mode").notNull().default("manual"),
    polarity: text("polarity").notNull().default("neutral"),
    // Chiave che identifica la serie sulla fonte automatica (es. la query SDMX
    // ISTAT). Usata dall'ingestione per associare i dati esterni all'indicatore.
    externalKey: text("external_key"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    categoryIdIdx: index("performance_indicators_category_id_idx").on(
      t.categoryId,
    ),
    updateModeCheck: check(
      "performance_indicators_update_mode_check",
      sql`${t.updateMode} in ('manual', 'automatic')`,
    ),
  }),
);

export type PerformanceIndicator =
  typeof performanceIndicatorsTable.$inferSelect;
export type InsertPerformanceIndicator =
  typeof performanceIndicatorsTable.$inferInsert;
