import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const SOURCE_REGISTRY_SOURCE_TYPES = [
  "official_api",
  "official_feed",
  "official_dataset",
  "official_portal",
  "institutional_document",
  "news_agency",
  "press_secondary",
  "academic",
  "other",
] as const;
export type SourceRegistrySourceType =
  (typeof SOURCE_REGISTRY_SOURCE_TYPES)[number];

export const SOURCE_COVERAGE_SCOPE_STATUSES = [
  "declared",
  "unknown",
  "not_applicable",
] as const;
export type SourceCoverageScopeStatus =
  (typeof SOURCE_COVERAGE_SCOPE_STATUSES)[number];

export const SOURCE_ENDPOINT_TRANSPORTS = [
  "https",
  "http",
  "file",
  "webhook",
  "manual",
  "other",
] as const;
export type SourceEndpointTransport =
  (typeof SOURCE_ENDPOINT_TRANSPORTS)[number];

export const SOURCE_ACQUISITION_MODES = [
  "poll",
  "snapshot",
  "stream",
  "webhook",
  "manual",
] as const;
export type SourceAcquisitionMode =
  (typeof SOURCE_ACQUISITION_MODES)[number];

export const SOURCE_RUN_KINDS = [
  "scheduled",
  "manual",
  "backfill",
  "webhook",
  "recovery",
] as const;
export type SourceRunKind = (typeof SOURCE_RUN_KINDS)[number];

export const SOURCE_RUN_STATUSES = [
  "running",
  "success",
  "partial",
  "failed",
  "not_modified",
  "skipped",
] as const;
export type SourceRunStatus = (typeof SOURCE_RUN_STATUSES)[number];

export const SOURCE_RUN_COVERAGE_STATUSES = [
  "complete_for_declared_scope",
  "partial",
  "unknown",
  "not_applicable",
] as const;
export type SourceRunCoverageStatus =
  (typeof SOURCE_RUN_COVERAGE_STATUSES)[number];

export const SOURCE_RELEASE_KEY_METHODS = [
  "source_native",
  "content_hash",
  "period_partition",
  "generated",
] as const;
export type SourceReleaseKeyMethod =
  (typeof SOURCE_RELEASE_KEY_METHODS)[number];

export const SOURCE_RELEASE_STATUSES = ["observed", "withdrawn"] as const;
export type SourceReleaseStatus = (typeof SOURCE_RELEASE_STATUSES)[number];

export const SOURCE_RECORD_KEY_METHODS = [
  "source_native",
  "composite_fields",
  "content_hash",
  "generated",
] as const;
export type SourceRecordKeyMethod =
  (typeof SOURCE_RECORD_KEY_METHODS)[number];

export const SOURCE_RECORD_STATES = [
  "active",
  "superseded",
  "removed",
] as const;
export type SourceRecordState = (typeof SOURCE_RECORD_STATES)[number];

const UUID_V7_SQL_PATTERN =
  "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$";
const SOURCE_KEY_SQL_PATTERN = "^[a-z][a-z0-9_.-]{2,127}$";
const TOKEN_SQL_PATTERN = "^[a-z][a-z0-9_.-]{0,63}$";
const NAMESPACED_TYPE_SQL_PATTERN =
  "^[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$";
const SHA256_SQL_PATTERN = "^[0-9a-f]{64}$";

/**
 * Universal identity for an external source/publisher dataset or publication
 * stream. A source is a provenance primitive, not a canonical civic Entity or
 * Event merely because it has an ID in this registry.
 */
