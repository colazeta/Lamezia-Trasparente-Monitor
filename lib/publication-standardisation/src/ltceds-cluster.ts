import { isUuidV7 } from "./ltceds";

export const LTCEDS_CLUSTER_SCHEMA_VERSION = "1.0-draft.2" as const;

export const CLUSTER_COUNT_PRECISIONS = [
  "exact",
  "minimum",
  "approximate",
  "unknown",
] as const;
export type ClusterCountPrecision = (typeof CLUSTER_COUNT_PRECISIONS)[number];

export const CLUSTER_RESOLUTION_STATUSES = [
  "unresolved",
  "partially_resolved",
  "resolved",
] as const;
export type ClusterResolutionStatus =
  (typeof CLUSTER_RESOLUTION_STATUSES)[number];

export const CLUSTER_ASSERTION_SCOPES = [
  "cluster_context",
  "investigation_seed",
  "all_reported_members",
  "member_subset",
  "procedural_context",
] as const;
export type ClusterAssertionScope = (typeof CLUSTER_ASSERTION_SCOPES)[number];

export const CLUSTER_ASSERTION_PREDICATES = [
  "reported_cardinality",
  "temporal_scope",
  "geographic_scope",
  "offence_family",
  "target_class",
  "investigation_context",
  "other",
] as const;
export type ClusterAssertionPredicate =
  (typeof CLUSTER_ASSERTION_PREDICATES)[number];

export const CLUSTER_ASSERTION_MODES = [
  "explicit",
  "derived_crosswalk",
  "curator_inference",
] as const;
export type ClusterAssertionMode = (typeof CLUSTER_ASSERTION_MODES)[number];

export type ClusterTemporalPrecision =
  | "exact_datetime"
  | "exact_date"
  | "bounded_interval"
  | "week_or_similar"
  | "month"
  | "year"
  | "approximate"
  | "unknown";

export type ClusterGeographicPrecision =
  | "street_segment"
  | "neighbourhood"
  | "locality"
  | "municipality"
  | "unknown";

export type LtcedsClusterAssertionValue =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "count";
      count: number | null;
      count_text: string | null;
      precision: ClusterCountPrecision;
    }
  | {
      type: "temporal";
      start: string | null;
      end: string | null;
      edtf: string | null;
      precision: ClusterTemporalPrecision;
    }
  | {
      type: "geographic";
      place_name: string;
      precision: ClusterGeographicPrecision;
    };

export type LtcedsClusterAssertion = {
  assertion_id: string;
  subject_type: "event_cluster";
  subject_id: string;
  predicate: ClusterAssertionPredicate;
  scope: ClusterAssertionScope;
  value: LtcedsClusterAssertionValue;
  source_id: string;
  assertion_mode: ClusterAssertionMode;
  source_locator?: string | null;
  subset_descriptor?: string | null;
};

export type LtcedsScopedEventCluster = {
  cluster_id: string;
  schema_version: typeof LTCEDS_CLUSTER_SCHEMA_VERSION;
  reported_event_count: number | null;
  reported_count_text?: string | null;
  count_precision: ClusterCountPrecision;
  resolution_status: ClusterResolutionStatus;
  resolved_event_ids: readonly string[];
  assertions: readonly LtcedsClusterAssertion[];
  updated_at: string;
};

export type ClusterSemanticIssueCode =
  | "CLUSTER_ID_NOT_UUIDV7"
  | "ASSERTION_ID_NOT_UUIDV7"
  | "ASSERTION_SOURCE_ID_NOT_UUIDV7"
  | "ASSERTION_SUBJECT_MISMATCH"
  | "DUPLICATE_ASSERTION_ID"
  | "DUPLICATE_RESOLVED_EVENT_ID"
  | "RESOLVED_EVENT_ID_NOT_UUIDV7"
  | "INVALID_REPORTED_EVENT_COUNT"
  | "EXACT_COUNT_REQUIRES_INTEGER"
  | "APPROXIMATE_COUNT_REQUIRES_TEXT_OR_COUNT"
  | "UNRESOLVED_CLUSTER_HAS_MEMBERS"
  | "RESOLVED_EXACT_COUNT_MISMATCH"
  | "MEMBER_SUBSET_DESCRIPTOR_REQUIRED"
  | "COUNT_VALUE_INVALID"
  | "TEMPORAL_VALUE_EMPTY"
  | "GEOGRAPHIC_VALUE_EMPTY";

