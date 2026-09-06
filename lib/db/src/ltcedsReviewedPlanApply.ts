import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { eq, inArray } from "drizzle-orm";

import {
  assertAttestedReviewedPlan,
  classifyReviewedPublicAction,
  shouldWriteReviewedPublicProjection,
  type AttestedReviewedPlan,
  type ReviewedPublicAction,
} from "./ltcedsReviewedPlanApplyCore";
import * as crimeSchema from "./schema/crimeEvents";

export type LtcedsReviewedDatabase = typeof import("./client").db;

export interface ReviewedPlanApplyReport {
  eventId: string;
  bundleSha256: string;
  canonicalWrite: "upserted";
  sourceIds: string[];
  gates: AttestedReviewedPlan["gates"];
  selectedAnchorIds: string[];
  publicPayloadSha256: string | null;
  publicAction: ReviewedPublicAction;
}

function requiredDate(value: string, label: string): Date {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) throw new Error(`${label} must be a date-time`);
  return parsed;
}

function optionalDate(value: string | null, label: string): Date | null {
  return value === null ? null : requiredDate(value, label);
}

export async function applyLtcedsReviewedPlan(
  rawPlan: unknown,
  db: LtcedsReviewedDatabase,
): Promise<ReviewedPlanApplyReport> {
  assertAttestedReviewedPlan(rawPlan);
  const plan = rawPlan;

  return db.transaction(async (tx) => {
    const existingEvents = await tx
      .select({
        eventId: crimeSchema.crimeEventsTable.eventId,
        eventForm: crimeSchema.crimeEventsTable.eventForm,
      })
      .from(crimeSchema.crimeEventsTable)
      .where(eq(crimeSchema.crimeEventsTable.eventId, plan.event_id))
      .limit(1);
    const existingEvent = existingEvents[0];
    if (existingEvent && existingEvent.eventForm !== plan.canonical.event.eventForm) {
      throw new Error(
        `event identity collision: ${plan.event_id} already exists with event_form=${existingEvent.eventForm}`,
      );
    }

    for (const source of plan.canonical.sources) {
      const existingSources = await tx
        .select({
          sourceId: crimeSchema.crimeSourcesTable.sourceId,
          sourceType: crimeSchema.crimeSourcesTable.sourceType,
          canonicalSourceKey: crimeSchema.crimeSourcesTable.canonicalSourceKey,
        })
        .from(crimeSchema.crimeSourcesTable)
        .where(eq(crimeSchema.crimeSourcesTable.sourceId, source.sourceId))
        .limit(1);
      const existingSource = existingSources[0];
      if (existingSource && existingSource.sourceType !== source.sourceType) {
        throw new Error(
          `source identity collision: ${source.sourceId} changes source_type from ${existingSource.sourceType} to ${source.sourceType}`,
        );
      }
      if (
        existingSource?.canonicalSourceKey &&
        existingSource.canonicalSourceKey !== source.canonicalSourceKey
      ) {
        throw new Error(
          `source identity collision: ${source.sourceId} changes canonical_source_key`,
        );
      }
      if (source.canonicalSourceKey) {
        const sameKey = await tx
          .select({ sourceId: crimeSchema.crimeSourcesTable.sourceId })
          .from(crimeSchema.crimeSourcesTable)
          .where(
            eq(
              crimeSchema.crimeSourcesTable.canonicalSourceKey,
              source.canonicalSourceKey,
            ),
          );
        const collision = sameKey.find((row) => row.sourceId !== source.sourceId);
        if (collision) {
          throw new Error(
            `canonical source key collision: ${source.canonicalSourceKey} already belongs to ${collision.sourceId}`,
          );
        }
      }
    }

    for (const offence of plan.canonical.offences) {
      const existingOffences = await tx
        .select({
          offenceInstanceId: crimeSchema.crimeEventOffencesTable.offenceInstanceId,
          eventId: crimeSchema.crimeEventOffencesTable.eventId,
        })
        .from(crimeSchema.crimeEventOffencesTable)
        .where(
          eq(
            crimeSchema.crimeEventOffencesTable.offenceInstanceId,
            offence.offenceInstanceId,
          ),
        )
        .limit(1);
      if (existingOffences[0] && existingOffences[0].eventId !== plan.event_id) {
        throw new Error(
          `offence identity collision: ${offence.offenceInstanceId} belongs to another event`,
        );
      }
    }

    for (const location of plan.canonical.locations) {
      const existingLocations = await tx
        .select({
          locationId: crimeSchema.crimeEventLocationsTable.locationId,
          eventId: crimeSchema.crimeEventLocationsTable.eventId,
        })
        .from(crimeSchema.crimeEventLocationsTable)
        .where(eq(crimeSchema.crimeEventLocationsTable.locationId, location.locationId))
        .limit(1);
      if (existingLocations[0] && existingLocations[0].eventId !== plan.event_id) {
        throw new Error(
          `location identity collision: ${location.locationId} belongs to another event`,
        );
      }
    }

    if (plan.canonical.cluster_memberships.length) {
      const existingClusters = await tx
        .select({ clusterId: crimeSchema.crimeEventClustersTable.clusterId })
        .from(crimeSchema.crimeEventClustersTable)
        .where(
          inArray(
            crimeSchema.crimeEventClustersTable.clusterId,
            plan.canonical.cluster_memberships,
          ),
        );
      const existingClusterIds = new Set(existingClusters.map((row) => row.clusterId));
      const missing = plan.canonical.cluster_memberships.filter(
        (clusterId) => !existingClusterIds.has(clusterId),
      );
      if (missing.length) {
        throw new Error(`reviewed plan references unknown EVENT_CLUSTER IDs: ${missing.join(", ")}`);
      }
    }

    const existingPublicRows = await tx
      .select({
        eventId: crimeSchema.crimePublicEventsTable.eventId,
        payloadSha256: crimeSchema.crimePublicEventsTable.payloadSha256,
      })
      .from(crimeSchema.crimePublicEventsTable)
      .where(eq(crimeSchema.crimePublicEventsTable.eventId, plan.event_id))
      .limit(1);
    const existingPublic = existingPublicRows[0];
    if (plan.publication_intent === "canonical_only" && existingPublic) {
      throw new Error(
        "canonical_only cannot silently leave an existing public projection; use publication_intent=suppress",
      );
    }

    for (const source of plan.canonical.sources) {
      const row = {
        ...source,
        publishedAt: optionalDate(source.publishedAt, `${source.sourceId}.publishedAt`),
        retrievedAt: optionalDate(source.retrievedAt, `${source.sourceId}.retrievedAt`),
        updatedAt: requiredDate(source.updatedAt, `${source.sourceId}.updatedAt`),
      };
      await tx
        .insert(crimeSchema.crimeSourcesTable)
        .values(row)
        .onConflictDoUpdate({
          target: crimeSchema.crimeSourcesTable.sourceId,
          set: {
            sourceType: row.sourceType,
            provider: row.provider,
            title: row.title,
            url: row.url,
            publishedAt: row.publishedAt,
            retrievedAt: row.retrievedAt,
            canonicalSourceKey: row.canonicalSourceKey,
            contentSha256: row.contentSha256,
            updatedAt: row.updatedAt,
          },
        });
    }

    const event = {
      ...plan.canonical.event,
      updatedAt: requiredDate(plan.canonical.event.updatedAt, "canonical.event.updatedAt"),
    };
    await tx
      .insert(crimeSchema.crimeEventsTable)
      .values(event)
      .onConflictDoUpdate({
        target: crimeSchema.crimeEventsTable.eventId,
        set: {
          schemaVersion: event.schemaVersion,
          recordStatus: event.recordStatus,
          eventForm: event.eventForm,
          title: event.title,
          temporalStart: event.temporalStart,
          temporalEnd: event.temporalEnd,
          temporalEdtf: event.temporalEdtf,
          temporalPrecision: event.temporalPrecision,
          temporalStartBound: event.temporalStartBound,
          temporalEndBound: event.temporalEndBound,
          updatedAt: event.updatedAt,
        },
      });

    for (const offence of plan.canonical.offences) {
      const row = {
        ...offence,
        updatedAt: requiredDate(offence.updatedAt, `${offence.offenceInstanceId}.updatedAt`),
      };
      await tx
        .insert(crimeSchema.crimeEventOffencesTable)
        .values(row)
        .onConflictDoUpdate({
          target: crimeSchema.crimeEventOffencesTable.offenceInstanceId,
          set: {
            eventId: row.eventId,
            classificationSourceId: row.classificationSourceId,
            classificationBasis: row.classificationBasis,
            iccsCode: row.iccsCode,
            istatCatalogueId: row.istatCatalogueId,
            istatSyntheticCode: row.istatSyntheticCode,
            istatAnalyticalCode: row.istatAnalyticalCode,
            legalReference: row.legalReference,
            attemptStatus: row.attemptStatus,
            situationalContext: row.situationalContext,
            cyberRelated: row.cyberRelated,
            affectedObjectCount: row.affectedObjectCount,
            updatedAt: row.updatedAt,
          },
        });
    }

    for (const location of plan.canonical.locations) {
      const row = {
        ...location,
        updatedAt: requiredDate(location.updatedAt, `${location.locationId}.updatedAt`),
      };
      await tx
        .insert(crimeSchema.crimeEventLocationsTable)
        .values(row)
        .onConflictDoUpdate({
          target: crimeSchema.crimeEventLocationsTable.locationId,
          set: {
            eventId: row.eventId,
            basisSourceId: row.basisSourceId,
            role: row.role,
            municipality: row.municipality,
            evidenceBasis: row.evidenceBasis,
            evidencePrecision: row.evidencePrecision,
            resolvedPrecision: row.resolvedPrecision,
            sensitivity: row.sensitivity,
            publicationRisk: row.publicationRisk,
            longitude: row.longitude,
            latitude: row.latitude,
            placeName: row.placeName,
            neighbourhood: row.neighbourhood,
            iccsLocationType: row.iccsLocationType,
            streetScopeKey: row.streetScopeKey,
            neighbourhoodScopeKey: row.neighbourhoodScopeKey,
            localityScopeKey: row.localityScopeKey,
            updatedAt: row.updatedAt,
          },
        });
    }

    for (const link of plan.canonical.event_sources) {
      await tx
        .insert(crimeSchema.crimeEventSourcesTable)
        .values(link)
        .onConflictDoNothing();
    }

    for (const clusterId of plan.canonical.cluster_memberships) {
      await tx
        .insert(crimeSchema.crimeEventClusterMembersTable)
        .values({ clusterId, eventId: plan.event_id })
        .onConflictDoNothing();
    }

    const publicAction = classifyReviewedPublicAction(
      existingPublic?.payloadSha256,
      plan,
    );
    if (
      plan.public_projection &&
      shouldWriteReviewedPublicProjection(existingPublic?.payloadSha256, plan)
    ) {
      const projection = {
        ...plan.public_projection,
        updatedAt: requiredDate(
          plan.public_projection.updatedAt,
          "public_projection.updatedAt",
        ),
      };
      await tx
        .insert(crimeSchema.crimePublicEventsTable)
        .values(projection)
        .onConflictDoUpdate({
          target: crimeSchema.crimePublicEventsTable.eventId,
          set: {
            schemaVersion: projection.schemaVersion,
            payload: projection.payload,
            payloadSha256: projection.payloadSha256,
            publicationGateVersion: projection.publicationGateVersion,
            updatedAt: projection.updatedAt,
          },
        });
    }

    return {
      eventId: plan.event_id,
      bundleSha256: plan.bundle_sha256,
      canonicalWrite: "upserted",
      sourceIds: plan.canonical.sources.map((source) => source.sourceId),
      gates: plan.gates,
      selectedAnchorIds: [...plan.selected_anchor_ids],
      publicPayloadSha256: plan.public_projection?.payloadSha256 ?? null,
      publicAction,
    };
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    throw new Error("usage: apply:ltceds-reviewed-plan <attested-plan.json>");
  }
  const planPath = path.resolve(args[0]!);
  const rawPlan = JSON.parse(await readFile(planPath, "utf8")) as unknown;
  assertAttestedReviewedPlan(rawPlan);

  const { db, pool } = await import("./client");
  try {
    const report = await applyLtcedsReviewedPlan(rawPlan, db);
    process.stdout.write(`${JSON.stringify({ ok: true, ...report }, null, 2)}\n`);
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    process.stderr.write(
      `${JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      })}\n`,
    );
    process.exitCode = 1;
  });
}
