import assert from "node:assert/strict";
import test from "node:test";

import {
  ltcedsTimeWindowsOverlap,
  resolveLtcedsCandidate,
  type LtcedsEventIndexEntry,
  type LtcedsOccurrenceCandidateItem,
} from "./ltceds-resolver";

function candidate(
  overrides: Partial<{
    candidateKey: string;
    candidateKind:
      | "incident_report"
      | "press_release"
      | "judicial_document"
      | "news_article"
      | "aggregate_report"
      | "historical_source"
      | "non_event_context";
    claimedEventCount: number | null;
  }> = {},
) {
  return {
    candidateKey: "cand_synthetic",
    candidateKind: "news_article" as const,
    claimedEventCount: null,
    ...overrides,
  };
}

function item(
  overrides: Partial<LtcedsOccurrenceCandidateItem> = {},
): LtcedsOccurrenceCandidateItem {
  return {
    itemKey: "item-1",
    externalOccurrenceIds: [],
    timeWindow: { start: "2026-09-01" },
    occurrenceLocations: [{ key: "site:alpha", precision: "site" }],
    offenceKeys: ["iccs:0501"],
    eventForm: "discrete",
    proceduralIdentifiers: [],
    proceduralLocations: [],
    ...overrides,
  };
}

function event(
  overrides: Partial<LtcedsEventIndexEntry> = {},
): LtcedsEventIndexEntry {
  return {
    eventId: "event-a",
    externalOccurrenceIds: [],
    timeWindow: { start: "2026-09-01" },
    occurrenceLocations: [{ key: "site:alpha", precision: "site" }],
    offenceKeys: ["iccs:0501"],
    eventForm: "discrete",
    ...overrides,
  };
}

test("two source records can deterministically resolve to the same canonical occurrence", () => {
  const index = [event()];
  const first = resolveLtcedsCandidate({
    candidate: candidate({ candidateKey: "cand_article_a" }),
    items: [item()],
    eventIndex: index,
  });
  const second = resolveLtcedsCandidate({
    candidate: candidate({ candidateKey: "cand_article_b" }),
    items: [item({ itemKey: "item-b" })],
    eventIndex: index,
  });

  assert.equal(first.decision, "deterministic_existing_event");
  assert.equal(second.decision, "deterministic_existing_event");
  assert.deepEqual(first.matchedEventIds, ["event-a"]);
  assert.deepEqual(second.matchedEventIds, ["event-a"]);
});

test("same proceeding identifier does not merge distinct occurrences", () => {
  const index = [event()];
  const distinct = item({
    timeWindow: { start: "2026-09-08" },
    occurrenceLocations: [{ key: "site:beta", precision: "site" }],
    offenceKeys: ["iccs:0601"],
    proceduralIdentifiers: ["case:same-proceeding"],
  });

  const result = resolveLtcedsCandidate({
    candidate: candidate(),
    items: [distinct],
    eventIndex: [
      event({
        // Procedural identifiers intentionally do not exist in the event index.
      }),
    ],
  });

  assert.equal(result.decision, "new_event_candidate");
  assert.deepEqual(result.matchedEventIds, []);
});

test("arrest location never substitutes for missing occurrence geography", () => {
  const result = resolveLtcedsCandidate({
    candidate: candidate(),
    items: [
      item({
        occurrenceLocations: [],
        proceduralLocations: [{ key: "site:alpha", precision: "site" }],
      }),
    ],
    eventIndex: [event()],
  });

  assert.equal(result.decision, "needs_review");
  assert.ok(result.conflicts.includes("insufficient_occurrence_location"));
  assert.deepEqual(result.matchedEventIds, []);
});

test("same occurrence time and strong geography with incompatible offence requires review", () => {
  const result = resolveLtcedsCandidate({
    candidate: candidate(),
    items: [item({ offenceKeys: ["iccs:0901"] })],
    eventIndex: [event()],
  });

  assert.equal(result.decision, "needs_review");
  assert.equal(result.ruleId, "OCCURRENCE_CLASSIFICATION_CONFLICT");
  assert.deepEqual(result.matchedEventIds, ["event-a"]);
  assert.ok(result.conflicts.includes("offence_conflict"));
});

test("stable external occurrence anchor preserves identity across later reclassification", () => {
  const result = resolveLtcedsCandidate({
    candidate: candidate({ candidateKind: "judicial_document" }),
    items: [
      item({
        externalOccurrenceIds: [
          { sourceId: "official-source", externalId: "occ-42" },
        ],
        offenceKeys: ["istat:later-qualification"],
      }),
    ],
    eventIndex: [
      event({
        externalOccurrenceIds: [
          { sourceId: "OFFICIAL-SOURCE", externalId: "OCC-42" },
        ],
        offenceKeys: ["iccs:0501"],
      }),
    ],
  });

  assert.equal(result.decision, "exact_existing_event");
  assert.equal(result.ruleId, "EXACT_EXTERNAL_OCCURRENCE_ID");
  assert.deepEqual(result.matchedEventIds, ["event-a"]);
  assert.ok(result.conflicts.includes("offence_conflict"));
});

test("point date overlaps a conservative occurrence interval", () => {
  assert.equal(
    ltcedsTimeWindowsOverlap(
      { start: "2026-09-05" },
      { start: "2026-09-01", end: "2026-09-10" },
    ),
    true,
  );

  const result = resolveLtcedsCandidate({
    candidate: candidate(),
    items: [item({ timeWindow: { start: "2026-09-05" } })],
    eventIndex: [
      event({
        timeWindow: { start: "2026-09-01", end: "2026-09-10" },
      }),
    ],
  });

  assert.equal(result.decision, "deterministic_existing_event");
});