export type ClusterSemanticIssue = {
  code: ClusterSemanticIssueCode;
  path: string;
  message: string;
};

function issue(
  code: ClusterSemanticIssueCode,
  path: string,
  message: string,
): ClusterSemanticIssue {
  return { code, path, message };
}

/**
 * Scope is evidentiary, not merely descriptive. Only an assertion explicitly
 * scoped to all_reported_members may be inherited by every member. A
 * member_subset assertion still requires explicit subset resolution; an
 * investigation_seed or cluster_context assertion must never be propagated.
 */
export function clusterAssertionAppliesToAllMembers(
  assertion: LtcedsClusterAssertion,
): boolean {
  return assertion.scope === "all_reported_members";
}

/**
 * EVENT_CLUSTER objects are anti-false-precision objects. They are never
 * default crime-map features. Aggregate/context geography remains an assertion
 * and cannot become a representative point for unresolved occurrences.
 */
export function defaultClusterMapFeatures(
  _cluster: LtcedsScopedEventCluster,
): readonly never[] {
  return [];
}

export function validateScopedClusterSemantics(
  cluster: LtcedsScopedEventCluster,
): readonly ClusterSemanticIssue[] {
  const issues: ClusterSemanticIssue[] = [];

  if (!isUuidV7(cluster.cluster_id)) {
    issues.push(
      issue(
        "CLUSTER_ID_NOT_UUIDV7",
        "cluster_id",
        "cluster_id must be UUIDv7",
      ),
    );
  }

  if (
    cluster.reported_event_count !== null &&
    (!Number.isInteger(cluster.reported_event_count) ||
      cluster.reported_event_count < 1)
  ) {
    issues.push(
      issue(
        "INVALID_REPORTED_EVENT_COUNT",
        "reported_event_count",
        "reported_event_count must be null or an integer >= 1",
      ),
    );
  }

  if (
    cluster.count_precision === "exact" &&
    cluster.reported_event_count === null
  ) {
    issues.push(
      issue(
        "EXACT_COUNT_REQUIRES_INTEGER",
        "reported_event_count",
        "exact count_precision requires reported_event_count",
      ),
    );
  }

  if (
    cluster.count_precision === "approximate" &&
    cluster.reported_event_count === null &&
    !cluster.reported_count_text?.trim()
  ) {
    issues.push(
      issue(
        "APPROXIMATE_COUNT_REQUIRES_TEXT_OR_COUNT",
        "reported_count_text",
        "approximate count_precision requires a numeric estimate or source-faithful count text",
      ),
    );
  }

  if (
    cluster.resolution_status === "unresolved" &&
    cluster.resolved_event_ids.length > 0
  ) {
    issues.push(
      issue(
        "UNRESOLVED_CLUSTER_HAS_MEMBERS",
        "resolved_event_ids",
        "unresolved cluster cannot contain resolved_event_ids",
      ),
    );
  }

  if (
    cluster.resolution_status === "resolved" &&
    cluster.count_precision === "exact" &&
    cluster.reported_event_count !== null &&
    cluster.resolved_event_ids.length !== cluster.reported_event_count
  ) {
    issues.push(
      issue(
        "RESOLVED_EXACT_COUNT_MISMATCH",
        "resolved_event_ids",
        "resolved exact-count cluster must resolve to the reported number of events",
      ),
    );
  }

  if (
    new Set(cluster.resolved_event_ids).size !==
    cluster.resolved_event_ids.length
  ) {
    issues.push(
      issue(
        "DUPLICATE_RESOLVED_EVENT_ID",
        "resolved_event_ids",
        "resolved_event_ids must be unique",
      ),
    );
  }

  cluster.resolved_event_ids.forEach((eventId, index) => {
    if (!isUuidV7(eventId)) {
      issues.push(
        issue(
          "RESOLVED_EVENT_ID_NOT_UUIDV7",
          `resolved_event_ids[${index}]`,
          "resolved EVENT IDs must be UUIDv7",
        ),
      );
    }
  });

  const assertionIds = new Set<string>();
  cluster.assertions.forEach((assertion, index) => {
    const prefix = `assertions[${index}]`;
    if (!isUuidV7(assertion.assertion_id)) {
      issues.push(
        issue(
          "ASSERTION_ID_NOT_UUIDV7",
          `${prefix}.assertion_id`,
          "assertion_id must be UUIDv7",
        ),
      );
    }
    if (assertionIds.has(assertion.assertion_id)) {
      issues.push(
        issue(
          "DUPLICATE_ASSERTION_ID",
          `${prefix}.assertion_id`,
          "assertion_id must be unique within a cluster record",
        ),
      );
    }
    assertionIds.add(assertion.assertion_id);

    if (!isUuidV7(assertion.source_id)) {
      issues.push(
        issue(
          "ASSERTION_SOURCE_ID_NOT_UUIDV7",
          `${prefix}.source_id`,
          "source_id must be UUIDv7",
        ),
      );
    }
    if (
      assertion.subject_type !== "event_cluster" ||
      assertion.subject_id !== cluster.cluster_id
    ) {
      issues.push(
        issue(
          "ASSERTION_SUBJECT_MISMATCH",
          `${prefix}.subject_id`,
          "cluster assertion subject must match the containing cluster",
        ),
      );
    }
    if (
      assertion.scope === "member_subset" &&
      !assertion.subset_descriptor?.trim()
    ) {
      issues.push(
        issue(
          "MEMBER_SUBSET_DESCRIPTOR_REQUIRED",
          `${prefix}.subset_descriptor`,
          "member_subset scope requires an explicit source-grounded subset descriptor",
        ),
      );
    }

    if (assertion.value.type === "count") {
      if (
        assertion.value.count !== null &&
        (!Number.isInteger(assertion.value.count) || assertion.value.count < 1)
      ) {
        issues.push(
          issue(
            "COUNT_VALUE_INVALID",
            `${prefix}.value.count`,
            "count assertion value must be null or an integer >= 1",
          ),
        );
      }
      if (
        assertion.value.precision === "exact" &&
        assertion.value.count === null
      ) {
        issues.push(
          issue(
            "COUNT_VALUE_INVALID",
            `${prefix}.value.count`,
            "exact count assertion requires an integer count",
          ),
        );
      }
      if (
        assertion.value.precision === "approximate" &&
        assertion.value.count === null &&
        !assertion.value.count_text?.trim()
      ) {
        issues.push(
          issue(
            "COUNT_VALUE_INVALID",
            `${prefix}.value.count_text`,
            "approximate count assertion requires a numeric estimate or source-faithful text",
          ),
        );
      }
    }

    if (
      assertion.value.type === "temporal" &&
      !assertion.value.start &&
      !assertion.value.end &&
      !assertion.value.edtf &&
      assertion.value.precision !== "unknown"
    ) {
      issues.push(
        issue(
          "TEMPORAL_VALUE_EMPTY",
          `${prefix}.value`,
          "temporal assertion requires a source-faithful time value or unknown precision",
        ),
      );
    }

    if (
      assertion.value.type === "geographic" &&
      !assertion.value.place_name.trim()
    ) {
      issues.push(
        issue(
          "GEOGRAPHIC_VALUE_EMPTY",
          `${prefix}.value.place_name`,
          "geographic assertion requires a non-empty place_name",
        ),
      );
    }
  });

  return issues;
}
