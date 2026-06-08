import {
  pgTable,
  serial,
  text,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const REPORT_STATUSES = [
  "ricevuta",
  "in_valutazione",
  "presa_in_carico",
  "archiviata",
] as const;
export type ReportStatusValue = (typeof REPORT_STATUSES)[number];

export const REPORT_VERIFICATION_STATUSES = [
  "non_verificata",
  "in_verifica",
  "documentata",
  "risposta_ricevuta",
  "chiusa",
  "archiviata",
  "da_aggiornare",
] as const;
export type ReportVerificationStatusValue =
  (typeof REPORT_VERIFICATION_STATUSES)[number];

export const REPORT_OUTCOMES = [
  "aperta",
  "risolta",
  "parzialmente_risolta",
  "non_risolta",
  "non_verificabile",
  "archiviata",
] as const;
export type ReportOutcomeValue = (typeof REPORT_OUTCOMES)[number];

export const reportsTable = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    location: text("location").notNull(),
    status: text("status").notNull().default("ricevuta"),
    citizenName: text("citizen_name"),
    initialSourceType: text("initial_source_type"),
    initialSourceUrl: text("initial_source_url"),
    publicEmergenceDate: timestamp("public_emergence_date", {
      withTimezone: true,
    }),
    involvedSector: text("involved_sector"),
    competentOffice: text("competent_office"),
    formalAct: text("formal_act"),
    institutionalResponse: text("institutional_response"),
    institutionalResponseDate: timestamp("institutional_response_date", {
      withTimezone: true,
    }),
    availableData: text("available_data"),
    missingData: text("missing_data"),
    foiaLink: text("foia_link"),
    outcome: text("outcome").notNull().default("aperta"),
    verificationStatus: text("verification_status")
      .notNull()
      .default("non_verificata"),
    interpretiveCaution: text("interpretive_caution")
      .notNull()
      .default(
        "Scheda da leggere come tracciamento civico: la presenza nel registro non indica responsabilità o irregolarità accertate.",
      ),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statusIdx: index("reports_status_idx").on(t.status),
    categoryIdx: index("reports_category_idx").on(t.category),
    competentOfficeIdx: index("reports_competent_office_idx").on(
      t.competentOffice,
    ),
    outcomeIdx: index("reports_outcome_idx").on(t.outcome),
    verificationStatusIdx: index("reports_verification_status_idx").on(
      t.verificationStatus,
    ),
    createdAtIdx: index("reports_created_at_idx").on(t.createdAt),
    statusCheck: check(
      "reports_status_check",
      sql`${t.status} in ('ricevuta', 'in_valutazione', 'presa_in_carico', 'archiviata')`,
    ),
    outcomeCheck: check(
      "reports_outcome_check",
      sql`${t.outcome} in ('aperta', 'risolta', 'parzialmente_risolta', 'non_risolta', 'non_verificabile', 'archiviata')`,
    ),
    verificationStatusCheck: check(
      "reports_verification_status_check",
      sql`${t.verificationStatus} in ('non_verificata', 'in_verifica', 'documentata', 'risposta_ricevuta', 'chiusa', 'archiviata', 'da_aggiornare')`,
    ),
  }),
);

export type Report = typeof reportsTable.$inferSelect;
export type InsertReport = typeof reportsTable.$inferInsert;
