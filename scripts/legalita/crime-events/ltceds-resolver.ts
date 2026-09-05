import {
  planLtcedsCandidateCardinality,
  type LtcedsCandidateEnvelope,
  type LtcedsCandidateKind,
} from "./ltceds-source-registry";

export type LtcedsEventForm =
  | "discrete"
  | "continuous_episode"
  | "course_of_conduct";

export type LtcedsLocationPrecision =
  | "exact_point"
  | "address"
  | "site"
  | "street"
  | "neighbourhood"
  | "municipality"
  | "unknown";

export interface LtcedsTimeWindow {
  start: string;
  end?: string | null;
}

export interface LtcedsLocationAnchor {
  key: string;
  precision: LtcedsLocationPrecision;
}

export interface LtcedsExternalOccurrenceAnchor {
  sourceId: string;
  externalId: string;
}

export interface LtcedsOccurrenceCandidateItem {
  itemKey: string;
  externalOccurrenceIds: readonly LtcedsExternalOccurrenceAnchor[];
  timeWindow: LtcedsTimeWindow | null;
  occurrenceLocations: readonly LtcedsLocationAnchor[];
  offenceKeys: readonly string[];
  eventForm?: LtcedsEventForm | null;
  /** Procedural identifiers are retained for provenance but ignored for event identity. */
  proceduralIdentifiers?: readonly string[];
  /** Arrest/search/discovery/recovery locations are never occurrence match anchors. */
  proceduralLocations?: readonly LtcedsLocationAnchor[];
}

export interface LtcedsEventIndexEntry {
  eventId: string;
  externalOccurrenceIds: readonly LtcedsExternalOccurrenceAnchor[];
  timeWindow: LtcedsTimeWindow | null;
  occurrenceLocations: readonly LtcedsLocationAnchor[];
  offenceKeys: readonly string[];
  eventForm?: LtcedsEventForm | null;
}

export type LtcedsItemResolutionDecision =
  | "exact_existing_event"
  | "deterministic_existing_event"
  | "new_event_candidate"
  | "needs_review";

export type LtcedsResolutionDecision =
  | LtcedsItemResolutionDecision
  | "event_cluster_required"
  | "multiple_events_resolved"
  | "non_event";

export type LtcedsResolverRuleId =
  | "NON_EVENT_CONTEXT"
  | "AGGREGATE_CLUSTER_REQUIRED"
  | "PARTIAL_AGGREGATE_CLUSTER_REQUIRED"
  | "EXACT_EXTERNAL_OCCURRENCE_ID"
  | "EXACT_EXTERNAL_OCCURRENCE_ID_COLLISION"
  | "DETERMINISTIC_TIME_GEO_OFFENCE"
  | "DETERMINISTIC_MATCH_COLLISION"
  | "OCCURRENCE_CLASSIFICATION_CONFLICT"
  | "EVENT_FORM_CONFLICT"
  | "COMPLETE_UNMATCHED_OCCURRENCE"
  | "INSUFFICIENT_OCCURRENCE_ANCHORS"
  | "MULTIPLE_OCCURRENCES_RESOLVED";

export type LtcedsResolverConflictCode =
  | "external_anchor_collision"
  | "offence_conflict"
  | "event_form_conflict"
  | "insufficient_occurrence_time"
  | "insufficient_occurrence_location"
  | "insufficient_offence_classification"
  | "multiple_deterministic_matches"
  | "aggregate_remainder";

export interface LtcedsItemResolution {
  itemKey: string;
  decision: LtcedsItemResolutionDecision;
  ruleId: LtcedsResolverRuleId;
  matchedEventIds: string[];
  anchorsUsed: string[];
  conflicts: LtcedsResolverConflictCode[];
  rationale: string;
}

export interface LtcedsResolutionResult {
  candidateKey: string;
  decision: LtcedsResolutionDecision;
  ruleId: LtcedsResolverRuleId;
  matchedEventIds: string[];
  itemResults: LtcedsItemResolution[];
  conflicts: LtcedsResolverConflictCode[];
  rationale: string;
}

