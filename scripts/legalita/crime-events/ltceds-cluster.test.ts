import assert from "node:assert/strict";
import test from "node:test";

import {
  LTCEDS_CLUSTER_SCHEMA_VERSION,
  clusterAssertionAppliesToAllMembers,
  defaultClusterMapFeatures,
  validateScopedClusterSemantics,
  type LtcedsClusterAssertion,
  type LtcedsScopedEventCluster,
} from "../../../lib/publication-standardisation/src/ltceds-cluster.ts";

const CLUSTER_ID = "0199a8f2-9a34-7e70-8437-1028521c1d29";
const SOURCE_ID = "0199a8f2-9a36-7c20-8d15-222222222222";
const EVENT_ID = "0199a8f2-9a40-7a60-8b19-666666666666";

function assertion(
  overrides: Partial<LtcedsClusterAssertion> = {},
): LtcedsClusterAssertion {
  return {
    assertion_id: "0199a8f2-9a35-7b60-8c14-111111111111",
    subject_type: "event_cluster",
    subject_id: CLUSTER_ID,
    predicate: "temporal_scope",
    scope: "investigation_seed",
    value: {
      type: "temporal",
      start: "2025-02-28",
      end: "2025-03-01",
      edtf: null,
      precision: "bounded_interval",
    },
    source_id: SOURCE_ID,
    assertion_mode: "explicit",
    source_locator: "synthetic seed window",
    subset_descriptor: null,
    ...overrides,
  };
}

function exactCluster(): LtcedsScopedEventCluster {
  return {
    cluster_id: CLUSTER_ID,
    schema_version: LTCEDS_CLUSTER_SCHEMA_VERSION,
    reported_event_count: 27,
    reported_count_text: null,
    count_precision: "exact",
    resolution_status: "unresolved",
    resolved_event_ids: [],
    assertions: [assertion()],
    updated_at: "2026-09-06T17:00:00Z",
  };
}

test("investigation seed is valid cluster evidence but never inherited by every member", () => {
  const cluster = exactCluster();
  const seed = cluster.assertions[0]!;

  assert.deepEqual(validateScopedClusterSemantics(cluster), []);
  assert.equal(clusterAssertionAppliesToAllMembers(seed), false);
  assert.deepEqual(defaultClusterMapFeatures(cluster), []);
});

test("only explicit all_reported_members scope may be inherited by every member", () => {
  const cluster = exactCluster();
  const commonOffence = assertion({
    assertion_id: "0199a8f2-9a37-7d30-8e16-333333333333",
    predicate: "offence_family",
    scope: "all_reported_members",
    value: { type: "text", text: "synthetic offence family" },
  });
  cluster.assertions = [commonOffence];

  assert.deepEqual(validateScopedClusterSemantics(cluster), []);
  assert.equal(clusterAssertionAppliesToAllMembers(commonOffence), true);
});

test("cluster assertion subject must match containing cluster", () => {
  const cluster = exactCluster();
  cluster.assertions = [
    assertion({ subject_id: "0199a8f2-9a41-7b70-8c20-777777777777" }),
  ];

  assert.ok(
    validateScopedClusterSemantics(cluster).some(
      (item) => item.code === "ASSERTION_SUBJECT_MISMATCH",
    ),
  );
});

test("member_subset scope requires a source-grounded descriptor", () => {
  const cluster = exactCluster();
  cluster.assertions = [
    assertion({
      scope: "member_subset",
      subset_descriptor: null,
    }),
  ];

  assert.ok(
    validateScopedClusterSemantics(cluster).some(
      (item) => item.code === "MEMBER_SUBSET_DESCRIPTOR_REQUIRED",
    ),
  );
});

test("source-faithful approximate cardinality text does not require invented integer", () => {
  const cluster = exactCluster();
  cluster.reported_event_count = null;
  cluster.reported_count_text = "several hundred";
  cluster.count_precision = "approximate";
  cluster.assertions = [
    assertion({
      assertion_id: "0199a8f2-9a38-7e40-8f17-444444444444",
      predicate: "target_class",
      scope: "cluster_context",
      value: { type: "text", text: "business and commercial activities" },
    }),
  ];

  assert.deepEqual(validateScopedClusterSemantics(cluster), []);
});

test("approximate cardinality without number or source-faithful text fails", () => {
  const cluster = exactCluster();
  cluster.reported_event_count = null;
  cluster.reported_count_text = null;
  cluster.count_precision = "approximate";

  assert.ok(
    validateScopedClusterSemantics(cluster).some(
      (item) => item.code === "APPROXIMATE_COUNT_REQUIRES_TEXT_OR_COUNT",
    ),
  );
});

test("resolved exact-count cluster must reconcile to resolved EVENT IDs", () => {
  const cluster = exactCluster();
  cluster.reported_event_count = 2;
  cluster.resolution_status = "resolved";
  cluster.resolved_event_ids = [EVENT_ID];

  assert.ok(
    validateScopedClusterSemantics(cluster).some(
      (item) => item.code === "RESOLVED_EXACT_COUNT_MISMATCH",
    ),
  );
});

test("duplicate assertion identity fails closed", () => {
  const cluster = exactCluster();
  cluster.assertions = [assertion(), assertion()];

  assert.ok(
    validateScopedClusterSemantics(cluster).some(
      (item) => item.code === "DUPLICATE_ASSERTION_ID",
    ),
  );
});
