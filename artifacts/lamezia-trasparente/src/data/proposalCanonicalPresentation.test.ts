import { describe, expect, it } from "vitest";

import {
  CANONICAL_PROPOSAL_ACTIONS,
  PUBLIC_PROPOSALS,
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
} from "./propostePubbliche";

describe("canonical proposal presentation", () => {
  it("covers every published proposal and has no orphan entries", () => {
    const proposalIds = [...PUBLIC_PROPOSALS.map((proposal) => proposal.id)].sort();
    expect(getCanonicalProposalPresentationIds()).toEqual(proposalIds);
  });

  it("uses a compact source-neutral contract for every proposal", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const canonical = getCanonicalProposalPresentation(proposal);

      expect(canonical.proposalId).toBe(proposal.id);
      expect(canonical.version).toBe("1.0");
      expect(canonical.title.length).toBeGreaterThan(4);
      expect(canonical.title.length).toBeLessThanOrEqual(90);
      expect(canonical.request.length).toBeGreaterThan(15);
      expect(canonical.request.length).toBeLessThanOrEqual(260);
      expect(canonical.measures.length).toBeGreaterThan(0);
      expect(canonical.measures.length).toBeLessThanOrEqual(8);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);

      expect(canonical.request).not.toMatch(
        /^(richiesta|proposta|petizione|mozione|interrogazione|comunicato)\b/i,
      );

      for (const actionType of canonical.actionTypes) {
        expect(CANONICAL_PROPOSAL_ACTIONS).toContain(actionType);
      }
      for (const measure of canonical.measures) {
        expect(measure.length).toBeGreaterThan(8);
        expect(measure.length).toBeLessThanOrEqual(220);
      }
    }
  });

  it("keeps canonical wording distinct from the acquisition record where needed", () => {
    const changed = PUBLIC_PROPOSALS.filter((proposal) => {
      const canonical = getCanonicalProposalPresentation(proposal);
      return canonical.title !== proposal.title || canonical.request !== proposal.summary;
    });

    expect(changed.length).toBeGreaterThanOrEqual(Math.floor(PUBLIC_PROPOSALS.length * 0.8));
  });
});
