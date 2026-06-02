import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { legalityAreasTable } from "./legalityAreas";

// Stato di un requisito, deciso a mano dalla Redazione. Nessun punteggio viene
// calcolato in automatico: lo stato è solo un'etichetta leggibile.
export const LEGALITY_REQUIREMENT_STATUSES = [
  "present",
  "absent",
  "partial",
  "not_applicable",
] as const;
export type LegalityRequirementStatus =
  (typeof LEGALITY_REQUIREMENT_STATUSES)[number];

// Riferimento a un atto collegato manualmente a un requisito: può puntare a una
// pagina interna del sito (es. "/albo") o a un URL esterno. L'etichetta è
// libera ed è ciò che viene mostrato come testo del link.
export type LegalityActLink = {
  label: string;
  url: string;
};

// Requisiti di un'area di monitoraggio: cosa il Comune dovrebbe avere, con lo
// stato (presente/assente/parziale/non applicabile), un commento esplicativo e
// gli atti collegati a mano.
export const legalityRequirementsTable = pgTable(
  "legality_requirements",
  {
    id: serial("id").primaryKey(),
    areaId: integer("area_id")
      .notNull()
      .references(() => legalityAreasTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: text("status").notNull().default("absent"),
    comment: text("comment").notNull().default(""),
    linkedActs: jsonb("linked_acts")
      .$type<LegalityActLink[]>()
      .notNull()
      .default([]),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    areaIdIdx: index("legality_requirements_area_id_idx").on(t.areaId),
    statusCheck: check(
      "legality_requirements_status_check",
      sql`${t.status} in ('present', 'absent', 'partial', 'not_applicable')`,
    ),
  }),
);

export type LegalityRequirement =
  typeof legalityRequirementsTable.$inferSelect;
export type InsertLegalityRequirement =
  typeof legalityRequirementsTable.$inferInsert;