test("unresolved aggregate count produces a cluster rather than synthetic event IDs", () => {
  const result = resolveLtcedsCandidate({
    candidate: candidate({
      candidateKind: "aggregate_report",
      claimedEventCount: 27,
    }),
    items: [],
    eventIndex: [],
  });

  assert.equal(result.decision, "event_cluster_required");
  assert.equal(result.ruleId, "AGGREGATE_CLUSTER_REQUIRED");
  assert.deepEqual(result.matchedEventIds, []);
});

test("partially resolved aggregate retains an unresolved cluster remainder", () => {
  const result = resolveLtcedsCandidate({
    candidate: candidate({
      candidateKind: "aggregate_report",
      claimedEventCount: 3,
    }),
    items: [
      item({
        itemKey: "known-one",
        externalOccurrenceIds: [
          { sourceId: "official", externalId: "one" },
        ],
      }),
    ],
    eventIndex: [
      event({
        externalOccurrenceIds: [
          { sourceId: "official", externalId: "one" },
        ],
      }),
    ],
  });

  assert.equal(result.decision, "event_cluster_required");
  assert.equal(result.ruleId, "PARTIAL_AGGREGATE_CLUSTER_REQUIRED");
  assert.deepEqual(result.matchedEventIds, ["event-a"]);
  assert.ok(result.conflicts.includes("aggregate_remainder"));
});

test("one source record with two explicit occurrence items remains two event-resolution units", () => {
  const result = resolveLtcedsCandidate({
    candidate: candidate({ candidateKind: "judicial_document" }),
    items: [
      item({
        itemKey: "occurrence-a",
        externalOccurrenceIds: [
          { sourceId: "official", externalId: "a" },
        ],
      }),
      item({
        itemKey: "occurrence-b",
        externalOccurrenceIds: [
          { sourceId: "official", externalId: "b" },
        ],
        timeWindow: { start: "2026-09-03" },
        occurrenceLocations: [{ key: "site:beta", precision: "site" }],
      }),
    ],
    eventIndex: [
      event({
        eventId: "event-a",
        externalOccurrenceIds: [
          { sourceId: "official", externalId: "a" },
        ],
      }),
      event({
        eventId: "event-b",
        externalOccurrenceIds: [
          { sourceId: "official", externalId: "b" },
        ],
        timeWindow: { start: "2026-09-03" },
        occurrenceLocations: [{ key: "site:beta", precision: "site" }],
      }),
    ],
  });

  assert.equal(result.decision, "multiple_events_resolved");
  assert.equal(result.itemResults.length, 2);
  assert.deepEqual(result.matchedEventIds, ["event-a", "event-b"]);
});

test("insufficient occurrence evidence never guesses from coarse geography", () => {
  const result = resolveLtcedsCandidate({
    candidate: candidate(),
    items: [
      item({
        timeWindow: null,
        occurrenceLocations: [
          { key: "municipality:lamezia", precision: "municipality" },
        ],
        offenceKeys: [],
      }),
    ],
    eventIndex: [],
  });

  assert.equal(result.decision, "needs_review");
  assert.ok(result.conflicts.includes("insufficient_occurrence_time"));
  assert.ok(result.conflicts.includes("insufficient_occurrence_location"));
  assert.ok(result.conflicts.includes("insufficient_offence_classification"));
});

test("external occurrence anchor collision fails closed", () => {
  const sharedAnchor = [{ sourceId: "official", externalId: "collision" }];
  const result = resolveLtcedsCandidate({
    candidate: candidate(),
    items: [item({ externalOccurrenceIds: sharedAnchor })],
    eventIndex: [
      event({ eventId: "event-a", externalOccurrenceIds: sharedAnchor }),
      event({ eventId: "event-b", externalOccurrenceIds: sharedAnchor }),
    ],
  });

  assert.equal(result.decision, "needs_review");
  assert.equal(result.ruleId, "EXACT_EXTERNAL_OCCURRENCE_ID_COLLISION");
  assert.deepEqual(result.matchedEventIds, ["event-a", "event-b"]);
});

test("event-form conflict blocks deterministic merge", () => {
  const result = resolveLtcedsCandidate({
    candidate: candidate(),
    items: [item({ eventForm: "continuous_episode" })],
    eventIndex: [event({ eventForm: "discrete" })],
  });

  assert.equal(result.decision, "needs_review");
  assert.equal(result.ruleId, "EVENT_FORM_CONFLICT");
  assert.ok(result.conflicts.includes("event_form_conflict"));
});

test("neighbourhood-only geography is not a deterministic auto-merge anchor", () => {
  const result = resolveLtcedsCandidate({
    candidate: candidate(),
    items: [
      item({
        occurrenceLocations: [
          { key: "neighbourhood:north", precision: "neighbourhood" },
        ],
      }),
    ],
    eventIndex: [
      event({
        occurrenceLocations: [
          { key: "neighbourhood:north", precision: "neighbourhood" },
        ],
      }),
    ],
  });

  assert.equal(result.decision, "needs_review");
  assert.ok(result.conflicts.includes("insufficient_occurrence_location"));
});

test("explicit non-event context remains non-event even if an index entry looks similar", () => {
  const result = resolveLtcedsCandidate({
    candidate: candidate({ candidateKind: "non_event_context" }),
    items: [item()],
    eventIndex: [event()],
  });

  assert.equal(result.decision, "non_event");
  assert.deepEqual(result.itemResults, []);
  assert.deepEqual(result.matchedEventIds, []);
});
