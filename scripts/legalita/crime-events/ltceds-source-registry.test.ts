import assert from "node:assert/strict";
import test from "node:test";

import {
  buildLtcedsCandidate,
  canonicalizeLtcedsSourceUrl,
  evaluateLtcedsSourceDisposition,
  isOccurrenceAssertion,
  isProceduralOnlyCandidate,
  planLtcedsCandidateCardinality,
  sourceMaySolelySupportPublicEvent,
  type LtcedsCandidateAssertion,
  type LtcedsSourceDefinition,
} from "./ltceds-source-registry";

const officialSource: LtcedsSourceDefinition = {
  sourceId: "synthetic-official-source",
  name: "Synthetic official incident source",
  authorityType: "law_enforcement_primary",
  acquisitionMode: "api",
  contentMode: "structured",
  evidenceRole: "occurrence_primary",
  candidatePolicy: "automatic",
  publicationSupport: "primary_possible",
  reuseStatus: "open_reuse",
  personalDataRisk: "medium",
  reputationalRisk: "medium",
  requiresCorroboration: false,
  limitations: ["Synthetic fixture only."],
};

const pressSource: LtcedsSourceDefinition = {
  sourceId: "synthetic-press-source",
  name: "Synthetic secondary press source",
  authorityType: "press_secondary",
  acquisitionMode: "rss",
  contentMode: "narrative",
  evidenceRole: "discovery_only",
  candidatePolicy: "automatic",
  publicationSupport: "discovery_only",
  reuseStatus: "public_access",
  personalDataRisk: "medium",
  reputationalRisk: "medium",
  requiresCorroboration: true,
  limitations: ["Discovery only."],
};

const highRiskSource: LtcedsSourceDefinition = {
  ...officialSource,
  sourceId: "synthetic-high-risk-source",
  name: "Synthetic high-risk source",
  candidatePolicy: "automatic",
  personalDataRisk: "high",
};

const occurrenceAssertions: LtcedsCandidateAssertion[] = [
  {
    role: "occurrence_date",
    value: "2026-09-01",
    basis: "source_stated",
  },
  {
    role: "occurrence_location",
    value: "public-place-token",
    basis: "structured_field",
  },
  {
    role: "offence_classification",
    value: "ICCS-placeholder",
    basis: "editorial_review",
  },
];

function buildCandidate(overrides: Partial<Parameters<typeof buildLtcedsCandidate>[0]> = {}) {
  return buildLtcedsCandidate({
    source: officialSource,
    sourceRecordId: "record-001",
    url: "https://example.invalid/incidents/1",
    publishedAt: "2026-09-01T10:00:00Z",
    retrievedAt: "2026-09-02T10:00:00Z",
    content: "synthetic source content",
    candidateKind: "incident_report",
    assertions: occurrenceAssertions,
    ...overrides,
  });
}

test("canonical URL removes tracking parameters, fragments and sorts query values", () => {
  const left = canonicalizeLtcedsSourceUrl(
    "https://Example.Invalid/item?utm_source=x&b=2&a=1&fbclid=abc#section",
  );
  const right = canonicalizeLtcedsSourceUrl(
    "https://example.invalid/item?a=1&b=2",
  );

  assert.equal(left, right);
});

test("candidate identity is stable across retrievals and content changes", () => {
  const first = buildCandidate();
  const later = buildCandidate({
    retrievedAt: "2026-09-05T12:00:00Z",
    content: "updated synthetic source content",
  });

  assert.equal(first.candidateKey, later.candidateKey);
  assert.notEqual(first.contentSha256, later.contentSha256);
});

test("source-native record id stabilises identity even if the URL moves", () => {
  const first = buildCandidate({
    url: "https://example.invalid/archive/old-location",
  });
  const moved = buildCandidate({
    url: "https://example.invalid/archive/new-location",
  });

  assert.equal(first.candidateKey, moved.candidateKey);
});

test("secondary press is discovery-only and cannot solely support publication", () => {
  assert.equal(evaluateLtcedsSourceDisposition(pressSource), "discovery_only");
  assert.equal(sourceMaySolelySupportPublicEvent(pressSource), false);
  assert.equal(sourceMaySolelySupportPublicEvent(officialSource), true);
});

test("high-risk sources are forced through a human gate", () => {
  assert.equal(evaluateLtcedsSourceDisposition(highRiskSource), "human_gate");

  const candidate = buildCandidate({ source: highRiskSource });
  assert.equal(candidate.resolutionState, "needs_review");
  assert.equal(sourceMaySolelySupportPublicEvent(highRiskSource), false);
});

test("aggregate source counts require clusters instead of synthetic event expansion", () => {
  const aggregate = buildCandidate({
    candidateKind: "aggregate_report",
    claimedEventCount: 27,
    assertions: [
      {
        role: "event_count",
        value: "27",
        basis: "source_stated",
      },
    ],
  });

  assert.equal(
    planLtcedsCandidateCardinality(aggregate, 0),
    "event_cluster_required",
  );
  assert.equal(
    planLtcedsCandidateCardinality(aggregate, 4),
    "mixed_resolved_plus_cluster_required",
  );
  assert.equal(
    planLtcedsCandidateCardinality(aggregate, 27),
    "individual_resolution_possible",
  );
  assert.throws(
    () => planLtcedsCandidateCardinality(aggregate, 28),
    /cannot exceed/,
  );
});

test("arrest, search and discovery assertions remain procedural-only", () => {
  const procedural = buildCandidate({
    candidateKind: "press_release",
    assertions: [
      {
        role: "arrest_location",
        value: "arrest-place-token",
        basis: "source_stated",
      },
      {
        role: "search_date",
        value: "2026-09-02",
        basis: "source_stated",
      },
      {
        role: "procedural_status",
        value: "procedural-stage-token",
        basis: "source_stated",
      },
    ],
  });

  assert.equal(isProceduralOnlyCandidate(procedural), true);
  assert.equal(procedural.assertions.some(isOccurrenceAssertion), false);
});

test("occurrence assertions are distinguishable from procedural assertions", () => {
  const candidate = buildCandidate();
  assert.equal(candidate.assertions.filter(isOccurrenceAssertion).length, 3);
  assert.equal(isProceduralOnlyCandidate(candidate), false);
});

test("non-event context is rejected at the candidate boundary", () => {
  const context = buildCandidate({
    candidateKind: "non_event_context",
    assertions: [],
  });

  assert.equal(context.resolutionState, "rejected_non_event");
  assert.equal(planLtcedsCandidateCardinality(context, 0), "no_event");
});

test("candidate builder rejects missing locators and invalid aggregate counts", () => {
  assert.throws(
    () =>
      buildCandidate({
        sourceRecordId: null,
        url: null,
      }),
    /sourceRecordId or url is required/,
  );
  assert.throws(
    () => buildCandidate({ claimedEventCount: 0 }),
    /positive integer/,
  );
});

test("candidate builder copies assertions instead of mutating caller input", () => {
  const assertions: LtcedsCandidateAssertion[] = [
    {
      role: "occurrence_date",
      value: "2026-09-01",
      basis: "source_stated",
    },
  ];
  const before = structuredClone(assertions);
  const candidate = buildCandidate({ assertions });

  assert.deepEqual(assertions, before);
  assert.notEqual(candidate.assertions, assertions);
  assert.equal(candidate.assertions[0]?.sourceLocator, null);
});
