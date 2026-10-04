import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  primaryKey,
  foreignKey,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { coreAssertionsTable } from "./assertions";
import { sourceRecordsTable } from "./sourceRegistry";

export const taxonomySchemesTable = pgTable(
  "taxonomy_schemes",
  {
    schemeKey: text("scheme_key").notNull(),
    version: text("version").notNull(),
    definitionHash: text("definition_hash").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.schemeKey, t.version] }),
    check("taxonomy_schemes_hash", sql`${t.definitionHash} ~ '^[0-9a-f]{64}$'`),
  ],
);

export const taxonomyConceptsTable = pgTable(
  "taxonomy_concepts",
  {
    schemeKey: text("scheme_key").notNull(),
    version: text("version").notNull(),
    code: text("code").notNull(),
    facet: text("facet").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.schemeKey, t.version, t.code] }),
    unique("taxonomy_concepts_facet_uq").on(
      t.schemeKey,
      t.version,
      t.code,
      t.facet,
    ),
    foreignKey({
      name: "taxonomy_concepts_scheme_fk",
      columns: [t.schemeKey, t.version],
      foreignColumns: [
        taxonomySchemesTable.schemeKey,
        taxonomySchemesTable.version,
      ],
    }).onDelete("restrict"),
  ],
);

export const taxonomyClassificationsTable = pgTable(
  "taxonomy_classifications",
  {
    id: uuid("id").primaryKey(),
    sourceRecordId: uuid("source_record_id")
      .notNull()
      .references(() => sourceRecordsTable.id, { onDelete: "restrict" }),
    schemeKey: text("scheme_key").notNull(),
    version: text("version").notNull(),
    facet: text("facet").notNull(),
    conceptCode: text("concept_code"),
    status: text("status").notNull(),
    method: text("method").notNull(),
    evidenceAssertionId: uuid("evidence_assertion_id").notNull(),
  },
  (t) => [
    unique("taxonomy_classifications_record_facet_method_uq").on(
      t.sourceRecordId,
      t.schemeKey,
      t.version,
      t.facet,
      t.method,
    ),
    foreignKey({
      name: "taxonomy_classifications_scheme_fk",
      columns: [t.schemeKey, t.version],
      foreignColumns: [
        taxonomySchemesTable.schemeKey,
        taxonomySchemesTable.version,
      ],
    }).onDelete("restrict"),
    foreignKey({
      name: "taxonomy_classifications_concept_fk",
      columns: [t.schemeKey, t.version, t.conceptCode, t.facet],
      foreignColumns: [
        taxonomyConceptsTable.schemeKey,
        taxonomyConceptsTable.version,
        taxonomyConceptsTable.code,
        taxonomyConceptsTable.facet,
      ],
    }).onDelete("restrict"),
    foreignKey({
      name: "taxonomy_classifications_evidence_fk",
      columns: [t.evidenceAssertionId, t.sourceRecordId],
      foreignColumns: [
        coreAssertionsTable.id,
        coreAssertionsTable.sourceRecordId,
      ],
    }).onDelete("restrict"),
    check(
      "taxonomy_classifications_uuidv7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check(
      "taxonomy_classifications_state",
      sql`(${t.status} = 'classified' AND ${t.conceptCode} IS NOT NULL) OR (${t.status} IN ('unknown','not_applicable','insufficient_evidence','review_required') AND ${t.conceptCode} IS NULL)`,
    ),
  ],
);
