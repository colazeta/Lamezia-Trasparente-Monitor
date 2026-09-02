import { describe, expect, it } from "vitest";

import {
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getAvailablePrimaryPaSubjects,
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
  getMappedProposalThemes,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";
import {
  PROPOSAL_GEOGRAPHY,
  getProposalGeography,
  isProposalGeoreferenced,
} from "./proposalGeography";

function sorted(values: readonly string[]) {
  return [...values].sort((a, b) => a.localeCompare(b, "it"));
}

describe("proposal archive end-to-end integrity", () => {
  it("keeps one exact proposal-id universe across dataset, canonical layer and geography", () => {
    const proposalIds = sorted(PUBLIC_PROPOSALS.map((proposal) => proposal.id));
    const canonicalIds = sorted(getCanonicalProposalPresentationIds());
    const geographyIds = sorted(Object.keys(PROPOSAL_GEOGRAPHY));

    expect(new Set(proposalIds).size).toBe(proposalIds.length);
    expect(canonicalIds).toEqual(proposalIds);
    expect(geographyIds).toEqual(proposalIds);
  });

  it("requires every published proposal to resolve through all structural layers", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const canonical = getCanonicalProposalPresentation(proposal);
      const geography = getProposalGeography(proposal.id);
      const primary = getProposalPrimaryPaSubject(proposal);
      const secondary = getProposalSecondaryPaSubjects(proposal);

      expect(canonical.proposalId, proposal.id).toBe(proposal.id);
      expect(canonical.measures.length, proposal.id).toBeGreaterThan(0);
      expect(canonical.actionTypes.length, proposal.id).toBeGreaterThan(0);

      expect(geography, proposal.id).toBeDefined();
      expect(primary.uri, proposal.id).toMatch(/^https?:\/\//);
      expect(secondary.some((subject) => subject.uri === primary.uri), proposal.id).toBe(false);

      if (geography?.scope === "citywide") {
        expect(geography.points, proposal.id).toHaveLength(0);
        expect(isProposalGeoreferenced(proposal.id), proposal.id).toBe(false);
      } else {
        expect(geography?.points.length, proposal.id).toBeGreaterThan(0);
        expect(isProposalGeoreferenced(proposal.id), proposal.id).toBe(true);
      }
    }
  });

  it("keeps acquisition themes fully mapped but separate from public semantic navigation", () => {
    const acquisitionThemes = sorted(
      [...new Set(PUBLIC_PROPOSALS.map((proposal) => proposal.theme))],
    );
    expect(getMappedProposalThemes()).toEqual(acquisitionThemes);

    const primaryUris = new Set(
      PUBLIC_PROPOSALS.map((proposal) => getProposalPrimaryPaSubject(proposal).uri),
    );
    const publicNavigationUris = new Set(
      getAvailablePrimaryPaSubjects(PUBLIC_PROPOSALS).map((subject) => subject.uri),
    );

    expect(publicNavigationUris).toEqual(primaryUris);
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
  });

  it("keeps timeline metadata internally chronological", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      expect(proposal.lastUpdated >= proposal.firstSeen, proposal.id).toBe(true);

      const latestEventDate = proposal.events.reduce(
        (latest, event) => (event.date > latest ? event.date : latest),
        "",
      );

      if (latestEventDate) {
        expect(proposal.lastUpdated >= latestEventDate, proposal.id).toBe(true);
      }

      const eventIds = proposal.events.map((event) => event.id);
      expect(new Set(eventIds).size, proposal.id).toBe(eventIds.length);
    }
  });
});