export const sourceRegistrySourcesTable = pgTable(
  "source_registry_sources",
  {
    sourceId: uuid("source_id").primaryKey(),
    sourceKey: text("source_key").notNull().unique(),
    sourceType: text("source_type").$type<SourceRegistrySourceType>().notNull(),
    publisherName: text("publisher_name").notNull(),
    coverageScopeStatus: text("coverage_scope_status")
      .$type<SourceCoverageScopeStatus>()
      .notNull(),
    coverageScope: text("coverage_scope"),
    active: boolean("active").notNull().default(true),
    registeredAt: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    uuidV7Check: check(
      "source_registry_sources_id_uuidv7_check",
      sql`${t.sourceId}::text ~ ${UUID_V7_SQL_PATTERN}`,
    ),
    sourceKeyCheck: check(
      "source_registry_sources_key_check",
      sql`${t.sourceKey} ~ ${SOURCE_KEY_SQL_PATTERN}`,
    ),
    sourceTypeCheck: check(
      "source_registry_sources_type_check",
      sql`${t.sourceType} in ('official_api','official_feed','official_dataset','official_portal','institutional_document','news_agency','press_secondary','academic','other')`,
    ),
    publisherCheck: check(
      "source_registry_sources_publisher_check",
      sql`btrim(${t.publisherName}) <> ''`,
    ),
    coverageStatusCheck: check(
      "source_registry_sources_coverage_status_check",
      sql`${t.coverageScopeStatus} in ('declared','unknown','not_applicable')`,
    ),
    coverageScopeConsistencyCheck: check(
      "source_registry_sources_coverage_scope_consistency_check",
      sql`(${t.coverageScopeStatus} = 'declared' and ${t.coverageScope} is not null and btrim(${t.coverageScope}) <> '') or (${t.coverageScopeStatus} <> 'declared' and ${t.coverageScope} is null)`,
    ),
  }),
);

/**
 * One technical acquisition endpoint/resource for a source. Source identity is
 * deliberately separate because one source may expose several APIs, feeds,
 * files or webhook channels over time.
 */
export const sourceRegistryEndpointsTable = pgTable(
  "source_registry_endpoints",
  {
    endpointId: uuid("endpoint_id").primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sourceRegistrySourcesTable.sourceId, {
        onDelete: "restrict",
      }),
    endpointKey: text("endpoint_key").notNull(),
    transport: text("transport").$type<SourceEndpointTransport>().notNull(),
    acquisitionMode: text("acquisition_mode")
      .$type<SourceAcquisitionMode>()
      .notNull(),
    locator: text("locator").notNull(),
    httpMethod: text("http_method"),
    format: text("format"),
    mediaType: text("media_type"),
    coverageScopeStatus: text("coverage_scope_status")
      .$type<SourceCoverageScopeStatus>()
      .notNull(),
    coverageScope: text("coverage_scope"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sourceKeyUnique: uniqueIndex("source_registry_endpoints_source_key_uq").on(
      t.sourceId,
      t.endpointKey,
    ),
    sourceEndpointUnique: uniqueIndex(
      "source_registry_endpoints_source_endpoint_uq",
    ).on(t.sourceId, t.endpointId),
    sourceIdx: index("source_registry_endpoints_source_idx").on(t.sourceId),
    uuidV7Check: check(
      "source_registry_endpoints_id_uuidv7_check",
      sql`${t.endpointId}::text ~ ${UUID_V7_SQL_PATTERN}`,
    ),
    endpointKeyCheck: check(
      "source_registry_endpoints_key_check",
      sql`${t.endpointKey} ~ ${TOKEN_SQL_PATTERN}`,
    ),
    transportCheck: check(
      "source_registry_endpoints_transport_check",
      sql`${t.transport} in ('https','http','file','webhook','manual','other')`,
    ),
    acquisitionModeCheck: check(
      "source_registry_endpoints_acquisition_mode_check",
      sql`${t.acquisitionMode} in ('poll','snapshot','stream','webhook','manual')`,
    ),
    locatorCheck: check(
      "source_registry_endpoints_locator_check",
      sql`btrim(${t.locator}) <> ''`,
    ),
    httpMethodCheck: check(
      "source_registry_endpoints_http_method_check",
      sql`((${t.transport} in ('https','http')) and ${t.httpMethod} in ('GET','POST','HEAD')) or ((${t.transport} not in ('https','http')) and ${t.httpMethod} is null)`,
    ),
    coverageStatusCheck: check(
      "source_registry_endpoints_coverage_status_check",
      sql`${t.coverageScopeStatus} in ('declared','unknown','not_applicable')`,
    ),
    coverageScopeConsistencyCheck: check(
      "source_registry_endpoints_coverage_scope_consistency_check",
      sql`(${t.coverageScopeStatus} = 'declared' and ${t.coverageScope} is not null and btrim(${t.coverageScope}) <> '') or (${t.coverageScopeStatus} <> 'declared' and ${t.coverageScope} is null)`,
    ),
  }),
);

