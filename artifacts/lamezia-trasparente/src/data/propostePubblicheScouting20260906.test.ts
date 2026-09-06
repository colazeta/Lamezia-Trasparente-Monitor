import { describe, expect, it } from "vitest";

import { getProposalGeography } from "./proposalGeography";
import {
  PUBLIC_PROPOSALS,
  getCanonicalProposalPresentation,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";

const PETITION_ID = "sanita-pubblica-petizione-presidio-malerba-2026";

describe("scouted public proposals 6 September 2026", () => {
  it("publishes the health petition once with a documented addressee", () => {
    const matches = PUBLIC_PROPOSALS.filter((proposal) => proposal.id === PETITION_ID);
    expect(matches).toHaveLength(1);

    const proposal = matches[0];
    expect(proposal.promoterId).toBe("presidio-sanita-lametina-nicola-malerba");
    expect(proposal.channel).toBe("petizione");
    expect(proposal.status).toBe("proposta_emersa");
    expect(proposal.institutionalRecipient).toContain("Regione Calabria");
    expect(proposal.institutionalRecipient).toContain("Azienda Sanitaria Provinciale");
    expect(proposal.institutionalRecipient).toContain("Comune di Lamezia Terme");
  });

  it("keeps petition, formal deposit and competence separate", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === PETITION_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(proposal.events.some((event) => event.type === "petizione")).toBe(true);
    expect(proposal.events.some((event) => event.type === "deposito")).toBe(false);

    const state = getProposalInstitutionalState(proposal);
    expect(state.hasFormalization).toBe(false);
    expect(state.implementation).toBe("none");
    expect(state.publicState).toBe("segnalata");

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();
    expect(competence.involvedAuthorities).toHaveLength(0);
  });

  it("has canonical presentation, official primary matter and citywide geography", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === PETITION_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(PETITION_ID);
    expect(canonical.title).toBe(
      "Rafforzamento della sanità pubblica e dei servizi territoriali",
    );
    expect(canonical.measures.length).toBeGreaterThanOrEqual(10);

    expect(getProposalPrimaryPaSubject(proposal).code).toBe("2");
    expect(getProposalSecondaryPaSubjects(proposal)).toHaveLength(0);

    const geography = getProposalGeography(PETITION_ID);
    expect(geography?.scope).toBe("citywide");
    expect(geography?.points).toHaveLength(0);
  });
});
