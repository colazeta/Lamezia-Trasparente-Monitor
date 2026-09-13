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

const SCORDOVILLO_ID =
  "scordovillo-consiglio-aperto-trasparenza-futuro-nazionale-2026";

describe("scouted public proposals 13 September 2026", () => {
  it("publishes the Scordovillo proposal exactly once end to end", () => {
    expect(
      PUBLIC_PROPOSALS.filter((proposal) => proposal.id === SCORDOVILLO_ID),
    ).toHaveLength(1);

    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === SCORDOVILLO_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(getCanonicalProposalPresentation(proposal).proposalId).toBe(
      SCORDOVILLO_ID,
    );
    expect(getProposalGeography(SCORDOVILLO_ID)).toBeDefined();
    expect(getProposalPrimaryPaSubject(proposal)).toBeDefined();
    expect(getProposalInstitutionalCompetence(proposal).proposalId).toBe(
      SCORDOVILLO_ID,
    );
  });

  it("keeps the complete 15-concept backend vocabulary and uses an official fallback without LT extensions", () => {
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
    expect(Object.keys(LT_SEMANTIC_EXTENSIONS)).toHaveLength(0);

    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === SCORDOVILLO_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(getProposalPrimaryPaSubject(proposal).code).toBe("GOVE");
    expect(getProposalSecondaryPaSubjects(proposal)).toHaveLength(0);
  });

  it("uses a neutral canonical presentation with atomic operational measures", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === SCORDOVILLO_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.title).toBe(
      "Consiglio comunale aperto su Scordovillo e trasparenza del percorso abitativo",
    );
    expect(canonical.measures).toHaveLength(4);
    expect(canonical.actionTypes).toEqual([
      "organizzazione",
      "trasparenza",
      "coordinamento",
    ]);
  });

  it("keeps the documented addressee separate from partially verified competence", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === SCORDOVILLO_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.publicAddressee).toBe("Comune di Lamezia Terme");
    expect(competence.assessmentStatus).toBe("partially_verified");
    expect(competence.primaryAuthority?.id).toBe(
      "presidente-consiglio-comunale-lamezia-terme",
    );
    expect(competence.sourceAddressee).toContain(
      "Presidente del Consiglio comunale",
    );
  });

  it("does not turn the promoters' account of an earlier agreement into a deposit, calendarisation or implementation", () => {
    const proposal = PUBLIC_PROPOSALS.find(
      (item) => item.id === SCORDOVILLO_ID,
    );
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(proposal.status).toBe("proposta_emersa");
    expect(proposal.events.map((event) => event.type)).toEqual(["emersione"]);
    expect(getProposalInstitutionalState(proposal).implementation).toBe("none");
  });

  it("uses coordinate-free citywide geography", () => {
    const geography = getProposalGeography(SCORDOVILLO_ID);
    expect(geography?.scope).toBe("citywide");
    expect(geography?.areas).toEqual(["intera_citta"]);
    expect(geography?.points).toHaveLength(0);
  });
});