/**
 * One ingestion attempt. Metrics are nullable by design: NULL means the pipeline
 * did not measure that quantity; zero means it measured the quantity and found
 * zero. This distinction is required for research-grade coverage statements.
 */
export const sourceAcquisitionRunsTable = pgTable(
  "source_acquisition_runs",
  {
    runId: uuid("run_id").primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sourceRegistrySourcesTable.sourceId, {
        onDelete: "restrict",
      }),
    endpointId: uuid("endpoint_id").references(
      () => sourceRegistryEndpointsTable.endpointId,
      { onDelete: "restrict" },
    ),
    runKind: text("run_kind").$type<SourceRunKind>().notNull(),
    status: text("status").$type<SourceRunStatus>().notNull(),
    pipelineVersion: text("pipeline_version").notNull(),
    parserVersion: text("parser_version"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    coverageStatus: text("coverage_status")
      .$type<SourceRunCoverageStatus>()
      .notNull(),
    coverageStart: timestamp("coverage_start", { withTimezone: true }),
    coverageEnd: timestamp("coverage_end", { withTimezone: true }),
    recordsObserved: integer("records_observed"),
    recordsAcquired: integer("records_acquired"),
    recordsParseable: integer("records_parseable"),
    recordsFailed: integer("records_failed"),
    recordsNew: integer("records_new"),
    recordsChanged: integer("records_changed"),
    recordsRemoved: integer("records_removed"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sourceRunUnique: uniqueIndex("source_acquisition_runs_source_run_uq").on(
      t.sourceId,
      t.runId,
    ),
    sourceStartedIdx: index("source_acquisition_runs_source_started_idx").on(
      t.sourceId,
      t.startedAt,
    ),
    endpointStartedIdx: index("source_acquisition_runs_endpoint_started_idx").on(
      t.endpointId,
      t.startedAt,
    ),
    uuidV7Check: check(
      "source_acquisition_runs_id_uuidv7_check",
      sql`${t.runId}::text ~ ${UUID_V7_SQL_PATTERN}`,
    ),
    runKindCheck: check(
      "source_acquisition_runs_kind_check",
      sql`${t.runKind} in ('scheduled','manual','backfill','webhook','recovery')`,
    ),
    statusCheck: check(
      "source_acquisition_runs_status_check",
      sql`${t.status} in ('running','success','partial','failed','not_modified','skipped')`,
    ),
    pipelineVersionCheck: check(
      "source_acquisition_runs_pipeline_version_check",
      sql`btrim(${t.pipelineVersion}) <> ''`,
    ),
    lifecycleCheck: check(
      "source_acquisition_runs_lifecycle_check",
      sql`(${t.status} = 'running' and ${t.finishedAt} is null) or (${t.status} <> 'running' and ${t.finishedAt} is not null and ${t.finishedAt} >= ${t.startedAt})`,
    ),
    coverageStatusCheck: check(
      "source_acquisition_runs_coverage_status_check",
      sql`${t.coverageStatus} in ('complete_for_declared_scope','partial','unknown','not_applicable')`,
    ),
    coverageWindowCheck: check(
      "source_acquisition_runs_coverage_window_check",
      sql`${t.coverageStart} is null or ${t.coverageEnd} is null or ${t.coverageEnd} >= ${t.coverageStart}`,
    ),
    observedCountCheck: check(
      "source_acquisition_runs_observed_count_check",
      sql`${t.recordsObserved} is null or ${t.recordsObserved} >= 0`,
    ),
    acquiredCountCheck: check(
      "source_acquisition_runs_acquired_count_check",
      sql`${t.recordsAcquired} is null or ${t.recordsAcquired} >= 0`,
    ),
    parseableCountCheck: check(
      "source_acquisition_runs_parseable_count_check",
      sql`${t.recordsParseable} is null or ${t.recordsParseable} >= 0`,
    ),
    failedCountCheck: check(
      "source_acquisition_runs_failed_count_check",
      sql`${t.recordsFailed} is null or ${t.recordsFailed} >= 0`,
    ),
    newCountCheck: check(
      "source_acquisition_runs_new_count_check",
      sql`${t.recordsNew} is null or ${t.recordsNew} >= 0`,
    ),
    changedCountCheck: check(
      "source_acquisition_runs_changed_count_check",
      sql`${t.recordsChanged} is null or ${t.recordsChanged} >= 0`,
    ),
    removedCountCheck: check(
      "source_acquisition_runs_removed_count_check",
      sql`${t.recordsRemoved} is null or ${t.recordsRemoved} >= 0`,
    ),
    endpointSourceFk: foreignKey({
      name: "source_acquisition_runs_endpoint_source_fk",
      columns: [t.sourceId, t.endpointId],
      foreignColumns: [
        sourceRegistryEndpointsTable.sourceId,
        sourceRegistryEndpointsTable.endpointId,
      ],
    }),
  }),
);

