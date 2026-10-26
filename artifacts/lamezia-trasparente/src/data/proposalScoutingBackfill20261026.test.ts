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
    id: "piano-comunale-amianto-m5s-lamezia-2026",
    primary: "11",
    secondaries: ["2"],
    channel: "iniziativa_popolare",
    scope: "citywide",
    areas: ["intera_citta"],
    eventTypes: ["emersione", "aggiornamento"],
  },
  {
    id: "controlli-velocita-bizantini-savutano-branca-2026",
    primary: "4",
    secondaries: ["8"],
    channel: "comunicato",
    scope: "area",
    areas: ["sambiase"],
    eventTypes: ["emersione"],
  },
] as const;

describe("Civic scouting recovery — 26 October 2026 — same-ID end-to-end gates", () => {
  it("retains all 15 national concepts with official codes and semantic authorities", () => {
    const vocabulary = getAllPaPublicServiceSubjects();
    expect(vocabulary).toHaveLength(15);
    expect(new Set(vocabulary.map((item) => item.code)).size).toBe(15);
    for (const item of vocabulary) {
      expect(item.label).toBeTruthy();
      expect(item.uri).toMatch(/^https:\/\//);
      expect(item.schemeUri).toMatch(/^https:\/\//);
      expect(item.authority).toBeTruthy();
    }
  });

  for (const candidate of batch) {
    it(`validates acquisition, canonical copy, semantics and source timeline: ${candidate.id}`, () => {
      const matching = PUBLIC_PROPOSALS.filter((item) => item.id === candidate.id);
      expect(matching, candidate.id).toHaveLength(1);
      const proposal = matching[0]!;
      expect(proposal.promoterId).toBeTruthy();
      expect(proposal.promoterType).toBeTruthy();
      expect(proposal.theme).toBeTruthy();
      expect(proposal.channel).toBe(candidate.channel);
      expect(proposal.status).toBe("proposta_emersa");
      expect(proposal.sourceUrl).toMatch(/^https:\/\//);
      expect(proposal.sourceLabel).toBeTruthy();
      expect(proposal.institutionalRecipient?.trim()).toBeTruthy();
      expect(proposal.linkedActs).toEqual([]);
      expect(proposal.events.map((event) => event.type)).toEqual(candidate.eventTypes);
      expect(new Set(proposal.events.map((event) => event.id)).size).toBe(proposal.events.length);
      expect(proposal.events.every((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.date) && /^https:\/\//.test(event.sourceUrl ?? ""))).toBe(true);
      expect(proposal.events.map((event) => event.date)).toEqual([...proposal.events.map((event) => event.date)].sort());

      const canonical = getCanonicalProposalPresentation(proposal);
      expect(getCanonicalProposalPresentationIds()).toContain(candidate.id);
      expect(canonical.proposalId).toBe(candidate.id);
      expect(canonical.title.length).toBeGreaterThan(15);
      expect(canonical.request.length).toBeGreaterThan(20);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(3);
      expect(canonical.measures.every((measure) => measure.trim().length > 25)).toBe(true);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);

      const primary = getProposalPrimaryPaSubject(proposal);
      expect(primary.code).toBe(candidate.primary);
      expect(primary.uri).toBeTruthy();
      expect(primary.schemeUri).toBeTruthy();
      expect(primary.authority).toBeTruthy();
      const secondaries = getProposalSecondaryPaSubjects(proposal);
      expect(secondaries.map((item) => item.code)).toEqual(candidate.secondaries);
      expect(secondaries.every((item) => item.code !== primary.code)).toBe(true);

      const recipientAndCompetence = getProposalInstitutionalCompetence(proposal);
      expect(recipientAndCompetence.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(recipientAndCompetence.publicAddressee).not.toBe("Non indicato");
      expect(recipientAndCompetence.assessmentStatus).toBe("not_assessed");
      expect(recipientAndCompetence.primaryAuthority).toBeUndefined();
      expect(recipientAndCompetence.involvedAuthorities).toEqual([]);

      const stage = getProposalInstitutionalState(proposal);
      expect(stage.publicState).toBe("segnalata");
      expect(stage.hasFormalization).toBe(false);
      expect(stage.hasInstitutionalFollowUp).toBe(false);
      expect(stage.implementation).toBe("none");

      const geo = getProposalGeography(proposal.id)!;
      expect(geo.scope).toBe(candidate.scope);
      expect(geo.areas).toEqual(candidate.areas);
      expect(geo.points).toEqual([]);
      expect(geo.note).toBeTruthy();
      expect(isProposalGeoreferenced(proposal.id)).toBe(false);
    });
  }

  it("distinguishes a verified public asbestos meeting from a formally deposited popular initiative", () => {
    const proposal = PUBLIC_PROPOSALS.find((item) => item.id === batch[0].id)!;
    expect(proposal.events.map((event) => event.date)).toEqual(["2026-10-13", "2026-10-16"]);
    expect(proposal.events[1]?.type).toBe("aggiornamento");
    expect(proposal.events[1]?.sourceUrl).toContain("ansa.it");
    expect(getProposalInstitutionalState(proposal).institutionalEventCount).toBe(0);
  });
});