export interface ResolveLtcedsCandidateInput {
  candidate: Pick<
    LtcedsCandidateEnvelope,
    "candidateKey" | "candidateKind" | "claimedEventCount"
  >;
  items: readonly LtcedsOccurrenceCandidateItem[];
  eventIndex: readonly LtcedsEventIndexEntry[];
}

const STRONG_LOCATION_PRECISIONS = new Set<LtcedsLocationPrecision>([
  "exact_point",
  "address",
  "site",
]);

function normalizedToken(value: string): string {
  return value.trim().toLowerCase();
}

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function externalAnchorKey(anchor: LtcedsExternalOccurrenceAnchor): string {
  return `${normalizedToken(anchor.sourceId)}::${normalizedToken(anchor.externalId)}`;
}

function validateExternalAnchors(
  anchors: readonly LtcedsExternalOccurrenceAnchor[],
  label: string,
): void {
  for (const [index, anchor] of anchors.entries()) {
    if (!anchor.sourceId.trim() || !anchor.externalId.trim()) {
      throw new Error(`${label}[${index}] must contain sourceId and externalId`);
    }
  }
}

function validateLocations(
  locations: readonly LtcedsLocationAnchor[],
  label: string,
): void {
  for (const [index, location] of locations.entries()) {
    if (!location.key.trim()) {
      throw new Error(`${label}[${index}].key is required`);
    }
  }
}