/**
 * Source-native or deterministic logical release/version observed by one run.
 * Binary bytes are intentionally absent; physical artifact registration is
 * Phase 4.
 */
export const sourceReleasesTable = pgTable(
  "source_releases",
  {
    releaseId: uuid("release_id").primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sourceRegistrySourcesTable.sourceId, {
        onDelete: "restrict",
      }),
    acquisitionRunId: uuid("acquisition_run_id").notNull(),
    releaseKey: text("release_key").notNull(),
    releaseKeyMethod: text("release_key_method")
      .$type<SourceReleaseKeyMethod>()
      .notNull(),
    sourceNativeVersion: text("source_native_version"),
    sourcePublishedAt: timestamp("source_published_at", { withTimezone: true }),
    observedAt: timestamp("observed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    contentSha256: text("content_sha256"),
    status: text("status").$type<SourceReleaseStatus>().notNull().default("observed"),
  },
  (t) => ({
    sourceReleaseKeyUnique: uniqueIndex("source_releases_source_key_uq").on(
      t.sourceId,
      t.releaseKey,
    ),
    sourceReleaseUnique: uniqueIndex("source_releases_source_release_uq").on(
      t.sourceId,
      t.releaseId,
    ),
    sourceObservedIdx: index("source_releases_source_observed_idx").on(
      t.sourceId,
      t.observedAt,
    ),
    uuidV7Check: check(
      "source_releases_id_uuidv7_check",
      sql`${t.releaseId}::text ~ ${UUID_V7_SQL_PATTERN}`,
    ),
    releaseKeyCheck: check(
      "source_releases_key_check",
      sql`btrim(${t.releaseKey}) <> ''`,
    ),
    releaseKeyMethodCheck: check(
      "source_releases_key_method_check",
      sql`${t.releaseKeyMethod} in ('source_native','content_hash','period_partition','generated')`,
    ),
    contentHashCheck: check(
      "source_releases_content_sha256_check",
      sql`${t.contentSha256} is null or ${t.contentSha256} ~ ${SHA256_SQL_PATTERN}`,
    ),
    statusCheck: check(
      "source_releases_status_check",
      sql`${t.status} in ('observed','withdrawn')`,
    ),
    runSourceFk: foreignKey({
      name: "source_releases_run_source_fk",
      columns: [t.sourceId, t.acquisitionRunId],
      foreignColumns: [
        sourceAcquisitionRunsTable.sourceId,
        sourceAcquisitionRunsTable.runId,
      ],
    }),
  }),
);

/**
 * Historised source-record versions. A content change closes the current row and
 * creates a new active row with the same record_key. `last_seen_at` and
 * `last_verified_run_id` may advance when an unchanged record is re-verified;
 * the content fingerprint and source-faithful version row are never overwritten.
 */
