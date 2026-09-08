import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  check,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";
import { sourceRecordsTable } from "./sourceRegistry";
import { canonicalSubjectsTable } from "./canonicalIdentity";

// Evidence only. Canonical domain values belong to typed domain tables.
// An assertion can exist even when no defensible subject identity is available.
export const coreAssertionsTable = pgTable(
  "core_assertions",
  {
    id: uuid("id").primaryKey(),
    sourceRecordId: uuid("source_record_id")
      .notNull()
      .references(() => sourceRecordsTable.id, { onDelete: "restrict" }),
    sourcePointer: text("source_pointer").notNull(),
    propertyKey: text("property_key").notNull(),
    assertionKind: text("assertion_kind").notNull(),
    value: jsonb("value").notNull(),
    valueState: text("value_state").notNull(),
    valueHash: text("value_hash").notNull(),
    sourceUrl: text("source_url").notNull(),
    extractorVersion: text("extractor_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("core_assertions_source_pointer_version_uq").on(
      t.sourceRecordId,
      t.sourcePointer,
      t.extractorVersion,
    ),
    unique("core_assertions_id_record_uq").on(t.id, t.sourceRecordId),
    check(
      "core_assertions_id_v7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check(
      "core_assertions_kind",
      sql`${t.assertionKind} IN ('source_stated','extracted','derived','editorial')`,
    ),
    check(
      "core_assertions_value_state",
      sql`(${t.valueState} = 'unknown' AND ${t.value} = 'null'::jsonb) OR (${t.valueState} = 'known' AND ${t.value} <> 'null'::jsonb)`,
    ),
    check("core_assertions_hash", sql`${t.valueHash} ~ '^[0-9a-f]{64}$'`),
    check("core_assertions_pointer", sql`left(${t.sourcePointer}, 1) = '/'`),
    check(
      "core_assertions_property",
      sql`${t.propertyKey} ~ '^[a-z][a-z0-9_]*[.][a-z][a-z0-9_]*$'`,
    ),
  ],
);

export const coreResolutionOutcomesTable = pgTable(
  "core_resolution_outcomes",
  {
    id: uuid("id").primaryKey(),
    sourceRecordId: uuid("source_record_id")
      .notNull()
      .references(() => sourceRecordsTable.id, { onDelete: "restrict" }),
    candidateKey: text("candidate_key").notNull(),
    assertionId: uuid("assertion_id").notNull(),
    targetSubjectId: uuid("target_subject_id").references(
      () => canonicalSubjectsTable.subjectId,
      { onDelete: "restrict" },
    ),
    status: text("status").notNull(),
    role: text("role").notNull(),
    reasonCode: text("reason_code").notNull(),
    resolverVersion: text("resolver_version").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("core_resolution_candidate_version_uq").on(
      t.sourceRecordId,
      t.candidateKey,
      t.resolverVersion,
    ),
    foreignKey({
      name: "core_resolution_assertion_record_fk",
      columns: [t.assertionId, t.sourceRecordId],
      foreignColumns: [
        coreAssertionsTable.id,
        coreAssertionsTable.sourceRecordId,
      ],
    }).onDelete("restrict"),
    index("core_resolution_target_idx").on(t.targetSubjectId),
    index("core_resolution_assertion_idx").on(t.assertionId, t.sourceRecordId),
    index("core_resolution_status_idx").on(t.status),
    check(
      "core_resolution_id_v7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check(
      "core_resolution_target_state",
      sql`(${t.status} = 'resolved' AND ${t.targetSubjectId} IS NOT NULL) OR (${t.status} IN ('unresolved','not_applicable','no_canonical_target','insufficient_evidence','review_required') AND ${t.targetSubjectId} IS NULL)`,
    ),
    check(
      "core_resolution_reason",
      sql`btrim(${t.reasonCode}) <> '' AND btrim(${t.role}) <> '' AND btrim(${t.candidateKey}) <> ''`,
    ),
  ],
);
