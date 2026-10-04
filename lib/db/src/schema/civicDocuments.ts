import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  date,
  check,
  unique,
  foreignKey,
  index,
} from "drizzle-orm/pg-core";
import { canonicalSubjectsTable } from "./canonicalIdentity";
import { sourceRecordsTable } from "./sourceRegistry";
import { coreAssertionsTable } from "./assertions";

// Identity has no mutable source description. Each acquisition is retained below.
export const documentPublicationsTable = pgTable(
  "document_publications",
  {
    subjectKind: text("subject_kind").notNull().default("event"),
    domainType: text("domain_type").notNull().default("document.publication"),
    id: uuid("id")
      .primaryKey()
      .references(() => canonicalSubjectsTable.subjectId, {
        onDelete: "restrict",
      }),
    registerKey: text("register_key").notNull(),
    publicationNumber: text("publication_number").notNull(),
  },
  (t) => [
    check(
      "document_publication_typed_kind",
      sql`${t.subjectKind} = 'event' AND ${t.domainType} = 'document.publication'`,
    ),
    foreignKey({
      name: "document_publication_typed_subject_fk",
      columns: [t.id, t.subjectKind, t.domainType],
      foreignColumns: [
        canonicalSubjectsTable.subjectId,
        canonicalSubjectsTable.subjectKind,
        canonicalSubjectsTable.domainType,
      ],
    }).onDelete("restrict"),
    unique("document_publications_register_number_uq").on(
      t.registerKey,
      t.publicationNumber,
    ),
    check(
      "document_publications_number",
      sql`${t.publicationNumber} ~ '^[0-9]{4}/[0-9]+$'`,
    ),
    check(
      "document_publications_register",
      sql`${t.registerKey} = 'it.00301390795.albo'`,
    ),
  ],
);

export const documentPublicationVersionsTable = pgTable(
  "document_publication_versions",
  {
    sourceRecordId: uuid("source_record_id")
      .primaryKey()
      .references(() => sourceRecordsTable.id, { onDelete: "restrict" }),
    publicationId: uuid("publication_id").references(
      () => documentPublicationsTable.id,
      { onDelete: "restrict" },
    ),
    sourceUrl: text("source_url").notNull(),
    title: text("title"),
    publicationStart: date("publication_start"),
    publicationEnd: date("publication_end"),
    publicVisibility: text("public_visibility").notNull(),
    policyVersion: text("policy_version"),
    resolverVersion: text("resolver_version").notNull(),
  },
  (t) => [
    index("document_publication_versions_publication_idx").on(t.publicationId),
    check(
      "document_versions_visibility",
      sql`${t.publicVisibility} IN ('publishable','metadata_only','do_not_publish')`,
    ),
    check(
      "document_versions_private_title",
      sql`${t.publicVisibility} = 'publishable' OR ${t.title} IS NULL`,
    ),
    check(
      "document_versions_dates",
      sql`${t.publicationEnd} IS NULL OR ${t.publicationStart} IS NULL OR ${t.publicationEnd} >= ${t.publicationStart}`,
    ),
  ],
);

export const documentActsTable = pgTable(
  "document_acts",
  {
    subjectKind: text("subject_kind").notNull().default("entity"),
    domainType: text("domain_type").notNull().default("document.act"),
    id: uuid("id")
      .primaryKey()
      .references(() => canonicalSubjectsTable.subjectId, {
        onDelete: "restrict",
      }),
    issuerKey: text("issuer_key").notNull(),
    office: text("office").notNull(),
    actType: text("act_type").notNull(),
    actNumber: text("act_number").notNull(),
    actDate: date("act_date").notNull(),
  },
  (t) => [
    check(
      "document_act_typed_kind",
      sql`${t.subjectKind} = 'entity' AND ${t.domainType} = 'document.act'`,
    ),
    foreignKey({
      name: "document_act_typed_subject_fk",
      columns: [t.id, t.subjectKind, t.domainType],
      foreignColumns: [
        canonicalSubjectsTable.subjectId,
        canonicalSubjectsTable.subjectKind,
        canonicalSubjectsTable.domainType,
      ],
    }).onDelete("restrict"),
    unique("document_acts_qualified_identity_uq").on(
      t.issuerKey,
      t.office,
      t.actType,
      t.actNumber,
      t.actDate,
    ),
    check(
      "document_acts_identity_nonempty",
      sql`btrim(${t.issuerKey}) <> '' AND btrim(${t.office}) <> '' AND btrim(${t.actType}) <> '' AND btrim(${t.actNumber}) <> ''`,
    ),
  ],
);

// A source URL identifies a document resource, never its bytes or a legal act.
export const documentDocumentsTable = pgTable(
  "document_documents",
  {
    subjectKind: text("subject_kind").notNull().default("entity"),
    domainType: text("domain_type").notNull().default("document.document"),
    id: uuid("id")
      .primaryKey()
      .references(() => canonicalSubjectsTable.subjectId, {
        onDelete: "restrict",
      }),
    sourceUrl: text("source_url").notNull().unique(),
  },
  (t) => [
    check(
      "document_document_typed_kind",
      sql`${t.subjectKind} = 'entity' AND ${t.domainType} = 'document.document'`,
    ),
    foreignKey({
      name: "document_document_typed_subject_fk",
      columns: [t.id, t.subjectKind, t.domainType],
      foreignColumns: [
        canonicalSubjectsTable.subjectId,
        canonicalSubjectsTable.subjectKind,
        canonicalSubjectsTable.domainType,
      ],
    }).onDelete("restrict"),
    check(
      "document_documents_source_origin",
      sql`${t.sourceUrl} ~ '^https://albo[.]tinnvision[.]cloud/'`,
    ),
  ],
);

export const documentPublicationActsTable = pgTable(
  "document_publication_acts",
  {
    sourceRecordId: uuid("source_record_id")
      .primaryKey()
      .references(() => documentPublicationVersionsTable.sourceRecordId, {
        onDelete: "restrict",
      }),
    actId: uuid("act_id")
      .notNull()
      .references(() => documentActsTable.id, { onDelete: "restrict" }),
    evidenceAssertionId: uuid("evidence_assertion_id").notNull(),
  },
  (t) => [
    foreignKey({
      name: "document_publication_acts_evidence_fk",
      columns: [t.evidenceAssertionId, t.sourceRecordId],
      foreignColumns: [
        coreAssertionsTable.id,
        coreAssertionsTable.sourceRecordId,
      ],
    }).onDelete("restrict"),
  ],
);

export const documentPublicationDocumentsTable = pgTable(
  "document_publication_documents",
  {
    sourceRecordId: uuid("source_record_id")
      .notNull()
      .references(() => documentPublicationVersionsTable.sourceRecordId, {
        onDelete: "restrict",
      }),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documentDocumentsTable.id, { onDelete: "restrict" }),
    evidenceAssertionId: uuid("evidence_assertion_id").notNull(),
    role: text("role").notNull(),
  },
  (t) => [
    unique("document_publication_documents_record_document_uq").on(
      t.sourceRecordId,
      t.documentId,
    ),
    foreignKey({
      name: "document_publication_documents_evidence_fk",
      columns: [t.evidenceAssertionId, t.sourceRecordId],
      foreignColumns: [
        coreAssertionsTable.id,
        coreAssertionsTable.sourceRecordId,
      ],
    }).onDelete("restrict"),
    check(
      "document_publication_documents_role",
      sql`${t.role} IN ('main','attachment')`,
    ),
  ],
);