export const sourceRecordsTable = pgTable(
  "source_records",
  {
    sourceRecordId: uuid("source_record_id").primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sourceRegistrySourcesTable.sourceId, {
        onDelete: "restrict",
      }),
    releaseId: uuid("release_id"),
    firstObservedRunId: uuid("first_observed_run_id").notNull(),
    lastVerifiedRunId: uuid("last_verified_run_id").notNull(),
    recordKey: text("record_key").notNull(),
    recordKeyMethod: text("record_key_method")
      .$type<SourceRecordKeyMethod>()
      .notNull(),
    sourceNativeId: text("source_native_id"),
    recordKind: text("record_kind").notNull(),
    contentSha256: text("content_sha256").notNull(),
    state: text("state").$type<SourceRecordState>().notNull().default("active"),
    validFrom: timestamp("valid_from", { withTimezone: true })
      .notNull()
      .defaultNow(),
    validTo: timestamp("valid_to", { withTimezone: true }),
    sourcePublishedAt: timestamp("source_published_at", { withTimezone: true }),
    sourceModifiedAt: timestamp("source_modified_at", { withTimezone: true }),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    activeRecordUnique: uniqueIndex("source_records_active_key_uq")
      .on(t.sourceId, t.recordKey)
      .where(sql`${t.validTo} is null`),
    historyIdx: index("source_records_history_idx").on(
      t.sourceId,
      t.recordKey,
      t.validFrom,
    ),
    contentHashIdx: index("source_records_content_sha256_idx").on(
      t.contentSha256,
    ),
    uuidV7Check: check(
      "source_records_id_uuidv7_check",
      sql`${t.sourceRecordId}::text ~ ${UUID_V7_SQL_PATTERN}`,
    ),
    recordKeyCheck: check(
      "source_records_key_check",
      sql`btrim(${t.recordKey}) <> ''`,
    ),
    recordKeyMethodCheck: check(
      "source_records_key_method_check",
      sql`${t.recordKeyMethod} in ('source_native','composite_fields','content_hash','generated')`,
    ),
    recordKindCheck: check(
      "source_records_kind_check",
      sql`${t.recordKind} ~ ${NAMESPACED_TYPE_SQL_PATTERN}`,
    ),
    contentHashCheck: check(
      "source_records_content_sha256_check",
      sql`${t.contentSha256} ~ ${SHA256_SQL_PATTERN}`,
    ),
    stateCheck: check(
      "source_records_state_check",
      sql`${t.state} in ('active','superseded','removed')`,
    ),
    stateValidityCheck: check(
      "source_records_state_validity_check",
      sql`(${t.state} = 'active' and ${t.validTo} is null) or (${t.state} in ('superseded','removed') and ${t.validTo} is not null)`,
    ),
    validityOrderCheck: check(
      "source_records_validity_order_check",
      sql`${t.validTo} is null or ${t.validTo} >= ${t.validFrom}`,
    ),
    seenOrderCheck: check(
      "source_records_seen_order_check",
      sql`${t.lastSeenAt} >= ${t.firstSeenAt}`,
    ),
    firstRunSourceFk: foreignKey({
      name: "source_records_first_run_source_fk",
      columns: [t.sourceId, t.firstObservedRunId],
      foreignColumns: [
        sourceAcquisitionRunsTable.sourceId,
        sourceAcquisitionRunsTable.runId,
      ],
    }),
    lastRunSourceFk: foreignKey({
      name: "source_records_last_run_source_fk",
      columns: [t.sourceId, t.lastVerifiedRunId],
      foreignColumns: [
        sourceAcquisitionRunsTable.sourceId,
        sourceAcquisitionRunsTable.runId,
      ],
    }),
    releaseSourceFk: foreignKey({
      name: "source_records_release_source_fk",
      columns: [t.sourceId, t.releaseId],
      foreignColumns: [sourceReleasesTable.sourceId, sourceReleasesTable.releaseId],
    }),
  }),
);

export type SourceRegistrySource = typeof sourceRegistrySourcesTable.$inferSelect;
export type InsertSourceRegistrySource = typeof sourceRegistrySourcesTable.$inferInsert;
export type SourceRegistryEndpoint = typeof sourceRegistryEndpointsTable.$inferSelect;
export type InsertSourceRegistryEndpoint = typeof sourceRegistryEndpointsTable.$inferInsert;
export type SourceAcquisitionRun = typeof sourceAcquisitionRunsTable.$inferSelect;
export type InsertSourceAcquisitionRun = typeof sourceAcquisitionRunsTable.$inferInsert;
export type SourceRelease = typeof sourceReleasesTable.$inferSelect;
export type InsertSourceRelease = typeof sourceReleasesTable.$inferInsert;
export type SourceRecord = typeof sourceRecordsTable.$inferSelect;
export type InsertSourceRecord = typeof sourceRecordsTable.$inferInsert;
