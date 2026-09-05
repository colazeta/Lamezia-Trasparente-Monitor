import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const CRIME_EVENT_RECORD_STATUSES = [
  "verified_source",
  "published",
  "superseded",
  "merged",
  "split",
  "withdrawn",
  "suppressed",
] as const;
export type CrimeEventRecordStatus =
  (typeof CRIME_EVENT_RECORD_STATUSES)[number];

export const CRIME_EVENT_FORMS = [
  "discrete",
  "continuous_episode",
  "course_of_conduct",
] as const;
export type CrimeEventForm = (typeof CRIME_EVENT_FORMS)[number];

export const CRIME_TEMPORAL_PRECISIONS = [
  "exact_datetime",
  "exact_date",
  "bounded_interval",
  "week_or_similar",
  "month",
  "year",
  "approximate",
  "unknown",
] as const;
export type CrimeTemporalPrecision =
  (typeof CRIME_TEMPORAL_PRECISIONS)[number];

export const CRIME_SOURCE_TYPES = [
  "judicial_primary",
  "law_enforcement_primary",
  "public_authority_primary",
  "news_agency",
  "press_secondary",
  "academic",
  "other",
] as const;
export type CrimeSourceType = (typeof CRIME_SOURCE_TYPES)[number];

export const CRIME_CLASSIFICATION_BASES = [
  "source_stated_legal",
  "istat_crosswalk",
  "behavioural_manual",
  "provisional",
] as const;
export type CrimeClassificationBasis =
  (typeof CRIME_CLASSIFICATION_BASES)[number];

export const CRIME_ATTEMPT_STATUSES = [
  "attempted",
  "completed",
  "not_applicable",
  "unknown",
] as const;
export type CrimeAttemptStatus = (typeof CRIME_ATTEMPT_STATUSES)[number];

export const CRIME_LOCATION_ROLES = [
  "occurrence",
  "target",
  "discovery",
  "recovery",
  "arrest",
  "search",
  "procedural",
  "other",
] as const;
export type CrimeLocationRole = (typeof CRIME_LOCATION_ROLES)[number];

export const CRIME_GEO_PRECISIONS = [
  "exact_public_site",
  "exact_address",
  "street_segment",
  "neighbourhood",
  "locality",
  "municipality",
  "unknown",
] as const;
export type CrimeGeoPrecision = (typeof CRIME_GEO_PRECISIONS)[number];

export const CRIME_LOCATION_EVIDENCE_BASES = [
  "source_stated_exact",
  "source_stated_named_site",
  "source_stated_street",
  "source_stated_neighbourhood",
  "source_stated_locality",
  "geocoder_candidate",
  "editorial_inference",
  "unknown",
] as const;
export type CrimeLocationEvidenceBasis =
  (typeof CRIME_LOCATION_EVIDENCE_BASES)[number];

export const CRIME_LOCATION_SENSITIVITIES = [
  "public_place",
  "non_sensitive",
  "private_or_sensitive",
  "unknown",
] as const;
export type CrimeLocationSensitivity =
  (typeof CRIME_LOCATION_SENSITIVITIES)[number];

export const CRIME_PUBLICATION_RISKS = [
  "low_public_site",
  "non_sensitive",
  "residential",
  "victim_linked",
  "minor_or_vulnerable",
  "sexual_offence_context",
  "unknown",
] as const;
export type CrimePublicationRisk =
  (typeof CRIME_PUBLICATION_RISKS)[number];

export const CRIME_EVENT_SOURCE_SUPPORT_ROLES = [
  "event_support",
  "classification_support",
  "location_support",
  "procedural_context",
  "corroboration",
] as const;
export type CrimeEventSourceSupportRole =
  (typeof CRIME_EVENT_SOURCE_SUPPORT_ROLES)[number];

export const CRIME_CLUSTER_COUNT_PRECISIONS = [
  "exact",
  "minimum",
  "approximate",
  "unknown",
] as const;
export type CrimeClusterCountPrecision =
  (typeof CRIME_CLUSTER_COUNT_PRECISIONS)[number];

