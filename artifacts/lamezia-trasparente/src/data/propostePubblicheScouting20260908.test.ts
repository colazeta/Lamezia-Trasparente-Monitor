import { describe, expect, it } from "vitest";

import { getProposalGeography } from "./proposalGeography";
import {
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";

const PROPOSAL_ID = "parco-via-degli-itali-manutenzione-branca-2026";

describe("scouted public proposals 8 September 2026", () => {
  it("publishes Branca's via degli Itali request once with normalized promoter and documented recipient", () => {
    const matches = PUBLIC_PROPOSALS.filter((proposal) => proposal.id === PROPOSAL_ID);
    expect(matches).toHaveLength(1);

    const proposal = matches[0];
    expect(proposal.promoterId).toBe("oscar-branca");
    expect(proposal.promoterType).toBe("consigliere");
    expect(proposal.channel).toBe("comunicato");
    expect(proposal.status).toBe("proposta_emersa");
    expect(proposal.institutionalRecipient).toContain("Comune di Lamezia Terme");
    expect(proposal.threadId).toBe("parco-via-degli-itali-manutenzione");
  });

  it("does not infer a formal deposit, competence or implementation from reported prior notices", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === PROPOSAL_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(proposal.events.some((event) => event.type === "deposito")).toBe(false);

    const state = getProposalInstitutionalState(proposal);
    expect(state.hasFormalization).toBe(false);
    expect(state.implementation).toBe("none");
    expect(state.publicState).toBe("segnalata");

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.publicAddressee).toBe("Comune di Lamezia Terme");
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();
    expect(competence.involvedAuthorities).toHaveLength(0);
  });

  it("has canonical presentation and exactly one official primary matter", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === PROPOSAL_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(PROPOSAL_ID);
    expect(canonical.title).toBe(
      "Sicurezza e manutenzione del parco di via degli Itali",
    );
    expect(canonical.actionTypes).toEqual(
      expect.arrayContaining(["manutenzione", "messa_in_sicurezza"]),
    );
    expect(canonical.measures).toHaveLength(4);

    expect(getProposalPrimaryPaSubject(proposal).code).toBe("5");
    expect(getProposalSecondaryPaSubjects(proposal)).toHaveLength(0);
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
  });

  it("uses area geography with a verified street reference and no false landmark precision", () => {
    const geography = getProposalGeography(PROPOSAL_ID);
    expect(geography).toBeDefined();
    expect(geography?.scope).toBe("area");
    expect(geography?.areas).toContain("nicastro");
    expect(geography?.points).toHaveLength(1);
    expect(geography?.points[0]?.precision).toBe("street_approximate");
    expect(geography?.points[0]?.latitude).toBeCloseTo(38.948849, 6);
    expect(geography?.points[0]?.longitude).toBeCloseTo(16.3055, 6);
  });
});
