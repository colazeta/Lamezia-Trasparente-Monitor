import { createHash } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";
import { eq, inArray } from "drizzle-orm";

import {
  applyLtcedsReviewedPlan,
  crimeEventsTable,
  crimePublicEventsTable,
  crimeSourcesTable,
  db,
} from "@workspace/db";

const trackedEventIds = new Set<string>();
const trackedSourceIds = new Set<string>();
let sequence = 1;

function uuidV7(): string {
  const tail = (sequence++).toString(16).padStart(12, "0").slice(-12);
  return `019a2b3c-1000-7000-8000-${tail}`;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)]),
    );
  }
  return value;
}

function sha256(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(stableValue(value)))
    .digest("hex");
}

type PlanOptions = {
  eventId?: string;
  sourceCanonicalKey?: string;
  eventForm?: "discrete" | "continuous_episode" | "course_of_conduct";
  longitude?: string;
};

function reviewedPlan(options: PlanOptions = {}) {
  const eventId = options.eventId ?? uuidV7();
  const sourceId = uuidV7();
  const offenceId = uuidV7();
  const locationId = uuidV7();
  const updatedAt = "2026-01-03T12:00:00Z";
  const sourceCanonicalKey =
    options.sourceCanonicalKey ?? `https://example.invalid/reviewed/${sourceId}`;
  const publicPayload = {
    event_id: eventId,
    schema_version: "1.0-draft.1",
    record_status: "published",
    event_form: options.eventForm ?? "discrete",
    title: `Synthetic reviewed ${eventId.slice(-4)}`,
    temporal: { start: "2026-01-02", precision: "exact_date" },
    privacy_tier: "open",
    locations: [
      {
        role: "occurrence",
        municipality: "Lamezia Terme",
        precision: "exact_public_site",
        sensitivity: "public_place",
        privacy_transform: "none",
        geometry: { type: "Point", coordinates: [16.25, 38.95] },
      },
    ],
    offences: [
      {
        offence_instance_id: offenceId,
        classification_basis: "provisional",
        situational_context: [],
      },
    ],
    sources: [
      {
        source_id: sourceId,
        source_type: "public_authority_primary",
        url: sourceCanonicalKey,
      },
    ],
    updated_at: updatedAt,
  };

  trackedEventIds.add(eventId);
  trackedSourceIds.add(sourceId);

  return {
    plan_schema_version: "ltceds-reviewed-plan/1.0",
    bundle_sha256: sha256({ eventId, sourceId, reviewed: true }),
    event_id: eventId,
    publication_intent: "publish",
    reviewed_at: updatedAt,
    gates: {
      bundle_schema: "passed",
      source_capacity: "passed",
      geoprivacy: "passed",
      public_schema: "passed",
      public_semantic: "passed",
    },
    canonical: {
      event: {
        eventId,
        schemaVersion: "1.0-draft.1",
        recordStatus: "published",
        eventForm: options.eventForm ?? "discrete",
        title: `Synthetic reviewed ${eventId.slice(-4)}`,
        temporalStart: "2026-01-02",
        temporalEnd: null,
        temporalEdtf: null,
        temporalPrecision: "exact_date",
        temporalStartBound: "2026-01-02",
        temporalEndBound: "2026-01-02",
        updatedAt,
      },
      sources: [
        {
          sourceId,
          sourceType: "public_authority_primary",
          provider: "Synthetic Authority",
          title: "Synthetic reviewed source",
          url: sourceCanonicalKey,
          publishedAt: null,
          retrievedAt: null,
          canonicalSourceKey: sourceCanonicalKey,
          contentSha256: null,
          updatedAt,
        },
      ],
      offences: [
        {
          offenceInstanceId: offenceId,
          eventId,
          classificationSourceId: sourceId,
          classificationBasis: "provisional",
          iccsCode: "05",
          istatCatalogueId: null,
          istatSyntheticCode: null,
          istatAnalyticalCode: null,
          legalReference: null,
          attemptStatus: null,
          situationalContext: [],
          cyberRelated: null,
          affectedObjectCount: null,
          updatedAt,
        },
      ],
      locations: [
        {
          locationId,
          eventId,
          basisSourceId: sourceId,
          role: "occurrence",
          municipality: "Lamezia Terme",
          evidenceBasis: "source_stated_named_site",
          evidencePrecision: "exact_public_site",
          resolvedPrecision: "exact_public_site",
          sensitivity: "public_place",
          publicationRisk: "low_public_site",
          longitude: options.longitude ?? "16.25",
          latitude: "38.95",
          placeName: "Synthetic public site",
          neighbourhood: null,
          iccsLocationType: null,
          streetScopeKey: null,
          neighbourhoodScopeKey: null,
          localityScopeKey: null,
          updatedAt,
        },
      ],
      event_sources: [
        { eventId, sourceId, supportRole: "event_support" },
      ],
      cluster_memberships: [],
    },
    public_projection: {
      eventId,
      schemaVersion: "1.0-draft.1",
      payload: publicPayload,
      payloadSha256: sha256(publicPayload),
      publicationGateVersion: "ltceds-reviewed-publication-gate/1.0-draft.1",
      updatedAt,
    },
    selected_anchor_ids: [],
    geoprivacy: [
      {
        location_id: locationId,
        selected_anchor_id: null,
        map_default: true,
        reasons: ["synthetic low-risk public site"],
      },
    ],
  };
}

