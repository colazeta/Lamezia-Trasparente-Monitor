import { describe, expect, it } from "vitest";

import { getProposalGeography } from "./proposalGeography";
import {
  PROPOSAL_IMPLEMENTATION_EVIDENCE,
  PUBLIC_PROPOSALS,
  getCanonicalProposalPresentation,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";

const LA_MIA_ESTATE_ID = "la-mia-estate-avvio-attivita-oltre-autismo-2026";
const OFFICIAL_EVENT_ID = "la-mia-estate-schema-convenzione-16-settembre";

describe("scouting update 17 September 2026", () => {
  it("updates the existing La mia estate proposal without duplication", () => {
    const matches = PUBLIC_PROPOSALS.filter(
      (proposal) => proposal.id === LA_MIA_ESTATE_ID,
    );
    expect(matches).toHaveLength(1);

    const proposal = matches[0];
    expect(proposal.lastUpdated).toBe("2026-09-16");
    expect(proposal.linkedActs).toContain(
      "Determinazione dirigenziale R.G. n. 1446 del 16/09/2026 — Albo Pretorio n. 2026/2976",
    );
    const event = proposal.events.find((item) => item.id === OFFICIAL_EVENT_ID);
    expect(event).toBeDefined();
    expect(event?.type).toBe("aggiornamento");
    expect(event?.evidenceLevel).toBe("fonte_ufficiale");
  });

  it("preserves canonical presentation, official semantics, recipient and verified competence", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === LA_MIA_ESTATE_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(getCanonicalProposalPresentation(proposal).title).toBe(
      "Tempi e condizioni per l’avvio di La mia estate",
    );
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("2");
    expect(getProposalSecondaryPaSubjects(proposal)).toHaveLength(0);
    expect(proposal.institutionalRecipient).toBe("Comune di Lamezia Terme");

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.assessmentStatus).toBe("verified");
    expect(competence.primaryAuthority?.id).toBe("ats-lamezia-terme");

    const geography = getProposalGeography(LA_MIA_ESTATE_ID);
    expect(geography?.scope).toBe("citywide");
    expect(geography?.points).toHaveLength(0);
  });

  it("does not turn the administrative step into reception or implementation", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === LA_MIA_ESTATE_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const officialEvent = proposal.events.find(
      (event) => event.id === OFFICIAL_EVENT_ID,
    );
    expect(officialEvent?.type).not.toBe("recepimento");
    expect(PROPOSAL_IMPLEMENTATION_EVIDENCE[LA_MIA_ESTATE_ID]).toBeUndefined();

    const state = getProposalInstitutionalState(proposal);
    expect(state.hasInstitutionalFollowUp).toBe(true);
    expect(state.implementation).toBe("none");
    expect(state.publicState).toBe("con_seguito");
  });
});
