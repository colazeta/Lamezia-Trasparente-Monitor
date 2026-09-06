import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const CANONICAL_SUBJECT_KINDS = ["entity", "event"] as const;
export type CanonicalSubjectKind = (typeof CANONICAL_SUBJECT_KINDS)[number];

export const LEGACY_SUBJECT_MAPPING_STATUSES = ["active", "superseded"] as const;
export type LegacySubjectMappingStatus =
  (typeof LEGACY_SUBJECT_MAPPING_STATUSES)[number];

export const UUID_V7_SQL_PATTERN =
  "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$";

export const CANONICAL_DOMAIN_TYPE_SQL_PATTERN =
  "^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$";

const LEGACY_TOKEN_SQL_PATTERN = "^[a-z][a-z0-9_.-]{0,63}$";

/**
 * Universal cross-domain addressability spine.
 *
 * This table does not contain domain facts. A row says only that one globally
 * addressable subject exists, whether it is an Entity or an Event, and which
 * typed domain namespace owns its semantics (for example `party.person`,
 * `procurement.contract` or `crime.event`). Typed domain tables remain the
 * authoritative model for what that subject actually is.
 */
export const canonicalSubjectsTable = pgTable(
  "canonical_subjects",
  {
    subjectId: uuid("subject_id").primaryKey(),
    subjectKind: text("subject_kind").$type<CanonicalSubjectKind>().notNull(),
    domainType: text("domain_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    kindDomainIdx: index("canonical_subjects_kind_domain_idx").on(
      t.subjectKind,
      t.domainType,
    ),
    uuidV7Check: check(
      "canonical_subjects_subject_id_uuidv7_check",
      sql`${t.subjectId}::text ~ ${UUID_V7_SQL_PATTERN}`,
    ),
    subjectKindCheck: check(
      "canonical_subjects_subject_kind_check",
      sql`${t.subjectKind} in ('entity','event')`,
    ),
    domainTypeCheck: check(
      "canonical_subjects_domain_type_check",
      sql`${t.domainType} ~ ${CANONICAL_DOMAIN_TYPE_SQL_PATTERN}`,
    ),
  }),
);

/**
 * Historised bridge from a legacy local identity to the universal subject ID.
 *
 * Corrections never overwrite a previous decision: the old mapping is closed
 * (`mapping_status = superseded`, `valid_to != null`) and a new active mapping
 * is inserted. A partial unique index permits exactly one active mapping for a
 * given legacy namespace/type/id while retaining the full history.
 */
export const legacySubjectMapTable = pgTable(
  "legacy_subject_map",
  {
    mappingId: serial("mapping_id").primaryKey(),
    legacyNamespace: text("legacy_namespace").notNull(),
    legacyType: text("legacy_type").notNull(),
    legacyId: text("legacy_id").notNull(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => canonicalSubjectsTable.subjectId, {
        onDelete: "restrict",
      }),
    resolutionMethod: text("resolution_method").notNull(),
    mappingStatus: text("mapping_status")
      .$type<LegacySubjectMappingStatus>()
      .notNull()
      .default("active"),
    validFrom: timestamp("valid_from", { withTimezone: true })
      .notNull()
      .defaultNow(),
    validTo: timestamp("valid_to", { withTimezone: true }),
  },
  (t) => ({
    activeIdentityUnique: uniqueIndex("legacy_subject_map_active_identity_uq")
      .on(t.legacyNamespace, t.legacyType, t.legacyId)
      .where(sql`${t.validTo} is null`),
    subjectIdx: index("legacy_subject_map_subject_idx").on(t.subjectId),
    historyIdx: index("legacy_subject_map_history_idx").on(
      t.legacyNamespace,
      t.legacyType,
      t.legacyId,
      t.validFrom,
    ),
    namespaceCheck: check(
      "legacy_subject_map_namespace_check",
      sql`${t.legacyNamespace} ~ ${LEGACY_TOKEN_SQL_PATTERN}`,
    ),
    typeCheck: check(
      "legacy_subject_map_type_check",
      sql`${t.legacyType} ~ ${LEGACY_TOKEN_SQL_PATTERN}`,
    ),
    legacyIdCheck: check(
      "legacy_subject_map_legacy_id_check",
      sql`btrim(${t.legacyId}) <> ''`,
    ),
    resolutionMethodCheck: check(
      "legacy_subject_map_resolution_method_check",
      sql`${t.resolutionMethod} ~ ${LEGACY_TOKEN_SQL_PATTERN}`,
    ),
    mappingStatusCheck: check(
      "legacy_subject_map_status_check",
      sql`${t.mappingStatus} in ('active','superseded')`,
    ),
    statusValidityCheck: check(
      "legacy_subject_map_status_validity_check",
      sql`(${t.mappingStatus} = 'active' and ${t.validTo} is null) or (${t.mappingStatus} = 'superseded' and ${t.validTo} is not null)`,
    ),
    validityOrderCheck: check(
      "legacy_subject_map_validity_order_check",
      sql`${t.validTo} is null or ${t.validTo} >= ${t.validFrom}`,
    ),
  }),
);

export type CanonicalSubject = typeof canonicalSubjectsTable.$inferSelect;
export type InsertCanonicalSubject = typeof canonicalSubjectsTable.$inferInsert;
export type LegacySubjectMapping = typeof legacySubjectMapTable.$inferSelect;
export type InsertLegacySubjectMapping = typeof legacySubjectMapTable.$inferInsert;