export const CRIME_CLUSTER_RESOLUTION_STATUSES = [
  "unresolved",
  "partially_resolved",
  "resolved",
] as const;
export type CrimeClusterResolutionStatus =
  (typeof CRIME_CLUSTER_RESOLUTION_STATUSES)[number];

const UUID_V7_SQL_PATTERN =
  "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$";

export const crimeEventsTable = pgTable(
  "crime_events",
  {
    eventId: uuid("event_id").primaryKey(),
    schemaVersion: text("schema_version").notNull(),
    recordStatus: text("record_status")
      .$type<CrimeEventRecordStatus>()
      .notNull(),
    eventForm: text("event_form").$type<CrimeEventForm>().notNull(),
    title: text("title").notNull(),
    temporalStart: text("temporal_start"),
    temporalEnd: text("temporal_end"),
    temporalEdtf: text("temporal_edtf"),
    temporalPrecision: text("temporal_precision")
      .$type<CrimeTemporalPrecision>()
      .notNull(),
    // Query-only conservative bounds. They never replace the source-faithful
    // temporal representation above and may remain null when no defensible
    // calendar bound can be derived.
    temporalStartBound: date("temporal_start_bound"),
    temporalEndBound: date("temporal_end_bound"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statusIdx: index("crime_events_record_status_idx").on(t.recordStatus),
    temporalIdx: index("crime_events_temporal_bounds_idx").on(
      t.temporalStartBound,
      t.temporalEndBound,
    ),
    uuidV7Check: check(
      "crime_events_event_id_uuidv7_check",
      sql`${t.eventId}::text ~ ${UUID_V7_SQL_PATTERN}`,
    ),
    statusCheck: check(
      "crime_events_record_status_check",
      sql`${t.recordStatus} in ('verified_source','published','superseded','merged','split','withdrawn','suppressed')`,
    ),
    formCheck: check(
      "crime_events_event_form_check",
      sql`${t.eventForm} in ('discrete','continuous_episode','course_of_conduct')`,
    ),
    temporalPrecisionCheck: check(
      "crime_events_temporal_precision_check",
      sql`${t.temporalPrecision} in ('exact_datetime','exact_date','bounded_interval','week_or_similar','month','year','approximate','unknown')`,
    ),
    temporalBoundsCheck: check(
      "crime_events_temporal_bounds_order_check",
      sql`${t.temporalStartBound} is null or ${t.temporalEndBound} is null or ${t.temporalEndBound} >= ${t.temporalStartBound}`,
    ),
  }),
);

