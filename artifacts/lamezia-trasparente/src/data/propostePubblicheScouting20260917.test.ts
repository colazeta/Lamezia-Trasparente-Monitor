import { describe, expect, it } from "vitest";

import { getProposalGeography } from "./proposalGeography";
import {
  LT_SEMANTIC_EXTENSIONS,
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";

const LIBERALI_FNA_ID = "fna-assistenza-progetto-vita-liberali-lamezia-2026";
const CIMITERO_COMITATO_ID =
  "cimitero-sant-eufemia-loculi-accessi-custodia-comitato-2026";
const CIMITERO_VITALE_ID = "sant-eufemia-cimitero-accesso-custodia-vitale-2026";

describe("scouted public proposals 17 September 2026", () => {
  it("publishes both new proposals exactly once and keeps the official catalogue complete", () => {
    expect(PUBLIC_PROPOSALS.filter((item) => item.id === LIBERALI_FNA_ID)).toHaveLength(1);
    expect(PUBLIC_PROPOSALS.filter((item) => item.id === CIMITERO_COMITATO_ID)).toHaveLength(1);
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
    expect(Object.keys(LT_SEMANTIC_EXTENSIONS)).toHaveLength(0);
  });

  it("gives the Liberali proposal a canonical welfare profile without inferring implementation", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === LIBERALI_FNA_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(proposal.promoterId).toBe("i-liberali-lamezia-terme");
    expect(proposal.channel).toBe("comunicato");
    expect(proposal.status).toBe("proposta_emersa");
    expect(proposal.institutionalRecipient).toContain("Comune di Lamezia Terme");
    expect(proposal.institutionalRecipient).toContain("Azienda Sanitaria Provinciale");

    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(LIBERALI_FNA_ID);
    expect(canonical.title).toBe(
      "Coordinamento tra FNA, assistenza domiciliare e Progetti di Vita",
    );
    expect(canonical.measures).toHaveLength(7);
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("2");
    expect(getProposalSecondaryPaSubjects(proposal)).toHaveLength(0);

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.assessmentStatus).toBe("partially_verified");
    expect(competence.primaryAuthority?.id).toBe("ats-lamezia-terme");
    expect(competence.involvedAuthorities.map((item) => item.id)).toContain(
      "asp-catanzaro",
    );
    expect(competence.involvedAuthorities.map((item) => item.id)).toContain(
      "regione-calabria",
    );

    const state = getProposalInstitutionalState(proposal);
    expect(state.hasFormalization).toBe(false);
    expect(state.implementation).toBe("none");
    expect(state.publicState).toBe("segnalata");

    const geography = getProposalGeography(LIBERALI_FNA_ID);
    expect(geography?.scope).toBe("citywide");
    expect(geography?.points).toHaveLength(0);
  });

  it("keeps the Sant'Eufemia committee proposal distinct by promoter but in the existing cemetery thread", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === CIMITERO_COMITATO_ID);
    const vitale = PUBLIC_PROPOSALS.find((item) => item.id === CIMITERO_VITALE_ID);
    expect(proposal).toBeDefined();
    expect(vitale).toBeDefined();
    if (!proposal || !vitale) return;

    expect(proposal.promoterId).toBe("la-voce-del-quartiere-sant-eufemia");
    expect(proposal.promoterId).not.toBe(vitale.promoterId);
    expect(proposal.threadId).toBe(vitale.threadId);
    expect(proposal.status).toBe("proposta_emersa");
    expect(proposal.events.some((event) => event.type === "deposito")).toBe(false);

    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(CIMITERO_COMITATO_ID);
    expect(canonical.title).toBe(
      "Programmazione dei servizi del cimitero di Sant’Eufemia",
    );
    expect(canonical.measures).toHaveLength(5);
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("8");
    expect(getProposalSecondaryPaSubjects(proposal).map((item) => item.code)).toEqual([
      "5",
    ]);

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();

    const state = getProposalInstitutionalState(proposal);
    expect(state.hasFormalization).toBe(false);
    expect(state.implementation).toBe("none");
    expect(state.publicState).toBe("segnalata");

    const geography = getProposalGeography(CIMITERO_COMITATO_ID);
    expect(geography?.scope).toBe("area");
    expect(geography?.areas).toContain("sant_eufemia");
    expect(geography?.points).toHaveLength(0);
  });
});
