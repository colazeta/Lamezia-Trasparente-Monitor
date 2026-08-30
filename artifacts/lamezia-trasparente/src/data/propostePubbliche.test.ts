import { describe, expect, it } from "vitest";

import {
  PUBLIC_PROPOSALS,
  filterPublicProposals,
  getLatestProposalEvents,
  groupProposalsByPromoter,
  groupProposalsByThread,
} from "./propostePubbliche";

describe("proposte civiche data model", () => {
  it("clusters records by canonical promoter", () => {
    const groups = groupProposalsByPromoter(PUBLIC_PROPOSALS);
    const lameziaTrasparente = groups.find(
      (group) => group.promoterId === "lamezia-trasparente",
    );

    expect(lameziaTrasparente?.proposals).toHaveLength(4);
  });

  it("keeps successive developments inside the same proposal history", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === "riuso-libri-scolastici-inclusione-2026",
    );

    expect(proposal?.events.map((event) => event.date)).toEqual([
      "2026-06-15",
      "2026-08-13",
    ]);
  });

  it("clusters related proposals into thematic threads", () => {
    const groups = groupProposalsByThread(PUBLIC_PROPOSALS);
    const transparencyThread = groups.find(
      (group) => group.threadId === "trasparenza-sedute",
    );

    expect(transparencyThread?.proposals).toHaveLength(3);
  });

  it("returns recent developments in reverse chronological order", () => {
    const events = getLatestProposalEvents(PUBLIC_PROPOSALS, 8);
    const dates = events.map(({ event }) => event.date);

    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });

  it("filters by canonical promoter label", () => {
    const proposals = filterPublicProposals(PUBLIC_PROPOSALS, {
      promoter: "Lamezia Trasparente",
    });

    expect(proposals).toHaveLength(4);
    expect(
      proposals.every(
        (proposal) => proposal.promoterId === "lamezia-trasparente",
      ),
    ).toBe(true);
  });

  it("keeps timeline dates internally coherent", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const dates = proposal.events.map((event) => event.date).sort();
      const emergenceDates = proposal.events
        .filter((event) => event.type === "emersione")
        .map((event) => event.date)
        .sort();
      expect(dates.length).toBeGreaterThan(0);
      expect(proposal.firstSeen).toBe(emergenceDates[0] ?? dates[0]);
      expect(proposal.lastUpdated).toBe(dates[dates.length - 1]);
      expect(new Set(proposal.events.map((event) => event.id)).size).toBe(
        proposal.events.length,
      );
    }
  });
});