export const crimeSourcesTable = pgTable(
  "crime_sources",
  {
    sourceId: uuid("source_id").primaryKey(),
    sourceType: text("source_type").$type<CrimeSourceType>().notNull(),
    provider: text("provider").notNull(),
    title: text("title").notNull().default(""),
    url: text("url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true }),
    canonicalSourceKey: text("canonical_source_key"),
    contentSha256: text("content_sha256"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    canonicalSourceKeyIdx: index("crime_sources_canonical_source_key_idx").on(
      t.canonicalSourceKey,
    ),
    sourceTypeIdx: index("crime_sources_source_type_idx").on(t.sourceType),
    uuidV7Check: check(
      "crime_sources_source_id_uuidv7_check",
      sql`${t.sourceId}::text ~ ${UUID_V7_SQL_PATTERN}`,
    ),
    sourceTypeCheck: check(
      "crime_sources_source_type_check",
      sql`${t.sourceType} in ('judicial_primary','law_enforcement_primary','public_authority_primary','news_agency','press_secondary','academic','other')`,
    ),
    contentHashCheck: check(
      "crime_sources_content_sha256_check",
      sql`${t.contentSha256} is null or ${t.contentSha256} ~ '^[0-9a-f]{64}$'`,
    ),
  }),
);

export const crimeEventOffencesTable = pgTable(
  "crime_event_offences",
  {
    offenceInstanceId: uuid("offence_instance_id").primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => crimeEventsTable.eventId, { onDelete: "cascade" }),
    classificationSourceId: uuid("classification_source_id").references(
      () => crimeSourcesTable.sourceId,
      { onDelete: "restrict" },
    ),
    classificationBasis: text("classification_basis")
      .$type<CrimeClassificationBasis>()
      .notNull(),
    iccsCode: text("iccs_code"),
    istatCatalogueId: text("istat_catalogue_id"),
    istatSyntheticCode: text("istat_synthetic_code"),
    istatAnalyticalCode: text("istat_analytical_code"),
    legalReference: text("legal_reference"),
    attemptStatus: text("attempt_status").$type<CrimeAttemptStatus>(),
    situationalContext: jsonb("situational_context")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    cyberRelated: text("cyber_related"),
    affectedObjectCount: integer("affected_object_count"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    eventIdx: index("crime_event_offences_event_idx").on(t.eventId),
    iccsIdx: index("crime_event_offences_iccs_idx").on(t.iccsCode),
    istatCatalogueIdx: index("crime_event_offences_istat_catalogue_idx").on(
      t.istatCatalogueId,
    ),
    uuidV7Check: check(
      "crime_event_offences_id_uuidv7_check",
      sql`${t.offenceInstanceId}::text ~ ${UUID_V7_SQL_PATTERN}`,
    ),
    classificationBasisCheck: check(
      "crime_event_offences_classification_basis_check",
      sql`${t.classificationBasis} in ('source_stated_legal','istat_crosswalk','behavioural_manual','provisional')`,
    ),
    attemptStatusCheck: check(
      "crime_event_offences_attempt_status_check",
      sql`${t.attemptStatus} is null or ${t.attemptStatus} in ('attempted','completed','not_applicable','unknown')`,
    ),
    affectedObjectCountCheck: check(
      "crime_event_offences_affected_object_count_check",
      sql`${t.affectedObjectCount} is null or ${t.affectedObjectCount} >= 0`,
    ),
  }),
);

export const crimeEventLocationsTable = pgTable(
  "crime_event_locations",
  {
    locationId: uuid("location_id").primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => crimeEventsTable.eventId, { onDelete: "cascade" }),
    basisSourceId: uuid("basis_source_id").references(
      () => crimeSourcesTable.sourceId,
      { onDelete: "restrict" },
    ),
    role: text("role").$type<CrimeLocationRole>().notNull(),
    municipality: text("municipality").notNull(),
    evidenceBasis: text("evidence_basis")
      .$type<CrimeLocationEvidenceBasis>()
      .notNull(),
    evidencePrecision: text("evidence_precision")
      .$type<CrimeGeoPrecision>()
      .notNull(),
    resolvedPrecision: text("resolved_precision")
      .$type<CrimeGeoPrecision>()
      .notNull(),
    sensitivity: text("sensitivity")
      .$type<CrimeLocationSensitivity>()
      .notNull(),
    publicationRisk: text("publication_risk")
      .$type<CrimePublicationRisk>()
      .notNull(),
    // Internal canonical geometry. These columns are intentionally absent from
    // crime_public_events and must never be queried by the public API surface.
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    placeName: text("place_name"),
    neighbourhood: text("neighbourhood"),
    iccsLocationType: text("iccs_location_type"),
    streetScopeKey: text("street_scope_key"),
    neighbourhoodScopeKey: text("neighbourhood_scope_key"),
    localityScopeKey: text("locality_scope_key"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    eventRoleIdx: index("crime_event_locations_event_role_idx").on(t.eventId, t.role),
    streetScopeIdx: index("crime_event_locations_street_scope_idx").on(
      t.streetScopeKey,
    ),
    roleCheck: check(
      "crime_event_locations_role_check",
      sql`${t.role} in ('occurrence','target','discovery','recovery','arrest','search','procedural','other')`,
    ),
    evidenceBasisCheck: check(
      "crime_event_locations_evidence_basis_check",
      sql`${t.evidenceBasis} in ('source_stated_exact','source_stated_named_site','source_stated_street','source_stated_neighbourhood','source_stated_locality','geocoder_candidate','editorial_inference','unknown')`,
    ),
    evidencePrecisionCheck: check(
      "crime_event_locations_evidence_precision_check",
      sql`${t.evidencePrecision} in ('exact_public_site','exact_address','street_segment','neighbourhood','locality','municipality','unknown')`,
    ),
    resolvedPrecisionCheck: check(
      "crime_event_locations_resolved_precision_check",
      sql`${t.resolvedPrecision} in ('exact_public_site','exact_address','street_segment','neighbourhood','locality','municipality','unknown')`,
    ),
    sensitivityCheck: check(
      "crime_event_locations_sensitivity_check",
      sql`${t.sensitivity} in ('public_place','non_sensitive','private_or_sensitive','unknown')`,
    ),
    publicationRiskCheck: check(
      "crime_event_locations_publication_risk_check",
      sql`${t.publicationRisk} in ('low_public_site','non_sensitive','residential','victim_linked','minor_or_vulnerable','sexual_offence_context','unknown')`,
    ),
    coordinatePairCheck: check(
      "crime_event_locations_coordinate_pair_check",
      sql`(${t.longitude} is null and ${t.latitude} is null) or (${t.longitude} is not null and ${t.latitude} is not null)`,
    ),
    longitudeCheck: check(
      "crime_event_locations_longitude_check",
      sql`${t.longitude} is null or (${t.longitude} >= -180 and ${t.longitude} <= 180)`,
    ),
    latitudeCheck: check(
      "crime_event_locations_latitude_check",
      sql`${t.latitude} is null or (${t.latitude} >= -90 and ${t.latitude} <= 90)`,
    ),
    coarsePointCheck: check(
      "crime_event_locations_coarse_point_check",
      sql`${t.resolvedPrecision} not in ('municipality','unknown') or (${t.longitude} is null and ${t.latitude} is null)`,
    ),
  }),
);

