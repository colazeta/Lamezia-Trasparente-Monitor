import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  date,
  numeric,
  unique,
  foreignKey,
  check,
} from "drizzle-orm/pg-core";
import { canonicalSubjectsTable } from "./canonicalIdentity";
import { coreAssertionsTable } from "./assertions";
import { sourceRecordsTable } from "./sourceRegistry";

// These typed objects require explicit evidence. A CIG mention creates none of them.
export const procurementProceduresTable = pgTable(
  "procurement_procedures",
  {
    subjectKind: text("subject_kind").notNull().default("entity"),
    domainType: text("domain_type").notNull().default("procurement.procedure"),
    id: uuid("id")
      .primaryKey()
      .references(() => canonicalSubjectsTable.subjectId, {
        onDelete: "restrict",
      }),
    authorityKey: text("authority_key").notNull(),
    sourceIdentifier: text("source_identifier").notNull(),
    evidenceAssertionId: uuid("evidence_assertion_id")
      .notNull()
      .references(() => coreAssertionsTable.id, { onDelete: "restrict" }),
  },
  (t) => [
    check(
      "procurement_procedure_typed_kind",
      sql`${t.subjectKind} = 'entity' AND ${t.domainType} = 'procurement.procedure'`,
    ),
    foreignKey({
      name: "procurement_procedure_typed_subject_fk",
      columns: [t.id, t.subjectKind, t.domainType],
      foreignColumns: [
        canonicalSubjectsTable.subjectId,
        canonicalSubjectsTable.subjectKind,
        canonicalSubjectsTable.domainType,
      ],
    }).onDelete("restrict"),
    check(
      "procurement_procedures_identity_nonempty",
      sql`btrim(${t.authorityKey}) <> '' AND btrim(${t.sourceIdentifier}) <> ''`,
    ),
    unique("procurement_procedures_qualified_identity_uq").on(
      t.authorityKey,
      t.sourceIdentifier,
    ),
  ],
);

export const procurementLotsTable = pgTable(
  "procurement_lots",
  {
    subjectKind: text("subject_kind").notNull().default("entity"),
    domainType: text("domain_type").notNull().default("procurement.lot"),
    id: uuid("id")
      .primaryKey()
      .references(() => canonicalSubjectsTable.subjectId, {
        onDelete: "restrict",
      }),
    procedureId: uuid("procedure_id")
      .notNull()
      .references(() => procurementProceduresTable.id, {
        onDelete: "restrict",
      }),
    lotNumber: text("lot_number").notNull(),
    cig: text("cig").unique(),
    evidenceAssertionId: uuid("evidence_assertion_id")
      .notNull()
      .references(() => coreAssertionsTable.id, { onDelete: "restrict" }),
  },
  (t) => [
    check(
      "procurement_lot_typed_kind",
      sql`${t.subjectKind} = 'entity' AND ${t.domainType} = 'procurement.lot'`,
    ),
    foreignKey({
      name: "procurement_lot_typed_subject_fk",
      columns: [t.id, t.subjectKind, t.domainType],
      foreignColumns: [
        canonicalSubjectsTable.subjectId,
        canonicalSubjectsTable.subjectKind,
        canonicalSubjectsTable.domainType,
      ],
    }).onDelete("restrict"),
    check("procurement_lots_number_nonempty", sql`btrim(${t.lotNumber}) <> ''`),
    unique("procurement_lots_procedure_number_uq").on(
      t.procedureId,
      t.lotNumber,
    ),
    check(
      "procurement_lots_cig",
      sql`${t.cig} IS NULL OR ${t.cig} ~ '^([0-9]{7}[A-F0-9]{3}|[A-UXYZ][A-F0-9]{9})$'`,
    ),
  ],
);

