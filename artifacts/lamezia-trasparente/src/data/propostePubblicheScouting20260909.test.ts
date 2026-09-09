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

const VITALE_ID = "sant-eufemia-cimitero-accesso-custodia-vitale-2026";
const PD_EMODINAMICA_ID = "emodinamica-h24-commissione-sanita-pd-2026";

describe("scouted public proposals 9 September 2026", () => {
  it("publishes Vitale's cemetery interrogation once with normalized promoter and recipient", () => {
    const matches = PUBLIC_PROPOSALS.filter((proposal) => proposal.id === VITALE_ID);
    expect(matches).toHaveLength(1);

    const proposal = matches[0];
    expect(proposal.promoterId).toBe("annita-vitale");
    expect(proposal.promoterType).toBe("consigliere");
    expect(proposal.channel).toBe("interrogazione");
    expect(proposal.status).toBe("presentata_formalmente");
    expect(proposal.institutionalRecipient).toBe("Comune di Lamezia Terme — Sindaco");
    expect(proposal.events.filter((event) => event.type === "deposito")).toHaveLength(1);
  });

  it("keeps recipient and competence separate for the heterogeneous cemetery measures", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === VITALE_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.publicAddressee).toBe("Comune di Lamezia Terme");
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();
    expect(competence.involvedAuthorities).toHaveLength(0);
  });

  it("has canonical presentation, official-first classification and complete backend vocabulary", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === VITALE_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(VITALE_ID);
    expect(canonical.title).toBe("Accessibilità e custodia del cimitero di Sant’Eufemia");
    expect(canonical.measures).toHaveLength(5);

    expect(getProposalPrimaryPaSubject(proposal).code).toBe("8");
    expect(getProposalSecondaryPaSubjects(proposal).map((item) => item.code)).toEqual(["5"]);
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
  });

  it("uses area geography without inventing coordinates for the cemetery access path", () => {
    const geography = getProposalGeography(VITALE_ID);
    expect(geography).toBeDefined();
    expect(geography?.scope).toBe("area");
    expect(geography?.areas).toEqual(["sant_eufemia"]);
    expect(geography?.points).toHaveLength(0);
  });

  it("deduplicates Muraca's 8 September request into the existing PD emodinamica timeline", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === PD_EMODINAMICA_ID);
    expect(proposal).toBeDefined();
    if (!proposal) return;

    expect(
      proposal.events.filter(
        (event) => event.id === "emodinamica-pd-muraca-reclutamento-8-settembre",
      ),
    ).toHaveLength(1);
    expect(proposal.lastUpdated).toBe("2026-09-08");

    const state = getProposalInstitutionalState(proposal);
    expect(state.implementation).toBe("none");

    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.assessmentStatus).toBe("partially_verified");
  });
});