afterEach(async () => {
  const eventIds = [...trackedEventIds];
  const sourceIds = [...trackedSourceIds];
  trackedEventIds.clear();
  trackedSourceIds.clear();

  if (eventIds.length) {
    await db
      .delete(crimePublicEventsTable)
      .where(inArray(crimePublicEventsTable.eventId, eventIds));
    await db
      .delete(crimeEventsTable)
      .where(inArray(crimeEventsTable.eventId, eventIds));
  }
  if (sourceIds.length) {
    await db
      .delete(crimeSourcesTable)
      .where(inArray(crimeSourcesTable.sourceId, sourceIds));
  }
});

describe("LTCEDS reviewed-plan Postgres boundary", () => {
  it("is idempotent on an unchanged reviewed plan", async () => {
    const plan = reviewedPlan();

    const first = await applyLtcedsReviewedPlan(plan, db);
    expect(first.publicAction).toBe("inserted");

    const second = await applyLtcedsReviewedPlan(plan, db);
    expect(second.publicAction).toBe("unchanged");

    expect(
      await db
        .select({ eventId: crimeEventsTable.eventId })
        .from(crimeEventsTable)
        .where(eq(crimeEventsTable.eventId, plan.event_id)),
    ).toHaveLength(1);
    expect(
      await db
        .select({ payloadSha256: crimePublicEventsTable.payloadSha256 })
        .from(crimePublicEventsTable)
        .where(eq(crimePublicEventsTable.eventId, plan.event_id)),
    ).toEqual([{ payloadSha256: plan.public_projection.payloadSha256 }]);
  });

  it("fails closed on source canonical-key reuse and writes no second event", async () => {
    const canonicalKey = `https://example.invalid/reviewed/shared-${uuidV7()}`;
    const first = reviewedPlan({ sourceCanonicalKey: canonicalKey });
    await applyLtcedsReviewedPlan(first, db);

    const second = reviewedPlan({ sourceCanonicalKey: canonicalKey });
    await expect(applyLtcedsReviewedPlan(second, db)).rejects.toThrow(
      /canonical source key collision/,
    );

    expect(
      await db
        .select({ eventId: crimeEventsTable.eventId })
        .from(crimeEventsTable)
        .where(eq(crimeEventsTable.eventId, second.event_id)),
    ).toHaveLength(0);
    expect(
      await db
        .select({ sourceId: crimeSourcesTable.sourceId })
        .from(crimeSourcesTable)
        .where(
          eq(
            crimeSourcesTable.sourceId,
            second.canonical.sources[0].sourceId,
          ),
        ),
    ).toHaveLength(0);
  });

  it("fails closed when an existing event UUID is reused with an incompatible event form", async () => {
    const first = reviewedPlan();
    await applyLtcedsReviewedPlan(first, db);

    const collision = reviewedPlan({
      eventId: first.event_id,
      eventForm: "course_of_conduct",
    });
    await expect(applyLtcedsReviewedPlan(collision, db)).rejects.toThrow(
      /event identity collision/,
    );

    expect(
      await db
        .select({ eventForm: crimeEventsTable.eventForm })
        .from(crimeEventsTable)
        .where(eq(crimeEventsTable.eventId, first.event_id)),
    ).toEqual([{ eventForm: "discrete" }]);
    expect(
      await db
        .select({ sourceId: crimeSourcesTable.sourceId })
        .from(crimeSourcesTable)
        .where(
          eq(
            crimeSourcesTable.sourceId,
            collision.canonical.sources[0].sourceId,
          ),
        ),
    ).toHaveLength(0);
  });

  it("rolls back earlier canonical writes if a later DB constraint fails", async () => {
    const invalid = reviewedPlan({ longitude: "999" });

    await expect(applyLtcedsReviewedPlan(invalid, db)).rejects.toThrow();

    expect(
      await db
        .select({ eventId: crimeEventsTable.eventId })
        .from(crimeEventsTable)
        .where(eq(crimeEventsTable.eventId, invalid.event_id)),
    ).toHaveLength(0);
    expect(
      await db
        .select({ sourceId: crimeSourcesTable.sourceId })
        .from(crimeSourcesTable)
        .where(
          eq(
            crimeSourcesTable.sourceId,
            invalid.canonical.sources[0].sourceId,
          ),
        ),
    ).toHaveLength(0);
    expect(
      await db
        .select({ eventId: crimePublicEventsTable.eventId })
        .from(crimePublicEventsTable)
        .where(eq(crimePublicEventsTable.eventId, invalid.event_id)),
    ).toHaveLength(0);
  });
});