export const procurementContractsTable = pgTable(
  "procurement_contracts",
  {
    subjectKind: text("subject_kind").notNull().default("entity"),
    domainType: text("domain_type").notNull().default("procurement.contract"),
    id: uuid("id")
      .primaryKey()
      .references(() => canonicalSubjectsTable.subjectId, {
        onDelete: "restrict",
      }),
    lotId: uuid("lot_id")
      .notNull()
      .references(() => procurementLotsTable.id, { onDelete: "restrict" }),
    sourceIdentifier: text("source_identifier").notNull(),
    signedOn: date("signed_on"),
    evidenceAssertionId: uuid("evidence_assertion_id")
      .notNull()
      .references(() => coreAssertionsTable.id, { onDelete: "restrict" }),
  },
  (t) => [
    check(
      "procurement_contract_typed_kind",
      sql`${t.subjectKind} = 'entity' AND ${t.domainType} = 'procurement.contract'`,
    ),
    foreignKey({
      name: "procurement_contract_typed_subject_fk",
      columns: [t.id, t.subjectKind, t.domainType],
      foreignColumns: [
        canonicalSubjectsTable.subjectId,
        canonicalSubjectsTable.subjectKind,
        canonicalSubjectsTable.domainType,
      ],
    }).onDelete("restrict"),
    check(
      "procurement_contracts_identifier_nonempty",
      sql`btrim(${t.sourceIdentifier}) <> ''`,
    ),
    unique("procurement_contracts_lot_identifier_uq").on(
      t.lotId,
      t.sourceIdentifier,
    ),
  ],
);

export const procurementFinancialEventsTable = pgTable(
  "procurement_financial_events",
  {
    subjectKind: text("subject_kind").notNull().default("event"),
    domainType: text("domain_type")
      .notNull()
      .default("procurement.financial_event"),
    id: uuid("id")
      .primaryKey()
      .references(() => canonicalSubjectsTable.subjectId, {
        onDelete: "restrict",
      }),
    contractId: uuid("contract_id")
      .notNull()
      .references(() => procurementContractsTable.id, { onDelete: "restrict" }),
    eventKind: text("event_kind").notNull(),
    amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
    currency: text("currency").notNull(),
    occurredOn: date("occurred_on"),
    evidenceAssertionId: uuid("evidence_assertion_id")
      .notNull()
      .references(() => coreAssertionsTable.id, { onDelete: "restrict" }),
  },
  (t) => [
    check(
      "procurement_financial_event_typed_kind",
      sql`${t.subjectKind} = 'event' AND ${t.domainType} = 'procurement.financial_event'`,
    ),
    foreignKey({
      name: "procurement_financial_event_typed_subject_fk",
      columns: [t.id, t.subjectKind, t.domainType],
      foreignColumns: [
        canonicalSubjectsTable.subjectId,
        canonicalSubjectsTable.subjectKind,
        canonicalSubjectsTable.domainType,
      ],
    }).onDelete("restrict"),
    check(
      "procurement_financial_events_amount_sign",
      sql`(${t.eventKind} = 'reversal' AND ${t.amount} <= 0) OR (${t.eventKind} <> 'reversal' AND ${t.amount} >= 0)`,
    ),
    check(
      "procurement_financial_events_kind",
      sql`${t.eventKind} IN ('commitment','liquidation','payment','reversal')`,
    ),
    check(
      "procurement_financial_events_currency",
      sql`${t.currency} ~ '^[A-Z]{3}$'`,
    ),
  ],
);

export const procurementMentionsTable = pgTable(
  "procurement_mentions",
  {
    id: uuid("id").primaryKey(),
    sourceRecordId: uuid("source_record_id")
      .notNull()
      .references(() => sourceRecordsTable.id, { onDelete: "restrict" }),
    candidateKey: text("candidate_key").notNull(),
    cig: text("cig"),
    relevance: text("relevance").notNull(),
    phase: text("phase").notNull(),
    evidenceAssertionId: uuid("evidence_assertion_id").notNull(),
  },
  (t) => [
    unique("procurement_mentions_record_candidate_uq").on(
      t.sourceRecordId,
      t.candidateKey,
    ),
    foreignKey({
      name: "procurement_mentions_evidence_fk",
      columns: [t.evidenceAssertionId, t.sourceRecordId],
      foreignColumns: [
        coreAssertionsTable.id,
        coreAssertionsTable.sourceRecordId,
      ],
    }).onDelete("restrict"),
    check(
      "procurement_mentions_uuidv7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check(
      "procurement_mentions_phase",
      sql`${t.phase} IN ('programmazione','gara','affidamento','esecuzione','pagamento','conclusione','unknown','not_applicable')`,
    ),
    check(
      "procurement_mentions_relevance",
      sql`${t.relevance} IN ('possible','confirmed')`,
    ),
  ],
);
