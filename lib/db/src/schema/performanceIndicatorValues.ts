import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { performanceIndicatorsTable } from "./performanceIndicators";

// Serie storica di un indicatore: un valore numerico per ogni periodo di
// riferimento (tipicamente l'anno, ma il campo è testuale per ospitare anche
// trimestri o mesi, es. "2024", "2024-Q1").
export const performanceIndicatorValuesTable = pgTable(
  "performance_indicator_values",
  {
    id: serial("id").primaryKey(),
    indicatorId: integer("indicator_id")
      .notNull()
      .references(() => performanceIndicatorsTable.id, {
        onDelete: "cascade",
      }),
    period: text("period").notNull(),
    value: numeric("value", { precision: 18, scale: 4 }).notNull(),
    note: text("note"),
    // True quando il valore è stato inserito/corretto a mano dalla redazione:
    // in tal caso l'ingestione automatica non lo sovrascrive più.
    manual: boolean("manual").notNull().default(false),
    // Provenienza del singolo dato (es. "ISTAT", "Redazione").
    source: text("source"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    indicatorPeriodUnique: uniqueIndex(
      "performance_indicator_values_indicator_period_idx",
    ).on(t.indicatorId, t.period),
    indicatorIdIdx: index(
      "performance_indicator_values_indicator_id_idx",
    ).on(t.indicatorId),
  }),
);

export type PerformanceIndicatorValue =
  typeof performanceIndicatorValuesTable.$inferSelect;
export type InsertPerformanceIndicatorValue =
  typeof performanceIndicatorValuesTable.$inferInsert;
