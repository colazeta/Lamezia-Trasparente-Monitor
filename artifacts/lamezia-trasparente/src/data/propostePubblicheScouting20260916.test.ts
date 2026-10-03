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

const CIMITERO_SAMBIASE_ID =
  "cimitero-sambiase-messa-sicurezza-futuro-nazionale-2026";
const ASILI_ID = "asili-nido-continuita-servizio-2026";

describe("scouted public proposals 16 September 2026", () => {
  it("publishes the Sambiase proposal exactly once end to end", () => {
    expect(
      PUBLIC_PROPOSALS.filter((proposal) => proposal.id === CIMITERO_SAMBIASE_ID),
    ).toHaveLength(1);

    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === CIMITERO_SAMBIASE_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(getCanonicalProposalPresentation(proposal).proposalId).toBe(
      CIMITERO_SAMBIASE_ID,
    );
    expect(getProposalGeography(CIMITERO_SAMBIASE_ID)).toBeDefined();
    expect(getProposalPrimaryPaSubject(proposal)).toBeDefined();
    expect(getProposalInstitutionalCompetence(proposal).proposalId).toBe(
      CIMITERO_SAMBIASE_ID,
    );
  });

  it("keeps the complete official vocabulary and separates primary and secondary matters", () => {
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
    expect(Object.keys(LT_SEMANTIC_EXTENSIONS)).toHaveLength(0);

    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === CIMITERO_SAMBIASE_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(getProposalPrimaryPaSubject(proposal).code).toBe("5");
    expect(getProposalSecondaryPaSubjects(proposal).map((item) => item.code)).toEqual([
      "8",
    ]);
  });

  it("uses a neutral canonical presentation with atomic operative measures", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === CIMITERO_SAMBIASE_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.title).toBe(
      "Messa in sicurezza e ripristino di una parte del cimitero di Sambiase",
    );
    expect(canonical.measures).toHaveLength(3);
  });

  it("does not turn the announced interrogation into a formal deposit or infer competence", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === CIMITERO_SAMBIASE_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(proposal.channel).toBe("interrogazione");
    expect(proposal.status).toBe("proposta_emersa");
    expect(proposal.events.map((event) => event.type)).toEqual(["emersione"]);
    expect(proposal.events.some((event) => event.type === "deposito")).toBe(false);
    expect(proposal.events.some((event) => event.type === "recepimento")).toBe(false);

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.sourceAddressee).toBe(
      "Comune di Lamezia Terme — Amministrazione comunale",
    );
    expect(competence.publicAddressee).toBe("Comune di Lamezia Terme");
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();

    expect(getProposalInstitutionalState(proposal).implementation).toBe("none");
  });

  it("uses area geography for Sambiase without inventing coordinates", () => {
    const geography = getProposalGeography(CIMITERO_SAMBIASE_ID);
    expect(geography?.scope).toBe("area");
    expect(geography?.areas).toEqual(["sambiase"]);
    expect(geography?.points).toHaveLength(0);
  });

  it("records actual nursery-service start as implementation started, not completed", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === ASILI_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(
      proposal.events.some(
        (event) =>
          event.id === "asili-nido-avvio-effettivo-15-settembre" &&
          event.type === "aggiornamento",
      ),
    ).toBe(true);

    const state = getProposalInstitutionalState(proposal);
    expect(state.implementation).toBe("started");
    expect(state.progressStage).toBe("attuazione_avviata");
    expect(state.publicState).toBe("in_attuazione");
  });
});