export const crimeEventSourcesTable = pgTable(
  "crime_event_sources",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => crimeEventsTable.eventId, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => crimeSourcesTable.sourceId, { onDelete: "restrict" }),
    supportRole: text("support_role")
      .$type<CrimeEventSourceSupportRole>()
      .notNull()
      .default("event_support"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.eventId, t.sourceId, t.supportRole] }),
    sourceIdx: index("crime_event_sources_source_idx").on(t.sourceId),
    supportRoleCheck: check(
      "crime_event_sources_support_role_check",
      sql`${t.supportRole} in ('event_support','classification_support','location_support','procedural_context','corroboration')`,
    ),
  }),
);

export const crimeEventClustersTable = pgTable(
  "crime_event_clusters",
  {
    clusterId: uuid("cluster_id").primaryKey(),
    schemaVersion: text("schema_version").notNull(),
    reportedEventCount: integer("reported_event_count"),
    countPrecision: text("count_precision")
      .$type<CrimeClusterCountPrecision>()
      .notNull(),
    resolutionStatus: text("resolution_status")
      .$type<CrimeClusterResolutionStatus>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    resolutionIdx: index("crime_event_clusters_resolution_idx").on(
      t.resolutionStatus,
    ),
    uuidV7Check: check(
      "crime_event_clusters_id_uuidv7_check",
      sql`${t.clusterId}::text ~ ${UUID_V7_SQL_PATTERN}`,
    ),
    countCheck: check(
      "crime_event_clusters_reported_count_check",
      sql`${t.reportedEventCount} is null or ${t.reportedEventCount} >= 1`,
    ),
    exactCountCheck: check(
      "crime_event_clusters_exact_count_check",
      sql`${t.countPrecision} <> 'exact' or ${t.reportedEventCount} is not null`,
    ),
    countPrecisionCheck: check(
      "crime_event_clusters_count_precision_check",
      sql`${t.countPrecision} in ('exact','minimum','approximate','unknown')`,
    ),
    resolutionStatusCheck: check(
      "crime_event_clusters_resolution_status_check",
      sql`${t.resolutionStatus} in ('unresolved','partially_resolved','resolved')`,
    ),
  }),
);

