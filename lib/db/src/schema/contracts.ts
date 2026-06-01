import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { themesTable } from "./themes";

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  // Stable idempotency key for ingestion (ANAC protocol / progressivo, or
  // synthetic for seed data). CIG is stored as an attribute below.
  sourceId: text("source_id").unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  supplier: text("supplier").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  procedureType: text("procedure_type").notNull(),
  status: text("status").notNull(),
  // ANAC / BDNCP fields.
  cig: text("cig"),
  cup: text("cup"),
  stazioneAppaltante: text("stazione_appaltante"),
  // Strumento di acquisto (es. MePA, Consip, Convenzione, Autonomo).
  acquisitionTool: text("acquisition_tool"),
  // Derived flags for fast analytics.
  withoutTender: boolean("without_tender").notNull().default(false),
  withoutMepa: boolean("without_mepa").notNull().default(false),
  // Link to the official ANAC dataset / scheda (e.g. by CIG).
  anacUrl: text("anac_url"),
  // Ambito di spesa (macrotema) a cui appartiene il contratto, es. "ambiente",
  // "scuole", "strade". Assegnato in modo euristico durante l'ingestione e
  // correggibile dalla redazione. Null finché non classificato.
  macrotema: text("macrotema"),
  // True quando la redazione ha corretto manualmente il macrotema: in tal caso
  // l'ingestione non lo sovrascrive più con la classificazione automatica.
  macrotemaManual: boolean("macrotema_manual").notNull().default(false),
  awardDate: timestamp("award_date", { withTimezone: true })
    .notNull()
    .defaultNow(),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  themeId: integer("theme_id").references(() => themesTable.id),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Contract = typeof contractsTable.$inferSelect;
export type InsertContract = typeof contractsTable.$inferInsert;
