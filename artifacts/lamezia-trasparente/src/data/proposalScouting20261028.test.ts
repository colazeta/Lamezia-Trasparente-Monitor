import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROPOSALS,
  getAllPaPublicServiceSubjects,
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
} from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const ID = "commissariato-lamezia-organico-cento-unita-coisp-2026";

describe("COISP proposal — common proposal-ID publication gates", () => {
  const matches = PUBLIC_PROPOSALS.filter((p) => p.id === ID);

  it("preserves one attributable acquisition with only an emergence event", () => {
    expect(matches).toHaveLength(1);
    const proposal = matches[0]!;
    expect(proposal.promoterId).toBe("coisp-calabria-catanzaro");
    expect(proposal.promoterType).toBe("categoria");
    expect(proposal.channel).toBe("comunicato");
    expect(proposal.status).toBe("proposta_emersa");
    expect(proposal.firstSeen).toBe("2026-10-27");
    expect(proposal.sourceUrl?.startsWith("https://www.corrieredilamezia.it/")).toBe(true);
    expect(proposal.institutionalRecipient).toBe("Stato italiano");
    expect(proposal.linkedActs).toEqual([]);
    expect(proposal.events).toHaveLength(1);
    expect(proposal.events[0]?.type).toBe("emersione");
    expect(proposal.events[0]?.date).toBe("2026-10-27");
    expect(proposal.events[0]?.sourceUrl).toBe(proposal.sourceUrl);
    expect(new Set(proposal.events.map((e) => e.id)).size).toBe(1);
    expect(proposal.verificationNote).toContain("not_assessed");
  });

  it("retains all 15 official backend concepts and one official primary", () => {
    const vocabulary = getAllPaPublicServiceSubjects();
    expect(vocabulary).toHaveLength(15);
    expect(new Set(vocabulary.map((x) => x.code)).size).toBe(15);
    expect(vocabulary.every((x) => x.label && x.uri && x.schemeUri && x.authority)).toBe(true);
    const primary = getProposalPrimaryPaSubject(matches[0]!);
    expect(primary.code).toBe("8");
    expect(primary.uri.startsWith("https://")).toBe(true);
    expect(getProposalSecondaryPaSubjects(matches[0]!)).toEqual([]);
  });

  it("preserves neutral canonical copy with operational facets only", () => {
    expect(getCanonicalProposalPresentationIds()).toContain(ID);
    const canonical = getCanonicalProposalPresentation(matches[0]!);
    expect(canonical.proposalId).toBe(ID);
    expect(canonical.title).toBe("Rafforzamento dell'organico del Commissariato di Lamezia Terme");
    expect(canonical.request).toContain("almeno 100 unità");
    expect(canonical.measures).toHaveLength(2);
    expect(canonical.measures.every((m) => m.length > 20)).toBe(true);
    expect(canonical.actionTypes).toEqual(["organizzazione"]);
  });

  it("does not infer competence, filing, reception or implementation", () => {
    const proposal = matches[0]!;
    const assessment = getProposalInstitutionalCompetence(proposal);
    expect(assessment.sourceAddressee).toBe(proposal.institutionalRecipient);
    expect(assessment.publicAddressee).toBe("Stato italiano");
    expect(assessment.assessmentStatus).toBe("not_assessed");
    expect(assessment.primaryAuthority).toBeUndefined();
    expect(assessment.involvedAuthorities).toEqual([]);
    const institutional = getProposalInstitutionalState(proposal);
    expect(institutional.publicState).toBe("segnalata");
    expect(institutional.hasFormalization).toBe(false);
    expect(institutional.hasInstitutionalFollowUp).toBe(false);
    expect(institutional.implementation).toBe("none");
  });

  it("never invents point coordinates for a citywide service", () => {
    const geo = getProposalGeography(ID)!;
    expect(geo.scope).toBe("citywide");
    expect(geo.areas).toEqual(["intera_citta"]);
    expect(geo.points).toEqual([]);
    expect(isProposalGeoreferenced(ID)).toBe(false);
    expect(geo.note).toContain("27 ottobre 2026");
  });
});
