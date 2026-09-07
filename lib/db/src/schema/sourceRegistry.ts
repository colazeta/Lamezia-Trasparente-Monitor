import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  timestamp,
  jsonb,
  check,
  unique,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";

export const sourceSourcesTable = pgTable(
  "source_sources",
  {
    id: uuid("id").primaryKey(),
    sourceKey: text("source_key").notNull().unique(),
    title: text("title").notNull(),
    kind: text("kind").notNull(),
    upstreamUrls: jsonb("upstream_urls").$type<string[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check(
      "source_sources_id_v7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check("source_sources_kind", sql`${t.kind} = 'repository_snapshot'`),
    check(
      "source_sources_urls_array",
      sql`jsonb_typeof(${t.upstreamUrls}) = 'array'`,
    ),
  ],
);

export const sourceEndpointsTable = pgTable(
  "source_endpoints",
  {
    id: uuid("id").primaryKey(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => sourceSourcesTable.id, { onDelete: "restrict" }),
    repositoryPath: text("repository_path").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("source_endpoints_source_path_unique").on(
      t.sourceId,
      t.repositoryPath,
    ),
    check(
      "source_endpoints_id_v7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
  ],
);

export const sourceArtifactsTable = pgTable(
  "source_artifacts",
  {
    id: uuid("id").primaryKey(),
    endpointId: uuid("endpoint_id")
      .notNull()
      .references(() => sourceEndpointsTable.id, { onDelete: "restrict" }),
    byteHash: text("byte_hash").notNull(),
    byteSize: bigint("byte_size", { mode: "number" }).notNull(),
    mediaType: text("media_type").notNull(),
    contentRole: text("content_role").notNull(),
    repositoryCommit: text("repository_commit").notNull(),
    locator: text("locator").notNull(),
    // The first bounded JSON imports preserve the exact UTF-8 text in PostgreSQL.
    // Large/binary artifacts require a separate storage adapter, not this column.
    contentText: text("content_text").notNull(),
    registeredAt: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("source_artifacts_endpoint_hash_unique").on(
      t.endpointId,
      t.byteHash,
    ),
    unique("source_artifacts_id_endpoint_unique").on(t.id, t.endpointId),
    check(
      "source_artifacts_id_v7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check(
      "source_artifacts_hash",
      sql`${t.byteHash} ~ '^[0-9a-f]{64}$' AND ${t.byteHash} = encode(sha256(convert_to(${t.contentText}, 'UTF8')), 'hex')`,
    ),
    check(
      "source_artifacts_size",
      sql`${t.byteSize} = octet_length(${t.contentText}) AND ${t.byteSize} BETWEEN 1 AND 4194304`,
    ),
    check(
      "source_artifacts_commit",
      sql`${t.repositoryCommit} ~ '^[0-9a-f]{40}$'`,
    ),
    check(
      "source_artifacts_role",
      sql`${t.contentRole} IN ('public_projection', 'derived_dataset', 'source_snapshot') AND ${t.mediaType} = 'application/json'`,
    ),
  ],
);

export const sourceReleasesTable = pgTable(
  "source_releases",
  {
    id: uuid("id").primaryKey(),
    endpointId: uuid("endpoint_id").notNull(),
    artifactId: uuid("artifact_id").notNull().unique(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    collections: jsonb("collections").$type<Record<string, number>>().notNull(),
    sourceStatus: text("source_status"),
    sourceTimestampRaw: text("source_timestamp_raw"),
    importerVersion: text("importer_version").notNull(),
    registeredAt: timestamp("registered_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    foreignKey({
      name: "source_releases_artifact_endpoint_fk",
      columns: [t.artifactId, t.endpointId],
      foreignColumns: [
        sourceArtifactsTable.id,
        sourceArtifactsTable.endpointId,
      ],
    }).onDelete("restrict"),
    unique("source_releases_id_endpoint_unique").on(t.id, t.endpointId),
    index("source_releases_endpoint_idx").on(t.endpointId),
    check(
      "source_releases_id_v7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check(
      "source_releases_objects",
      sql`jsonb_typeof(${t.metadata}) = 'object' AND jsonb_typeof(${t.collections}) = 'object'`,
    ),
  ],
);

export const sourceRecordsTable = pgTable(
  "source_records",
  {
    id: uuid("id").primaryKey(),
    releaseId: uuid("release_id")
      .notNull()
      .references(() => sourceReleasesTable.id, { onDelete: "restrict" }),
    collectionKey: text("collection_key").notNull(),
    ordinal: integer("ordinal").notNull(),
    nativeKey: text("native_key"),
    recordHash: text("record_hash").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  },
  (t) => [
    unique("source_records_release_position_unique").on(
      t.releaseId,
      t.collectionKey,
      t.ordinal,
    ),
    index("source_records_native_key_idx").on(t.nativeKey),
    check(
      "source_records_id_v7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check("source_records_ordinal", sql`${t.ordinal} >= 0`),
    check("source_records_hash", sql`${t.recordHash} ~ '^[0-9a-f]{64}$'`),
    check(
      "source_records_payload_object",
      sql`jsonb_typeof(${t.payload}) = 'object'`,
    ),
  ],
);

export const sourceAcquisitionRunsTable = pgTable(
  "source_acquisition_runs",
  {
    id: uuid("id").primaryKey(),
    endpointId: uuid("endpoint_id")
      .notNull()
      .references(() => sourceEndpointsTable.id, { onDelete: "restrict" }),
    releaseId: uuid("release_id"),
    status: text("status").notNull(),
    kind: text("kind").notNull(),
    repositoryCommit: text("repository_commit").notNull(),
    recordsExpected: integer("records_expected").notNull(),
    recordsInserted: integer("records_inserted"),
    recordsVerified: integer("records_verified"),
    errorCode: text("error_code"),
    startedAt: timestamp("started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (t) => [
    foreignKey({
      name: "source_runs_release_endpoint_fk",
      columns: [t.releaseId, t.endpointId],
      foreignColumns: [sourceReleasesTable.id, sourceReleasesTable.endpointId],
    }).onDelete("restrict"),
    index("source_runs_endpoint_started_idx").on(t.endpointId, t.startedAt),
    index("source_runs_release_idx").on(t.releaseId),
    check(
      "source_runs_id_v7",
      sql`${t.id}::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`,
    ),
    check("source_runs_kind", sql`${t.kind} = 'repository_import'`),
    check("source_runs_commit", sql`${t.repositoryCommit} ~ '^[0-9a-f]{40}$'`),
    check(
      "source_runs_counts",
      sql`${t.recordsExpected} >= 0 AND (${t.recordsInserted} IS NULL OR ${t.recordsInserted} BETWEEN 0 AND ${t.recordsExpected}) AND (${t.recordsVerified} IS NULL OR ${t.recordsVerified} BETWEEN 0 AND ${t.recordsExpected})`,
    ),
    check(
      "source_runs_state",
      sql`(${t.status} = 'running' AND ${t.completedAt} IS NULL AND ${t.errorCode} IS NULL) OR (${t.status} = 'failed' AND ${t.completedAt} IS NOT NULL AND ${t.errorCode} IS NOT NULL) OR (${t.status} = 'succeeded' AND ${t.completedAt} IS NOT NULL AND ${t.errorCode} IS NULL AND ${t.releaseId} IS NOT NULL AND ${t.recordsVerified} IS NOT NULL AND ${t.recordsInserted} IS NOT NULL AND ${t.recordsVerified} = ${t.recordsExpected})`,
    ),
  ],
);
