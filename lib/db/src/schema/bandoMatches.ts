import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { bandiTable } from "./bandi";
import { publicationsTable } from "./publications";
import { contractsTable } from "./contracts";
import { attuazionePnrrProjectsTable } from "./attuazionePnrr";

// Tipo di entità a cui un riscontro di partecipazione punta.
export const BANDO_MATCH_TARGETS = [
  "publication",
  "contract",
  "pnrr",
] as const;
export type BandoMatchTarget = (typeof BANDO_MATCH_TARGETS)[number];

// Abbinamenti di partecipazione: collegano un bando agli atti/contratti/progetti
// PNRR già ingeriti che ne attestano la partecipazione del Comune. Ogni riga è
// un riscontro suggerito automaticamente (keyword/CUP/CIG) che la redazione può
// confermare o scartare. Esattamente una sola FK fra publication/contract/pnrr
// è valorizzata, coerente con `targetType`.
export const bandoMatchesTable = pgTable(
  "bando_matches",
  {
    id: serial("id").primaryKey(),
    bandoId: integer("bando_id")
      .notNull()
      .references(() => bandiTable.id, { onDelete: "cascade" }),
    targetType: text("target_type")
      .$type<BandoMatchTarget>()
      .notNull(),
    publicationId: integer("publication_id").references(
      () => publicationsTable.id,
      { onDelete: "cascade" },
    ),
    contractId: integer("contract_id").references(() => contractsTable.id, {
      onDelete: "cascade",
    }),
    pnrrProjectId: integer("pnrr_project_id").references(
      () => attuazionePnrrProjectsTable.id,
      { onDelete: "cascade" },
    ),
    // Motivo del riscontro (es. "CIG", "CUP", "Parola chiave: …").
    matchReason: text("match_reason").notNull().default(""),
    // True quando la redazione ha confermato il riscontro come valido.
    confirmed: boolean("confirmed").notNull().default(false),
    // True quando la redazione ha scartato il suggerimento: non verrà più
    // riproposto né conteggiato.
    dismissed: boolean("dismissed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    bandoIdIdx: index("bando_matches_bando_id_idx").on(t.bandoId),
    targetTypeCheck: check(
      "bando_matches_target_type_check",
      sql`${t.targetType} in ('publication', 'contract', 'pnrr')`,
    ),
    uniquePublication: uniqueIndex("bando_matches_unique_publication")
      .on(t.bandoId, t.publicationId)
      .where(sql`${t.publicationId} is not null`),
    uniqueContract: uniqueIndex("bando_matches_unique_contract")
      .on(t.bandoId, t.contractId)
      .where(sql`${t.contractId} is not null`),
    uniquePnrr: uniqueIndex("bando_matches_unique_pnrr")
      .on(t.bandoId, t.pnrrProjectId)
      .where(sql`${t.pnrrProjectId} is not null`),
  }),
);

export type BandoMatch = typeof bandoMatchesTable.$inferSelect;
export type InsertBandoMatch = typeof bandoMatchesTable.$inferInsert;
