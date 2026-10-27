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

const batch = [
  {
    id: "soppressione-staff-sindaco-riallocazione-risorse-nicotera-2026",
    primary: "9",
    secondary: ["2"],
    scope: "citywide",
    areas: ["intera_citta"],
    channel: "mozione",
    promoter: "giancarlo-nicotera-consigliere-lamezia-terme",
  },
  {
    id: "via-della-vittoria-manutenzione-deflusso-cristiano-villella-2026",
    primary: "4",
    secondary: ["11", "8"],
    scope: "area",
    areas: ["nicastro"],
    channel: "interrogazione",
    promoter: "futuro-nazionale-lamezia",
  },
] as const;

describe("Civic scouting 27 October: common end-to-end gate on both proposal IDs", () => {
  it("retains complete official taxonomy in backend, used and unused", () => {
    const vocabulary = getAllPaPublicServiceSubjects();
    expect(vocabulary).toHaveLength(15);
    expect(new Set(vocabulary.map((c) => c.code)).size).toBe(15);
    expect(vocabulary.every((c) => c.label && c.uri && c.schemeUri && c.authority)).toBe(true);
  });

  for (const candidate of batch) {
    it(`enforces unique acquisition and all citizen/audit gates for ${candidate.id}`, () => {
      const matches = PUBLIC_PROPOSALS.filter((p) => p.id === candidate.id);
      expect(matches).toHaveLength(1);
      const proposal = matches[0]!;
      expect(proposal.promoterId).toBe(candidate.promoter);
      expect(proposal.channel).toBe(candidate.channel);
      expect(proposal.status).toBe("proposta_emersa");
      expect(proposal.firstSeen).toBe("2026-10-26");
      expect(proposal.sourceUrl).toMatch(/^https:\/\//);
      expect(proposal.sourceLabel).toBeTruthy();
      expect(proposal.institutionalRecipient?.trim()).toBeTruthy();
      expect(proposal.linkedActs).toEqual([]);
      expect(proposal.events).toHaveLength(1);
      expect(proposal.events[0]?.type).toBe("emersione");
      expect(proposal.events[0]?.date).toBe("2026-10-26");
      expect(proposal.events[0]?.sourceUrl).toBe(proposal.sourceUrl);
      expect(new Set(proposal.events.map((e) => e.id)).size).toBe(proposal.events.length);

      expect(getCanonicalProposalPresentationIds()).toContain(candidate.id);
      const canonical = getCanonicalProposalPresentation(proposal);
      expect(canonical.proposalId).toBe(candidate.id);
      expect(canonical.title.length).toBeGreaterThan(15);
      expect(canonical.request.length).toBeGreaterThan(30);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(5);
      expect(canonical.measures.every((measure) => measure.length > 25)).toBe(true);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);

      const primary = getProposalPrimaryPaSubject(proposal);
      expect(primary.code).toBe(candidate.primary);
      expect(primary.uri).toMatch(/^https:\/\//);
      expect(primary.schemeUri).toMatch(/^https:\/\//);
      expect(primary.authority).toBeTruthy();
      const secondary = getProposalSecondaryPaSubjects(proposal);
      expect(secondary.map((x) => x.code)).toEqual(candidate.secondary);
      expect(secondary.every((x) => x.code !== primary.code)).toBe(true);

      const assessment = getProposalInstitutionalCompetence(proposal);
      expect(assessment.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(assessment.publicAddressee).not.toBe("Non indicato");
      expect(assessment.assessmentStatus).toBe("not_assessed");
      expect(assessment.primaryAuthority).toBeUndefined();
      expect(assessment.involvedAuthorities).toEqual([]);

      const state = getProposalInstitutionalState(proposal);
      expect(state.publicState).toBe("segnalata");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");
      expect(state.institutionalEventCount).toBe(0);

      const geo = getProposalGeography(candidate.id)!;
      expect(geo.scope).toBe(candidate.scope);
      expect(geo.areas).toEqual(candidate.areas);
      expect(geo.points).toEqual([]);
      expect(geo.note).toContain("26 ottobre 2026");
      expect(isProposalGeoreferenced(candidate.id)).toBe(false);
    });
  }
});
