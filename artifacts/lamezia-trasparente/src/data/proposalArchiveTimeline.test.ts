import { describe, expect, it } from "vitest";

import {
  INSTITUTIONAL_PROPOSAL_EVENT_TYPES,
  getInstitutionalProposalEvents,
  getProposalTimelineBuckets,
  proposalMatchesTimelineRange,
} from "./proposalArchiveTimeline";
import { PUBLIC_PROPOSALS } from "./propostePubbliche";

describe("proposal archive timeline", () => {
  it("counts every proposal exactly once in origin mode", () => {
    const buckets = getProposalTimelineBuckets(PUBLIC_PROPOSALS, "origins");
    expect(buckets.length).toBeGreaterThan(0);
    expect(buckets.reduce((sum, bucket) => sum + bucket.proposalCount, 0)).toBe(
      PUBLIC_PROPOSALS.length,
    );
  });

  it("counts all documented events in developments mode", () => {
    const expectedEvents = PUBLIC_PROPOSALS.reduce(
      (sum, proposal) => sum + proposal.events.length,
      0,
    );
    const buckets = getProposalTimelineBuckets(PUBLIC_PROPOSALS, "events");
    expect(buckets.reduce((sum, bucket) => sum + bucket.eventCount, 0)).toBe(
      expectedEvents,
    );
  });

  it("filters proposals by the selected month", () => {
    const bucket = getProposalTimelineBuckets(PUBLIC_PROPOSALS, "origins").find(
      (item) => item.proposalCount > 0,
    );
    expect(bucket).toBeDefined();
    const range = bucket
      ? { key: bucket.key, label: bucket.label, start: bucket.start, end: bucket.end }
      : null;
    const matches = PUBLIC_PROPOSALS.filter((proposal) =>
      proposalMatchesTimelineRange(proposal, range, "origins"),
    );
    expect(matches.length).toBe(bucket?.proposalCount);
  });

  it("keeps the institutional path limited to documented institutional event types", () => {
    const allowed = new Set(INSTITUTIONAL_PROPOSAL_EVENT_TYPES);
    const events = PUBLIC_PROPOSALS.flatMap((proposal) =>
      getInstitutionalProposalEvents(proposal),
    );
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => allowed.has(event.type as never))).toBe(true);
  });
});
