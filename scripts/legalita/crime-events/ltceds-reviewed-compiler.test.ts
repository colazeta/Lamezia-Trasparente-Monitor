import assert from "node:assert/strict";
import test from "node:test";

import {
  compileReviewedBundle,
  reviewedPlanReadyForWrite,
  type ReviewedEventBundle,
} from "./ltceds-reviewed-compiler-core";

const EVENT_ID = "018f3f2a-1111-7abc-8def-0123456789ab";
const OFFENCE_ID = "018f3f2a-2222-7abc-8def-0123456789ab";
const SOURCE_ID = "018f3f2a-3333-7abc-8def-0123456789ab";
const LOCATION_ID = "018f3f2a-4444-7abc-8def-0123456789ab";
const CLUSTER_ID = "018f3f2a-5555-7abc-8def-0123456789ab";

function baseBundle(): ReviewedEventBundle {
  return {
    bundle_schema_version: "ltceds-reviewed-bundle/1.0",
    event_id: EVENT_ID,
    record_status: "published",
    event_form: "discrete",
    title: "Synthetic reviewed event",
    public_summary: "Synthetic public summary.",
    temporal: {
      start: "2026-01-02",
      precision: "exact_date",
    },
    offences: [
      {
        offence_instance_id: OFFENCE_ID,
        classification_source_id: SOURCE_ID,
        classification_basis: "provisional",
        iccs_code: "05",
      },
    ],
    locations: [
      {
        location_id: LOCATION_ID,
        basis_source_id: SOURCE_ID,
        role: "occurrence",
        municipality: "Example Municipality",
        evidence_basis: "source_stated_named_site",
        evidence_precision: "exact_public_site",
        resolved_precision: "exact_public_site",
        sensitivity: "public_place",
        publication_risk: "low_public_site",
        geometry: {
          type: "Point",
          coordinates: [16.25, 38.95],
        },
        place_name: "Synthetic public site",
      },
    ],
    sources: [
      {
        source_id: SOURCE_ID,
        source_type: "public_authority_primary",
        provider: "Synthetic Authority",
        title: "Synthetic institutional source",
        url: "https://example.invalid/source/1?utm_source=test",
        publication_support: "primary_possible",
        candidate_policy: "automatic",
        personal_data_risk: "low",
        reputational_risk: "low",
        requires_corroboration: false,
      },
    ],
    cluster_ids: [],
    review: {
      reviewer_role: "editor",
      reviewer_id: "editorial:ltceds",
      reviewed_at: "2026-01-03T12:00:00Z",
      decision: "approved",
      rationale_codes: ["SOURCE_VERIFIED"],
      public_text_checked: true,
    },
    publication_intent: "publish",
  };
}

test("publishable reviewed event retains an exact source-supported public-site point", () => {
  const plan = compileReviewedBundle(baseBundle());

  assert.equal(plan.gates.source_capacity, "passed");
  assert.equal(plan.gates.geoprivacy, "passed");
  assert.equal(plan.gates.public_semantic, "passed");
  assert.equal(plan.gates.public_schema, "pending");
  assert.equal(plan.public_projection?.payload.privacy_tier, "open");
  const locations = plan.public_projection?.payload.locations as Array<Record<string, unknown>>;
  assert.equal(locations[0]?.privacy_transform, "none");
  assert.deepEqual(locations[0]?.geometry, {
    type: "Point",
    coordinates: [16.25, 38.95],
  });
  assert.equal(plan.geoprivacy[0]?.map_default, true);
  assert.equal(plan.canonical.event.temporalStartBound, "2026-01-02");
  assert.equal(plan.canonical.event.temporalEndBound, "2026-01-02");
  assert.equal(plan.canonical.sources[0]?.canonicalSourceKey, "https://example.invalid/source/1");
  assert.equal(reviewedPlanReadyForWrite(plan), false, "public JSON Schema gate is still pending");
});

test("canonical-only reviewed event produces no public projection", () => {
  const bundle = baseBundle();
  bundle.publication_intent = "canonical_only";
  bundle.record_status = "verified_source";
  bundle.review.decision = "canonical_only";
  bundle.review.public_text_checked = false;

  const plan = compileReviewedBundle(bundle);

  assert.equal(plan.public_projection, null);
  assert.equal(plan.gates.source_capacity, "not_applicable");
  assert.equal(plan.gates.public_schema, "not_applicable");
  assert.equal(plan.gates.public_semantic, "not_applicable");
  assert.equal(reviewedPlanReadyForWrite(plan), true);
});

