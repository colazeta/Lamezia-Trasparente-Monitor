import assert from "node:assert/strict";
import test from "node:test";

import {
  streetScopeKey,
  type LtcedsPublicAnchor,
} from "@workspace/publication-standardisation/ltceds-location";

import {
  compileReviewedBundle,
  type ReviewedEventBundle,
} from "./ltceds-reviewed-compiler-core";

const EVENT_ID = "018f3f2a-6111-7abc-8def-0123456789ab";
const OFFENCE_ID = "018f3f2a-6222-7abc-8def-0123456789ab";
const SOURCE_ID = "018f3f2a-6333-7abc-8def-0123456789ab";
const LOCATION_ID = "018f3f2a-6444-7abc-8def-0123456789ab";

function privateBundle(): ReviewedEventBundle {
  return {
    bundle_schema_version: "ltceds-reviewed-bundle/1.0",
    event_id: EVENT_ID,
    record_status: "published",
    event_form: "discrete",
    title: "Synthetic private-location event",
    temporal: { start: "2026-01-02", precision: "exact_date" },
    offences: [
      {
        offence_instance_id: OFFENCE_ID,
        classification_source_id: SOURCE_ID,
        classification_basis: "provisional",
      },
    ],
    locations: [
      {
        location_id: LOCATION_ID,
        basis_source_id: SOURCE_ID,
        role: "occurrence",
        municipality: "Example Municipality",
        evidence_basis: "source_stated_exact",
        evidence_precision: "exact_address",
        resolved_precision: "exact_address",
        sensitivity: "private_or_sensitive",
        publication_risk: "residential",
        geometry: { type: "Point", coordinates: [16.251, 38.951] },
        place_name: "Synthetic Street 12",
      },
    ],
    sources: [
      {
        source_id: SOURCE_ID,
        source_type: "public_authority_primary",
        provider: "Synthetic Authority",
        title: "Synthetic source",
        url: "https://example.invalid/source/private-location",
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

test("private exact occurrence uses a reviewed street anchor with sufficient privacy set", () => {
  const anchor: LtcedsPublicAnchor = {
    anchor_id: "street-anchor:synthetic-street",
    kind: "street_anchor",
    scope_key: streetScopeKey("Synthetic Street 12"),
    geometry: { type: "Point", coordinates: [16.25, 38.95] },
    precision: "street_segment",
    source: "synthetic-reviewed-anchor-catalogue",
    privacy_set_size: 8,
    generated_at: "2026-01-03T10:00:00Z",
  };

  const plan = compileReviewedBundle(privateBundle(), [anchor]);
  const locations = plan.public_projection?.payload.locations as Array<
    Record<string, unknown>
  >;

  assert.deepEqual(plan.selected_anchor_ids, [anchor.anchor_id]);
  assert.equal(plan.public_projection?.payload.privacy_tier, "generalised");
  assert.equal(locations[0]?.privacy_transform, "street_generalisation");
  assert.equal(locations[0]?.precision, "street_segment");
  assert.deepEqual(locations[0]?.geometry, anchor.geometry);
  assert.equal(plan.geoprivacy[0]?.map_default, true);
});

test("insufficient street privacy set fails closed to suppression", () => {
  const anchor: LtcedsPublicAnchor = {
    anchor_id: "street-anchor:too-small",
    kind: "street_anchor",
    scope_key: streetScopeKey("Synthetic Street 12"),
    geometry: { type: "Point", coordinates: [16.25, 38.95] },
    precision: "street_segment",
    source: "synthetic-reviewed-anchor-catalogue",
    privacy_set_size: 3,
    generated_at: "2026-01-03T10:00:00Z",
  };

  const plan = compileReviewedBundle(privateBundle(), [anchor]);
  const locations = plan.public_projection?.payload.locations as Array<
    Record<string, unknown>
  >;

  assert.deepEqual(plan.selected_anchor_ids, []);
  assert.equal(locations[0]?.privacy_transform, "suppressed");
  assert.equal(locations[0]?.geometry, null);
  assert.equal(plan.geoprivacy[0]?.map_default, false);
});