export const crimeEventClusterSourcesTable = pgTable(
  "crime_event_cluster_sources",
  {
    clusterId: uuid("cluster_id")
      .notNull()
      .references(() => crimeEventClustersTable.clusterId, { onDelete: "cascade" }),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => crimeSourcesTable.sourceId, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.clusterId, t.sourceId] }),
    sourceIdx: index("crime_event_cluster_sources_source_idx").on(t.sourceId),
  }),
);

export const crimeEventClusterMembersTable = pgTable(
  "crime_event_cluster_members",
  {
    clusterId: uuid("cluster_id")
      .notNull()
      .references(() => crimeEventClustersTable.clusterId, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => crimeEventsTable.eventId, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.clusterId, t.eventId] }),
    eventIdx: index("crime_event_cluster_members_event_idx").on(t.eventId),
  }),
);

/**
 * Public read model. This table intentionally has no internal coordinate,
 * address, person or source-content columns. The future public REST/GeoJSON
 * API must read this projection rather than reconstructing public records from
 * the canonical tables at request time.
 */
export const crimePublicEventsTable = pgTable(
  "crime_public_events",
  {
    eventId: uuid("event_id")
      .primaryKey()
      .references(() => crimeEventsTable.eventId, { onDelete: "cascade" }),
    schemaVersion: text("schema_version").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    payloadSha256: text("payload_sha256").notNull(),
    publicationGateVersion: text("publication_gate_version").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    schemaIdx: index("crime_public_events_schema_version_idx").on(t.schemaVersion),
    payloadHashCheck: check(
      "crime_public_events_payload_sha256_check",
      sql`${t.payloadSha256} ~ '^[0-9a-f]{64}$'`,
    ),
    payloadObjectCheck: check(
      "crime_public_events_payload_object_check",
      sql`jsonb_typeof(${t.payload}) = 'object'`,
    ),
    payloadEventIdCheck: check(
      "crime_public_events_payload_event_id_check",
      sql`${t.payload} ->> 'event_id' = ${t.eventId}::text`,
    ),
    payloadSchemaVersionCheck: check(
      "crime_public_events_payload_schema_version_check",
      sql`${t.payload} ->> 'schema_version' = ${t.schemaVersion}`,
    ),
  }),
);

export type CrimeEvent = typeof crimeEventsTable.$inferSelect;
export type InsertCrimeEvent = typeof crimeEventsTable.$inferInsert;
export type CrimeSource = typeof crimeSourcesTable.$inferSelect;
export type InsertCrimeSource = typeof crimeSourcesTable.$inferInsert;
export type CrimeEventOffence = typeof crimeEventOffencesTable.$inferSelect;
export type InsertCrimeEventOffence = typeof crimeEventOffencesTable.$inferInsert;
export type CrimeEventLocation = typeof crimeEventLocationsTable.$inferSelect;
export type InsertCrimeEventLocation = typeof crimeEventLocationsTable.$inferInsert;
export type CrimeEventSource = typeof crimeEventSourcesTable.$inferSelect;
export type InsertCrimeEventSource = typeof crimeEventSourcesTable.$inferInsert;
export type CrimeEventCluster = typeof crimeEventClustersTable.$inferSelect;
export type InsertCrimeEventCluster = typeof crimeEventClustersTable.$inferInsert;
export type CrimeEventClusterSource =
  typeof crimeEventClusterSourcesTable.$inferSelect;
export type InsertCrimeEventClusterSource =
  typeof crimeEventClusterSourcesTable.$inferInsert;
export type CrimeEventClusterMember =
  typeof crimeEventClusterMembersTable.$inferSelect;
export type InsertCrimeEventClusterMember =
  typeof crimeEventClusterMembersTable.$inferInsert;
export type CrimePublicEvent = typeof crimePublicEventsTable.$inferSelect;
export type InsertCrimePublicEvent = typeof crimePublicEventsTable.$inferInsert;