test("high-risk publication requires explicit senior editorial review", () => {
  const bundle = baseBundle();
  bundle.sources[0]!.personal_data_risk = "high";
  bundle.sources[0]!.candidate_policy = "human_gate";

  assert.throws(
    () => compileReviewedBundle(bundle),
    /HIGH_RISK_SOURCE_REVIEW/,
  );

  bundle.review.reviewer_role = "senior_editor";
  bundle.review.rationale_codes.push("HIGH_RISK_SOURCE_REVIEW", "SOURCE_CAPACITY_OVERRIDE");
  assert.doesNotThrow(() => compileReviewedBundle(bundle));
});

test("press-only publication fails closed without a senior source-capacity override", () => {
  const bundle = baseBundle();
  bundle.sources[0]!.source_type = "press_secondary";
  bundle.sources[0]!.publication_support = "corroboration_only";
  bundle.sources[0]!.requires_corroboration = true;

  assert.throws(() => compileReviewedBundle(bundle), /SOURCE_CAPACITY_OVERRIDE/);

  bundle.review.reviewer_role = "senior_editor";
  bundle.review.rationale_codes.push("SOURCE_CAPACITY_OVERRIDE");
  assert.doesNotThrow(() => compileReviewedBundle(bundle));
});

test("private exact occurrence is suppressed without a reviewed public anchor", () => {
  const bundle = baseBundle();
  const location = bundle.locations[0]!;
  location.evidence_basis = "source_stated_exact";
  location.evidence_precision = "exact_address";
  location.resolved_precision = "exact_address";
  location.sensitivity = "private_or_sensitive";
  location.publication_risk = "residential";
  location.place_name = "Synthetic private address";

  const plan = compileReviewedBundle(bundle, []);
  const locations = plan.public_projection?.payload.locations as Array<Record<string, unknown>>;

  assert.equal(plan.public_projection?.payload.privacy_tier, "generalised");
  assert.equal(locations[0]?.privacy_transform, "suppressed");
  assert.equal(locations[0]?.geometry, null);
  assert.equal(plan.geoprivacy[0]?.map_default, false);
});

test("arrest geography can retain a public-site point but is never a default crime marker", () => {
  const bundle = baseBundle();
  bundle.locations[0]!.role = "arrest";

  const plan = compileReviewedBundle(bundle);
  const locations = plan.public_projection?.payload.locations as Array<Record<string, unknown>>;

  assert.deepEqual(locations[0]?.geometry, {
    type: "Point",
    coordinates: [16.25, 38.95],
  });
  assert.equal(plan.geoprivacy[0]?.map_default, false);
});

test("resolved geography cannot become more precise than its evidence", () => {
  const bundle = baseBundle();
  const location = bundle.locations[0]!;
  location.evidence_basis = "source_stated_street";
  location.evidence_precision = "street_segment";
  location.resolved_precision = "exact_address";

  assert.throws(() => compileReviewedBundle(bundle), /more specific than evidence_precision/);
});

test("review rejection and person-identity fields fail before canonical compilation", () => {
  const rejected = baseBundle();
  rejected.review.decision = "rejected";
  assert.throws(() => compileReviewedBundle(rejected), /rejected reviewed bundle/);

  const withPersonKey = {
    ...baseBundle(),
    suspect_name: "Synthetic Person",
  } as unknown as ReviewedEventBundle;
  assert.throws(() => compileReviewedBundle(withPersonKey), /person identity field is out of scope/);
});

test("cluster references remain memberships and never mint synthetic event IDs", () => {
  const bundle = baseBundle();
  bundle.cluster_ids = [CLUSTER_ID];

  const plan = compileReviewedBundle(bundle);

  assert.deepEqual(plan.canonical.cluster_memberships, [CLUSTER_ID]);
  assert.equal(plan.canonical.event.eventId, EVENT_ID);
  assert.equal(Object.keys(plan.canonical.event).includes("clusterGeneratedEventIds"), false);
});