function parseInstant(value: string, label: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a parseable ISO date/date-time`);
  }
  return parsed;
}

function normalizedWindow(
  window: LtcedsTimeWindow | null,
  label: string,
): { start: number; end: number } | null {
  if (window === null) return null;
  const start = parseInstant(window.start, `${label}.start`);
  const end = window.end
    ? parseInstant(window.end, `${label}.end`)
    : start;
  if (end < start) {
    throw new Error(`${label}.end must be on or after start`);
  }
  return { start, end };
}

export function ltcedsTimeWindowsOverlap(
  left: LtcedsTimeWindow | null,
  right: LtcedsTimeWindow | null,
): boolean {
  const leftWindow = normalizedWindow(left, "left time window");
  const rightWindow = normalizedWindow(right, "right time window");
  if (!leftWindow || !rightWindow) return false;
  return (
    leftWindow.start <= rightWindow.end &&
    rightWindow.start <= leftWindow.end
  );
}

function normalizedOffenceKeys(keys: readonly string[]): Set<string> {
  return new Set(keys.map(normalizedToken).filter(Boolean));
}

function offenceCompatibility(
  left: readonly string[],
  right: readonly string[],
): "compatible" | "conflict" | "unknown" {
  const leftKeys = normalizedOffenceKeys(left);
  const rightKeys = normalizedOffenceKeys(right);
  if (leftKeys.size === 0 || rightKeys.size === 0) return "unknown";
  for (const key of leftKeys) {
    if (rightKeys.has(key)) return "compatible";
  }
  return "conflict";
}

function strongLocationKeys(
  locations: readonly LtcedsLocationAnchor[],
): Set<string> {
  return new Set(
    locations
      .filter((location) => STRONG_LOCATION_PRECISIONS.has(location.precision))
      .map((location) => normalizedToken(location.key))
      .filter(Boolean),
  );
}

function strongOccurrenceLocationMatch(
  left: readonly LtcedsLocationAnchor[],
  right: readonly LtcedsLocationAnchor[],
): boolean {
  const leftKeys = strongLocationKeys(left);
  const rightKeys = strongLocationKeys(right);
  for (const key of leftKeys) {
    if (rightKeys.has(key)) return true;
  }
  return false;
}

function eventFormConflicts(
  left: LtcedsEventForm | null | undefined,
  right: LtcedsEventForm | null | undefined,
): boolean {
  return Boolean(left && right && left !== right);
}

function validateItem(item: LtcedsOccurrenceCandidateItem): void {
  if (!item.itemKey.trim()) throw new Error("itemKey is required");
  validateExternalAnchors(item.externalOccurrenceIds, "externalOccurrenceIds");
  validateLocations(item.occurrenceLocations, "occurrenceLocations");
  validateLocations(item.proceduralLocations ?? [], "proceduralLocations");
  normalizedWindow(item.timeWindow, `item ${item.itemKey} timeWindow`);
}

function validateEvent(event: LtcedsEventIndexEntry): void {
  if (!event.eventId.trim()) throw new Error("eventId is required");
  validateExternalAnchors(
    event.externalOccurrenceIds,
    `event ${event.eventId} externalOccurrenceIds`,
  );
  validateLocations(
    event.occurrenceLocations,
    `event ${event.eventId} occurrenceLocations`,
  );
  normalizedWindow(event.timeWindow, `event ${event.eventId} timeWindow`);
}

function exactExternalMatches(
  item: LtcedsOccurrenceCandidateItem,
  eventIndex: readonly LtcedsEventIndexEntry[],
): LtcedsEventIndexEntry[] {
  const itemAnchors = new Set(item.externalOccurrenceIds.map(externalAnchorKey));
  if (itemAnchors.size === 0) return [];
  return eventIndex.filter((event) =>
    event.externalOccurrenceIds.some((anchor) =>
      itemAnchors.has(externalAnchorKey(anchor)),
    ),
  );
}

interface DeterministicComparison {
  event: LtcedsEventIndexEntry;
  timeOverlap: boolean;
  strongLocationMatch: boolean;
  offence: "compatible" | "conflict" | "unknown";
  eventFormConflict: boolean;
}

function compareDeterministically(
  item: LtcedsOccurrenceCandidateItem,
  event: LtcedsEventIndexEntry,
): DeterministicComparison {
  return {
    event,
    timeOverlap: ltcedsTimeWindowsOverlap(item.timeWindow, event.timeWindow),
    strongLocationMatch: strongOccurrenceLocationMatch(
      item.occurrenceLocations,
      event.occurrenceLocations,
    ),
    offence: offenceCompatibility(item.offenceKeys, event.offenceKeys),
    eventFormConflict: eventFormConflicts(item.eventForm, event.eventForm),
  };
}

function resolveItem(
  item: LtcedsOccurrenceCandidateItem,
  eventIndex: readonly LtcedsEventIndexEntry[],
): LtcedsItemResolution {
  validateItem(item);
  for (const event of eventIndex) validateEvent(event);

  const exactMatches = exactExternalMatches(item, eventIndex);
  if (exactMatches.length > 1) {
    return {
      itemKey: item.itemKey,
      decision: "needs_review",
      ruleId: "EXACT_EXTERNAL_OCCURRENCE_ID_COLLISION",
      matchedEventIds: uniqueSorted(exactMatches.map((event) => event.eventId)),
      anchorsUsed: ["external_occurrence_id"],
      conflicts: ["external_anchor_collision"],
      rationale:
        "The same external occurrence anchor points to more than one canonical event; automatic resolution is disabled.",
    };
  }
  if (exactMatches.length === 1) {
    const event = exactMatches[0]!;
    const comparison = compareDeterministically(item, event);
    const conflicts: LtcedsResolverConflictCode[] = [];
    if (comparison.offence === "conflict") conflicts.push("offence_conflict");
    if (comparison.eventFormConflict) conflicts.push("event_form_conflict");
    return {
      itemKey: item.itemKey,
      decision: "exact_existing_event",
      ruleId: "EXACT_EXTERNAL_OCCURRENCE_ID",
      matchedEventIds: [event.eventId],
      anchorsUsed: ["external_occurrence_id"],
      conflicts,
      rationale:
        conflicts.length === 0
          ? "A stable source-native occurrence identifier already crosswalks to exactly one canonical event."
          : "A stable source-native occurrence identifier fixes event identity; later classification/form differences are retained as conflicts rather than creating a second event.",
    };
  }

  const comparisons = eventIndex.map((event) =>
    compareDeterministically(item, event),
  );
  const deterministicMatches = comparisons.filter(
    (comparison) =>
      comparison.timeOverlap &&
      comparison.strongLocationMatch &&
      comparison.offence === "compatible" &&
      !comparison.eventFormConflict,
  );

  if (deterministicMatches.length > 1) {
    return {
      itemKey: item.itemKey,
      decision: "needs_review",
      ruleId: "DETERMINISTIC_MATCH_COLLISION",
      matchedEventIds: uniqueSorted(
        deterministicMatches.map((comparison) => comparison.event.eventId),
      ),
      anchorsUsed: ["occurrence_time", "strong_occurrence_location", "offence"],
      conflicts: ["multiple_deterministic_matches"],
      rationale:
        "More than one canonical event satisfies the deterministic occurrence anchors; human review is required.",
    };
  }

  if (deterministicMatches.length === 1) {
    const match = deterministicMatches[0]!;
    return {
      itemKey: item.itemKey,
      decision: "deterministic_existing_event",
      ruleId: "DETERMINISTIC_TIME_GEO_OFFENCE",
      matchedEventIds: [match.event.eventId],
      anchorsUsed: ["occurrence_time", "strong_occurrence_location", "offence"],
      conflicts: [],
      rationale:
        "Occurrence time overlaps, a strong occurrence-location key matches and at least one canonical offence key is compatible.",
    };
  }

  const offenceConflicts = comparisons.filter(
    (comparison) =>
      comparison.timeOverlap &&
      comparison.strongLocationMatch &&
      comparison.offence === "conflict",
  );
  if (offenceConflicts.length > 0) {
    return {
      itemKey: item.itemKey,
      decision: "needs_review",
      ruleId: "OCCURRENCE_CLASSIFICATION_CONFLICT",
      matchedEventIds: uniqueSorted(
        offenceConflicts.map((comparison) => comparison.event.eventId),
      ),
      anchorsUsed: ["occurrence_time", "strong_occurrence_location"],
      conflicts: ["offence_conflict"],
      rationale:
        "Time and strong occurrence geography align with an existing event but canonical offence keys conflict; this may be a reclassification and cannot be resolved automatically without an exact occurrence anchor.",
    };
  }

  const formConflicts = comparisons.filter(
    (comparison) =>
      comparison.timeOverlap &&
      comparison.strongLocationMatch &&
      comparison.offence !== "conflict" &&
      comparison.eventFormConflict,
  );
  if (formConflicts.length > 0) {
    return {
      itemKey: item.itemKey,
      decision: "needs_review",
      ruleId: "EVENT_FORM_CONFLICT",
      matchedEventIds: uniqueSorted(
        formConflicts.map((comparison) => comparison.event.eventId),
      ),
      anchorsUsed: ["occurrence_time", "strong_occurrence_location"],
      conflicts: ["event_form_conflict"],
      rationale:
        "Occurrence anchors are close to an existing event but the event-form model conflicts; automatic merge/split is disabled.",
    };
  }

  const missing: LtcedsResolverConflictCode[] = [];
  if (item.timeWindow === null) missing.push("insufficient_occurrence_time");
  if (strongLocationKeys(item.occurrenceLocations).size === 0) {
    missing.push("insufficient_occurrence_location");
  }
  if (normalizedOffenceKeys(item.offenceKeys).size === 0) {
    missing.push("insufficient_offence_classification");
  }

  if (missing.length > 0) {
    return {
      itemKey: item.itemKey,
      decision: "needs_review",
      ruleId: "INSUFFICIENT_OCCURRENCE_ANCHORS",
      matchedEventIds: [],
      anchorsUsed: [],
      conflicts: missing,
      rationale:
        "The candidate lacks one or more occurrence-level anchors required for a deterministic new/match decision. Procedural identifiers and procedural locations are intentionally ignored.",
    };
  }

  return {
    itemKey: item.itemKey,
    decision: "new_event_candidate",
    ruleId: "COMPLETE_UNMATCHED_OCCURRENCE",
    matchedEventIds: [],
    anchorsUsed: ["occurrence_time", "strong_occurrence_location", "offence"],
    conflicts: [],
    rationale:
      "The candidate has complete deterministic occurrence anchors and no existing indexed event satisfies or conflicts with them. Event identity may be allocated by the later identity layer.",
  };
}

function candidateCardinalityShape(candidate: {
  candidateKind: LtcedsCandidateKind;
  claimedEventCount: number | null;
}): Pick<LtcedsCandidateEnvelope, "candidateKind" | "claimedEventCount"> {
  return candidate;
}

export function resolveLtcedsCandidate(
  input: ResolveLtcedsCandidateInput,
): LtcedsResolutionResult {
  if (!input.candidate.candidateKey.trim()) {
    throw new Error("candidateKey is required");
  }
  const itemKeys = input.items.map((item) => item.itemKey.trim());
  if (new Set(itemKeys).size !== itemKeys.length) {
    throw new Error("itemKey values must be unique within a candidate");
  }

  if (input.candidate.candidateKind === "non_event_context") {
    return {
      candidateKey: input.candidate.candidateKey,
      decision: "non_event",
      ruleId: "NON_EVENT_CONTEXT",
      matchedEventIds: [],
      itemResults: [],
      conflicts: [],
      rationale: "The candidate is explicitly classified as non-event context.",
    };
  }

  const cardinality = planLtcedsCandidateCardinality(
    candidateCardinalityShape(input.candidate),
    input.items.length,
  );
  if (cardinality === "event_cluster_required") {
    return {
      candidateKey: input.candidate.candidateKey,
      decision: "event_cluster_required",
      ruleId: "AGGREGATE_CLUSTER_REQUIRED",
      matchedEventIds: [],
      itemResults: [],
      conflicts: ["aggregate_remainder"],
      rationale:
        "The source claims multiple events but no individual occurrence items are resolved; synthetic event expansion is forbidden.",
    };
  }

  const itemResults = input.items.map((item) =>
    resolveItem(item, input.eventIndex),
  );
  const matchedEventIds = uniqueSorted(
    itemResults.flatMap((result) => result.matchedEventIds),
  );
  const conflicts = uniqueSorted(
    itemResults.flatMap((result) => result.conflicts),
  ) as LtcedsResolverConflictCode[];

  if (cardinality === "mixed_resolved_plus_cluster_required") {
    return {
      candidateKey: input.candidate.candidateKey,
      decision: "event_cluster_required",
      ruleId: "PARTIAL_AGGREGATE_CLUSTER_REQUIRED",
      matchedEventIds,
      itemResults,
      conflicts: uniqueSorted([
        ...conflicts,
        "aggregate_remainder",
      ]) as LtcedsResolverConflictCode[],
      rationale:
        "Some occurrences are individually resolved but the source claims additional unresolved events; the unresolved remainder must stay clustered.",
    };
  }

  if (itemResults.length > 1) {
    if (itemResults.some((result) => result.decision === "needs_review")) {
      return {
        candidateKey: input.candidate.candidateKey,
        decision: "needs_review",
        ruleId: "INSUFFICIENT_OCCURRENCE_ANCHORS",
        matchedEventIds,
        itemResults,
        conflicts,
        rationale:
          "The document contains multiple occurrence items and at least one item is ambiguous; document-level automatic resolution is disabled.",
      };
    }
    return {
      candidateKey: input.candidate.candidateKey,
      decision: "multiple_events_resolved",
      ruleId: "MULTIPLE_OCCURRENCES_RESOLVED",
      matchedEventIds,
      itemResults,
      conflicts,
      rationale:
        "The source record contains more than one individually resolved occurrence item; they remain distinct event-resolution units.",
    };
  }

  if (itemResults.length === 1) {
    const only = itemResults[0]!;
    return {
      candidateKey: input.candidate.candidateKey,
      decision: only.decision,
      ruleId: only.ruleId,
      matchedEventIds: only.matchedEventIds,
      itemResults,
      conflicts: only.conflicts,
      rationale: only.rationale,
    };
  }

  return {
    candidateKey: input.candidate.candidateKey,
    decision: "needs_review",
    ruleId: "INSUFFICIENT_OCCURRENCE_ANCHORS",
    matchedEventIds: [],
    itemResults: [],
    conflicts: [
      "insufficient_occurrence_time",
      "insufficient_occurrence_location",
      "insufficient_offence_classification",
    ],
    rationale:
      "No individual occurrence item is available and no multi-event aggregate count requires a cluster.",
  };
}
