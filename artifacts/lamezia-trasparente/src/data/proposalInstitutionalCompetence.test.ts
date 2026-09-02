import { describe, expect, it } from "vitest";

import {
  PROPOSAL_COMPETENCE_ASSESSMENTS,
  PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES,
  getProposalInstitutionalCompetence,
  hasVerifiedProposalCompetence,
} from "./proposalInstitutionalCompetence";
import { PUBLIC_PROPOSALS } from "./propostePubbliche";

describe("proposal institutional competence", () => {
  it("provides a canonical public addressee for every published proposal", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.proposalId).toBe(proposal.id);
      expect(competence.publicAddressee.length).toBeGreaterThan(0);
      expect(PROPOSAL_COMPETENCE_ASSESSMENT_STATUSES).toContain(
        competence.assessmentStatus,
      );
    }
  });

  it("keeps the exact source addressee available for audit", () => {
    for (const proposal of PUBLIC_PROPOSALS) {
      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.sourceAddressee).toBe(
        proposal.institutionalRecipient ?? null,
      );
    }
  });

  it("does not infer substantive competence from the documented addressee", () => {
    expect(Object.keys(PROPOSAL_COMPETENCE_ASSESSMENTS)).toHaveLength(0);

    for (const proposal of PUBLIC_PROPOSALS) {
      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toHaveLength(0);
      expect(hasVerifiedProposalCompetence(proposal)).toBe(false);
    }
  });

  it("simplifies internal role detail without changing the source record", () => {
    const asili = PUBLIC_PROPOSALS.find(
      (proposal) => proposal.id === "asili-nido-continuita-servizio-2026",
    );
    expect(asili).toBeDefined();

    const competence = getProposalInstitutionalCompetence(asili!);
    expect(competence.sourceAddressee).toContain("Sindaco");
    expect(competence.publicAddressee).toBe("Comune di Lamezia Terme");
  });
});
