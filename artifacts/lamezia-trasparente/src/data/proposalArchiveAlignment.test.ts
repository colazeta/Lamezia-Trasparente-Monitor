import { describe, expect, it } from "vitest";

import { getCanonicalProposalPresentationIds } from "./proposalCanonicalPresentation";
import { PROPOSAL_GEOGRAPHY, getProposalGeography } from "./proposalGeography";
import { getProposalInstitutionalState } from "./proposalInstitutionalState";
import {
  getMappedProposalThemes,
  getProposalPrimaryPaSubject,
} from "./proposalPaSemanticProfile";
import { PUBLIC_PROPOSALS } from "./propostePubbliche";

describe("civic proposal archive end-to-end alignment", () => {
  it("keeps the same published proposal set across canonical and geography layers", () => {
    const proposalIds = PUBLIC_PROPOSALS.map((proposal) => proposal.id).sort();
    expect(getCanonicalProposalPresentationIds()).toEqual(proposalIds);
    expect(Object.keys(PROPOSAL_GEOGRAPHY).sort()).toEqual(proposalIds);
  });

  it("gives every published proposal semantic, geographic and institutional metadata", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      expect(getProposalPrimaryPaSubject(proposal).uri).toMatch(/^https?:\/\//);
      expect(getProposalGeography(proposal.id)).toBeDefined();
      expect(getProposalInstitutionalState(proposal).publicState).toBeTruthy();
    }
  });

  it("keeps acquisition themes fully mapped without making them the public taxonomy", () => {
    const acquisitionThemes = [
      ...new Set(PUBLIC_PROPOSALS.map((proposal) => proposal.theme)),
    ].sort((a, b) => a.localeCompare(b, "it"));
    expect(getMappedProposalThemes()).toEqual(acquisitionThemes);
  });
});
