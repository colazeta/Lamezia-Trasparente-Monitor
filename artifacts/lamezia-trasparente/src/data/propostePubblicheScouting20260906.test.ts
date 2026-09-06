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
const LA_MIA_ESTATE_ID = "la-mia-estate-avvio-attivita-oltre-autismo-2026";
const EMODINAMICA_PD_ID = "emodinamica-h24-commissione-sanita-pd-2026";

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

  it("has canonical presentation, official primary matter and citywide geography for the petition", () => {
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

  it("deduplicates the La mia estate requests into one formalised proposal with a response but no inferred implementation", () => {
    const matches = PUBLIC_PROPOSALS.filter((proposal) => proposal.id === LA_MIA_ESTATE_ID);
    expect(matches).toHaveLength(1);

    const proposal = matches[0];
    expect(proposal.promoterId).toBe("oltre-autismo-catanzaro-odv");
    expect(proposal.promoterType).toBe("associazione");
    expect(proposal.status).toBe("presentata_formalmente");
    expect(proposal.events.filter((event) => event.type === "deposito")).toHaveLength(2);
    expect(
      proposal.events.some((event) => event.type === "risposta_istituzionale"),
    ).toBe(true);

    const state = getProposalInstitutionalState(proposal);
    expect(state.hasFormalization).toBe(true);
    expect(state.hasInstitutionalFollowUp).toBe(true);
    expect(state.publicState).toBe("con_seguito");
    expect(state.implementation).toBe("none");
  });

  it("uses official-first semantics, documented recipient and verified ATS competence for La mia estate", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === LA_MIA_ESTATE_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(getCanonicalProposalPresentation(proposal).title).toBe(
      "Tempi e condizioni per l’avvio di La mia estate",
    );
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("2");
    expect(getProposalSecondaryPaSubjects(proposal)).toHaveLength(0);

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.publicAddressee).toBe("Comune di Lamezia Terme");
    expect(competence.assessmentStatus).toBe("verified");
    expect(competence.primaryAuthority?.id).toBe("ats-lamezia-terme");
    expect(competence.involvedAuthorities.map((authority) => authority.id)).toContain(
      "regione-calabria",
    );

    const geography = getProposalGeography(LA_MIA_ESTATE_ID);
    expect(geography?.scope).toBe("citywide");
    expect(geography?.points).toHaveLength(0);
  });

  it("publishes the Commissione Sanità PD H24 request as a distinct promoter in the existing emodinamica thread", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === EMODINAMICA_PD_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(proposal.promoterId).toBe("commissione-sanita-pd-lamezia");
    expect(proposal.threadId).toBe("ospedale-emodinamica-h24");
    expect(proposal.status).toBe("proposta_emersa");
    expect(
      PUBLIC_PROPOSALS.filter(
        (item) =>
          item.threadId === "ospedale-emodinamica-h24" &&
          item.promoterId === "commissione-sanita-pd-lamezia",
      ),
    ).toHaveLength(1);

    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.title).toBe("Emodinamica fissa H24 al Giovanni Paolo II");
    expect(canonical.actionTypes).toContain("rafforzamento_servizio");
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("2");
    expect(getProposalSecondaryPaSubjects(proposal)).toHaveLength(0);

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.assessmentStatus).toBe("partially_verified");
    expect(competence.primaryAuthority?.id).toBe("regione-calabria");
    expect(competence.involvedAuthorities.map((authority) => authority.id)).toContain(
      "asp-catanzaro",
    );

    const geography = getProposalGeography(EMODINAMICA_PD_ID);
    expect(geography?.scope).toBe("point");
    expect(geography?.points[0]?.id).toBe("ospedale-giovanni-paolo-ii");
  });
});
