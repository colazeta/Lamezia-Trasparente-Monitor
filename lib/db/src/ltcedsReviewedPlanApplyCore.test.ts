import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertAttestedReviewedPlan,
  classifyReviewedPublicAction,
  shouldWriteReviewedPublicProjection,
  type AttestedReviewedPlan,
} from "./ltcedsReviewedPlanApplyCore";

const EVENT_ID = "018f3f2a-1111-7abc-8def-0123456789ab";
const SOURCE_ID = "018f3f2a-3333-7abc-8def-0123456789ab";
const OFFENCE_ID = "018f3f2a-2222-7abc-8def-0123456789ab";
const LOCATION_ID = "018f3f2a-4444-7abc-8def-0123456789ab";
const HASH = "a".repeat(64);
const OTHER_HASH = "b".repeat(64);

function plan(): AttestedReviewedPlan {
  return {
    plan_schema_version: "ltceds-reviewed-plan/1.0",
    bundle_sha256: HASH,
    event_id: EVENT_ID,
    publication_intent: "publish",
    reviewed_at: "2026-01-03T12:00:00Z",
    gates: {
      bundle_schema: "passed",
      source_capacity: "passed",
      geoprivacy: "passed",
      public_schema: "passed",
      public_semantic: "passed",
    },
    canonical: {
      event: {
        eventId: EVENT_ID,
        schemaVersion: "1.0-draft.1",
        recordStatus: "published",
        eventForm: "discrete",
        title: "Synthetic event",
        temporalStart: "2026-01-02",
        temporalEnd: null,
        temporalEdtf: null,
        temporalPrecision: "exact_date",
        temporalStartBound: "2026-01-02",
        temporalEndBound: "2026-01-02",
        updatedAt: "2026-01-03T12:00:00Z",
      },
      sources: [
        {
          sourceId: SOURCE_ID,
          sourceType: "public_authority_primary",
          provider: "Synthetic Authority",
          title: "Synthetic source",
          url: "https://example.invalid/source/1",
          publishedAt: null,
          retrievedAt: null,
          canonicalSourceKey: "https://example.invalid/source/1",
          contentSha256: null,
          updatedAt: "2026-01-03T12:00:00Z",
        },
      ],
      offences: [
        {
          offenceInstanceId: OFFENCE_ID,
          eventId: EVENT_ID,
          classificationSourceId: SOURCE_ID,
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
          updatedAt: "2026-01-03T12:00:00Z",
        },
      ],
      locations: [
        {
          locationId: LOCATION_ID,
          eventId: EVENT_ID,
          basisSourceId: SOURCE_ID,
          role: "occurrence",
          municipality: "Example Municipality",
          evidenceBasis: "source_stated_named_site",
          evidencePrecision: "exact_public_site",
          resolvedPrecision: "exact_public_site",
          sensitivity: "public_place",
          publicationRisk: "low_public_site",
          longitude: "16.25",
          latitude: "38.95",
          placeName: "Synthetic site",
          neighbourhood: null,
          iccsLocationType: null,
          streetScopeKey: null,
          neighbourhoodScopeKey: null,
          localityScopeKey: null,
          updatedAt: "2026-01-03T12:00:00Z",
        },
      ],
      event_sources: [
        { eventId: EVENT_ID, sourceId: SOURCE_ID, supportRole: "event_support" },
      ],
      cluster_memberships: [],
    },
    public_projection: {
      eventId: EVENT_ID,
      schemaVersion: "1.0-draft.1",
      payload: {
        event_id: EVENT_ID,
        schema_version: "1.0-draft.1",
        record_status: "published",
      },
      payloadSha256: HASH,
      publicationGateVersion: "ltceds-reviewed-publication-gate/1.0-draft.1",
      updatedAt: "2026-01-03T12:00:00Z",
    },
    selected_anchor_ids: [],
    geoprivacy: [],
  };
}

test("attested reviewed plan is accepted only after every applicable gate passed", () => {
  const valid = plan();
  assert.doesNotThrow(() => assertAttestedReviewedPlan(valid));

  const pending = plan();
  (pending.gates as { public_schema: string }).public_schema = "pending";
  assert.throws(
    () => assertAttestedReviewedPlan(pending),
    /public-schema gate is not passed/,
  );
});

test("canonical and public identities must remain aligned", () => {
  const wrongCanonical = plan();
  wrongCanonical.canonical.event.eventId = "018f3f2a-9999-7abc-8def-0123456789ab";
  assert.throws(() => assertAttestedReviewedPlan(wrongCanonical), /canonical event ID/);

  const wrongPublic = plan();
  wrongPublic.public_projection!.payload.event_id = "018f3f2a-9999-7abc-8def-0123456789ab";
  assert.throws(() => assertAttestedReviewedPlan(wrongPublic), /public payload event_id/);
});

test("canonical-only cannot carry a latent public projection", () => {
  const value = plan();
  value.publication_intent = "canonical_only";
  value.gates.source_capacity = "not_applicable";
  value.gates.public_schema = "not_applicable";
  value.gates.public_semantic = "not_applicable";
  assert.throws(() => assertAttestedReviewedPlan(value), /must not contain a public projection/);

  value.public_projection = null;
  value.canonical.event.recordStatus = "verified_source";
  assert.doesNotThrow(() => assertAttestedReviewedPlan(value));
});

test("public action classification is deterministic and hash based", () => {
  const value = plan();
  assert.equal(classifyReviewedPublicAction(null, value), "inserted");
  assert.equal(classifyReviewedPublicAction(HASH, value), "unchanged");
  assert.equal(classifyReviewedPublicAction(OTHER_HASH, value), "updated");
  assert.equal(shouldWriteReviewedPublicProjection(HASH, value), false);
  assert.equal(shouldWriteReviewedPublicProjection(OTHER_HASH, value), true);

  value.publication_intent = "suppress";
  value.public_projection!.payload.record_status = "suppressed";
  assert.equal(classifyReviewedPublicAction(HASH, value), "suppressed");
});

test("writer remains transactional and has no implicit delete/truncate path", async () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const source = await readFile(path.join(here, "ltcedsReviewedPlanApply.ts"), "utf8");

  assert.match(source, /db\.transaction\(/);
  assert.doesNotMatch(source, /\.delete\s*\(/);
  assert.doesNotMatch(source, /\btruncate\b/i);
  assert.doesNotMatch(source, /delete\s+from/i);
});
