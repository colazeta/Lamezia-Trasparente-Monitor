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

const proposalId = "soppressione-staff-sindaco-riallocazione-risorse-nicotera-2026";

describe("Scouting Nicotera — 27 October 2026 — same-proposal-ID end-to-end gates", () => {
  it("retains the complete 15-concept official vocabulary", () => {
    const vocabulary = getAllPaPublicServiceSubjects();
    expect(vocabulary).toHaveLength(15);
    expect(new Set(vocabulary.map((item) => item.code)).size).toBe(15);
    for (const subject of vocabulary) {
      expect(subject.label).toBeTruthy();
      expect(subject.uri).toMatch(/^https:\/\//);
      expect(subject.schemeUri).toMatch(/^https:\/\//);
      expect(subject.authority).toBeTruthy();
    }
  });

  it("keeps a single acquisition, a separate canonical presentation and official semantic classification", () => {
    const records = PUBLIC_PROPOSALS.filter((item) => item.id === proposalId);
    expect(records).toHaveLength(1);
    const proposal = records[0]!;
    expect(proposal.promoterId).toBeTruthy();
    expect(proposal.promoterType).toBe("consigliere");
    expect(proposal.channel).toBe("mozione");
    expect(proposal.status).toBe("proposta_emersa");
    expect(proposal.sourceUrl).toMatch(/^https:\/\//);
    expect(proposal.sourceLabel).toBeTruthy();
    expect(proposal.firstSeen).toBe("2026-10-26");
    expect(proposal.events).toHaveLength(1);
    expect(proposal.events[0]?.type).toBe("emersione");
    expect(proposal.events[0]?.date).toBe("2026-10-26");
    expect(proposal.events[0]?.sourceUrl).toBe(proposal.sourceUrl);
    expect(new Set(proposal.events.map((event) => event.id)).size).toBe(proposal.events.length);

    expect(getCanonicalProposalPresentationIds()).toContain(proposalId);
    const canonical = getCanonicalProposalPresentation(proposal);
    expect(canonical.proposalId).toBe(proposalId);
    expect(canonical.title.length).toBeGreaterThan(15);
    expect(canonical.request.length).toBeGreaterThan(20);
    expect(canonical.measures).toHaveLength(7);
    expect(canonical.measures.every((item) => item.length > 30)).toBe(true);
    expect(canonical.actionTypes.length).toBeGreaterThan(0);

    const primary = getProposalPrimaryPaSubject(proposal);
    expect(primary.code).toBe("9");
    expect(primary.uri).toMatch(/^https:\/\//);
    expect(primary.schemeUri).toMatch(/^https:\/\//);
    expect(primary.authority).toBeTruthy();
    expect(getProposalSecondaryPaSubjects(proposal).map((item) => item.code)).toEqual(["2"]);
    expect(getProposalSecondaryPaSubjects(proposal).every((item) => item.code !== primary.code)).toBe(true);
  });

  it("separates a documented addressee from unassessed competence and derives conservative public state", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === proposalId)!;
    expect(proposal.institutionalRecipient).toContain("Sindaco e Giunta");
    const competence = getProposalInstitutionalCompetence(proposal);
    expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
    expect(competence.publicAddressee).not.toBe("Non indicato");
    expect(competence.assessmentStatus).toBe("not_assessed");
    expect(competence.primaryAuthority).toBeUndefined();
    expect(competence.involvedAuthorities).toEqual([]);
    expect(proposal.linkedActs).toEqual([]);

    const stage = getProposalInstitutionalState(proposal);
    expect(stage.publicState).toBe("segnalata");
    expect(stage.hasFormalization).toBe(false);
    expect(stage.hasInstitutionalFollowUp).toBe(false);
    expect(stage.implementation).toBe("none");
    expect(stage.institutionalEventCount).toBe(0);
  });

  it("preserves citywide scope without inferred WGS84 geometry", () => {
    const geo = getProposalGeography(proposalId)!;
    expect(geo.scope).toBe("citywide");
    expect(geo.areas).toEqual(["intera_citta"]);
    expect(geo.points).toEqual([]);
    expect(geo.note).toContain("26 ottobre 2026");
    expect(isProposalGeoreferenced(proposalId)).toBe(false);
  });
});
