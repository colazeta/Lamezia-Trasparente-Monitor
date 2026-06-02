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
import { contractsTable } from "./contracts";
import { attuazionePnrrProjectsTable } from "./attuazionePnrr";

// Tipo di progetto monitorato: un contratto/appalto (identificato da CIG) oppure
// un progetto di Attuazione PNRR (identificato da CUP).
export const MONITORING_SUBJECT_TYPES = ["contract", "pnrr"] as const;
export type MonitoringSubjectType = (typeof MONITORING_SUBJECT_TYPES)[number];

// Stato editoriale del report. "in_revisione" appena inviato dal cittadino,
// "pubblicato" dopo l'approvazione della redazione, "rifiutato" se scartato.
export const MONITORING_REPORT_STATUSES = [
  "in_revisione",
  "pubblicato",
  "rifiutato",
] as const;
export type MonitoringReportStatus =
  (typeof MONITORING_REPORT_STATUSES)[number];

// Giudizio sintetico di monitoraggio in stile Monithon.
export const MONITORING_ASSESSMENTS = [
  "positivo",
  "neutro",
  "critico",
] as const;
export type MonitoringAssessment = (typeof MONITORING_ASSESSMENTS)[number];

export type MonitoringReportAttachment = {
  title: string;
  url: string;
  contentType?: string | null;
};

export const monitoringReportsTable = pgTable(
  "monitoring_reports",
  {
    id: serial("id").primaryKey(),
    // Progetto monitorato: tipo + riferimento all'entità (contratto o PNRR).
    subjectType: text("subject_type").notNull(),
    contractId: integer("contract_id").references(() => contractsTable.id, {
      onDelete: "set null",
    }),
    pnrrProjectId: integer("pnrr_project_id").references(
      () => attuazionePnrrProjectsTable.id,
      { onDelete: "set null" },
    ),
    // Dati denormalizzati del progetto monitorato, così il report resta leggibile
    // anche se il record originario cambia o viene rimosso.
    subjectTitle: text("subject_title").notNull(),
    cig: text("cig"),
    cup: text("cup"),
    // Contenuto del report.
    title: text("title").notNull(),
    authorName: text("author_name"),
    // Le 3 fasi del monitoraggio civico (analisi desk, valutazione di efficacia,
    // impatto/risultati). Ogni fase è guidata da domande in stile MoniTutor lato
    // client; qui memorizziamo il testo redatto dal cittadino.
    deskAnalysis: text("desk_analysis").notNull(),
    effectivenessEvaluation: text("effectiveness_evaluation").notNull(),
    impactResults: text("impact_results").notNull(),
    // Giudizio sintetico complessivo (positivo / neutro / critico).
    overallAssessment: text("overall_assessment").notNull(),
    attachments: jsonb("attachments")
      .$type<MonitoringReportAttachment[]>()
      .notNull()
      .default([]),
    status: text("status").notNull().default("in_revisione"),
    // Nota redazionale di moderazione (motivo del rifiuto, osservazioni).
    moderationNote: text("moderation_note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
  },
  (t) => ({
    statusIdx: index("monitoring_reports_status_idx").on(t.status),
    contractIdIdx: index("monitoring_reports_contract_id_idx").on(t.contractId),
    pnrrProjectIdIdx: index("monitoring_reports_pnrr_project_id_idx").on(
      t.pnrrProjectId,
    ),
    createdAtIdx: index("monitoring_reports_created_at_idx").on(t.createdAt),
    subjectTypeCheck: check(
      "monitoring_reports_subject_type_check",
      sql`${t.subjectType} in ('contract', 'pnrr')`,
    ),
    statusCheck: check(
      "monitoring_reports_status_check",
      sql`${t.status} in ('in_revisione', 'pubblicato', 'rifiutato')`,
    ),
    assessmentCheck: check(
      "monitoring_reports_assessment_check",
      sql`${t.overallAssessment} in ('positivo', 'neutro', 'critico')`,
    ),
  }),
);

export type MonitoringReport = typeof monitoringReportsTable.$inferSelect;
export type InsertMonitoringReport =
  typeof monitoringReportsTable.$inferInsert;
