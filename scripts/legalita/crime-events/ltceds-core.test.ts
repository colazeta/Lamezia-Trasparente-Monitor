import assert from "node:assert/strict";
import test from "node:test";

import {
  LTCEDS_SCHEMA_VERSION,
  canAutoMintClusterMembers,
  defaultPublicMapLocations,
  isUuidV7,
  validateClusterSemantics,
  validatePublicEventSemantics,
  type LtcedsEventCluster,
  type LtcedsPublicEvent,
} from "../../../lib/publication-standardisation/src/ltceds.ts";

const EVENT_ID = "0199a8f2-9a31-7b75-8d40-0b3b732f74e7";
const OFFENCE_ID = "0199a8f2-9a32-75ca-a5c5-d046f86129a0";
const SOURCE_ID = "0199a8f2-9a33-7dc0-8b48-67ee08c00e48";

function baseEvent(): LtcedsPublicEvent {
  return {
    event_id: EVENT_ID,
    schema_version: LTCEDS_SCHEMA_VERSION,
    record_status: "published",
    event_form: "discrete",
    title: "Evento dimostrativo anonimo",
    temporal: { start: "2026-01-10", precision: "exact_date" },
    privacy_tier: "open",
    locations: [],
    offences: [
      {
        offence_instance_id: OFFENCE_ID,
        iccs_code: "0501",
        classification_basis: "behavioural_manual",
        attempt_status: "completed",
      },
    ],
    sources: [
      {
        source_id: SOURCE_ID,
        source_type: "law_enforcement_primary",
      },
    ],
    updated_at: "2026-09-05T20:00:00Z",
  };
}

test("UUIDv7 check rejects UUIDv4 and accepts RFC-shaped UUIDv7", () => {
  assert.equal(isUuidV7(EVENT_ID), true);
  assert.equal(isUuidV7("550e8400-e29b-41d4-a716-446655440000"), false);
});

test("arrest, search and discovery locations never become default crime-map points", () => {
  const event = baseEvent();
  event.locations = ["arrest", "search", "discovery"].map((role) => ({
    role: role as "arrest" | "search" | "discovery",
    municipality: "Lamezia Terme",
    precision: "exact_public_site",
    sensitivity: "public_place",
    privacy_transform: "none",
    geometry: { type: "Point", coordinates: [16.31, 38.96] },
  }));

  assert.deepEqual(defaultPublicMapLocations(event), []);
});

test("only occurrence locations with defensible public precision are mapped", () => {
  const event = baseEvent();
  event.locations = [
    {
      role: "occurrence",
      municipality: "Lamezia Terme",
      precision: "street_segment",
      sensitivity: "non_sensitive",
      privacy_transform: "street_generalisation",
      geometry: { type: "Point", coordinates: [16.31, 38.96] },
    },
    {
      role: "occurrence",
      municipality: "Lamezia Terme",
      precision: "municipality",
      sensitivity: "unknown",
      privacy_transform: "municipality_centroid",
      geometry: { type: "Point", coordinates: [16.31, 38.96] },
    },
  ];

  assert.equal(defaultPublicMapLocations(event).length, 1);
});

test("sensitive exact residential geometry fails closed", () => {
  const event = baseEvent();
  event.locations = [
    {
      role: "occurrence",
      municipality: "Lamezia Terme",
      precision: "exact_address",
      sensitivity: "private_or_sensitive",
      privacy_transform: "none",
      geometry: { type: "Point", coordinates: [16.31, 38.96] },
    },
  ];

  const issues = validatePublicEventSemantics(event);
  assert.ok(
    issues.some(
      (issue) => issue.code === "PRIVATE_EXACT_LOCATION_NOT_GENERALISED",
    ),
  );
  assert.deepEqual(defaultPublicMapLocations(event), []);
});

test("suppressed events expose no public geometry", () => {
  const event = baseEvent();
  event.privacy_tier = "suppressed";
  event.locations = [
    {
      role: "occurrence",
      municipality: "Lamezia Terme",
      precision: "street_segment",
      sensitivity: "private_or_sensitive",
      privacy_transform: "suppressed",
      geometry: null,
    },
  ];

  assert.deepEqual(validatePublicEventSemantics(event), []);
  assert.deepEqual(defaultPublicMapLocations(event), []);
});

test("unresolved clusters cannot be auto-expanded into synthetic events", () => {
  const cluster: LtcedsEventCluster = {
    cluster_id: "0199a8f2-9a34-7e70-8437-1028521c1d29",
    reported_event_count: 27,
    count_precision: "exact",
    resolution_status: "unresolved",
    resolved_event_ids: [],
  };

  assert.equal(canAutoMintClusterMembers(cluster), false);
  assert.deepEqual(validateClusterSemantics(cluster), []);
});

test("resolved exact-count clusters must reconcile to individually resolved IDs", () => {
  const cluster: LtcedsEventCluster = {
    cluster_id: "0199a8f2-9a34-7e70-8437-1028521c1d29",
    reported_event_count: 2,
    count_precision: "exact",
    resolution_status: "resolved",
    resolved_event_ids: [EVENT_ID],
  };

  assert.deepEqual(validateClusterSemantics(cluster), [
    "resolved exact-count cluster must resolve to the reported number of events",
  ]);
});
