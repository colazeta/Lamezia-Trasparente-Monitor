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

const candidates = [
  { id: "petizione-preintese-autonomia-differenziata-comitato-2026", primary: "GOVE", channel: "petizione", events: ["petizione", "aggiornamento"] },
  { id: "piano-ricognizione-interventi-rete-idrica-pd-2026", primary: "11", channel: "mozione", events: ["emersione"] },
] as const;

describe("26 October civic scouting: same-ID end-to-end gate", () => {
  it("keeps the full national vocabulary with one official primary subject per acquisition", () => {
    const vocabulary = getAllPaPublicServiceSubjects();
    expect(vocabulary).toHaveLength(15);
    expect(new Set(vocabulary.map((item) => item.code)).size).toBe(15);
    for (const concept of vocabulary) {
      expect(concept.label).toBeTruthy();
      expect(concept.uri).toMatch(/^https:/);
      expect(concept.schemeUri).toMatch(/^https:/);
      expect(concept.authority).toBeTruthy();
    }
    for (const candidate of candidates) {
      const proposal = PUBLIC_PROPOSALS.find((item) => item.id === candidate.id)!;
      const primary = getProposalPrimaryPaSubject(proposal);
      expect(primary.code).toBe(candidate.primary);
      expect(primary.uri).toBeTruthy();
      expect(primary.schemeUri).toBeTruthy();
      expect(primary.authority).toBeTruthy();
      expect(getProposalSecondaryPaSubjects(proposal).every((other) => other.code !== primary.code)).toBe(true);
    }
  });

  it("ensures unique, sourced acquisitions with canonical copy, exact IDs and a coherent timeline", () => {
    for (const candidate of candidates) {
      const matches = PUBLIC_PROPOSALS.filter((item) => item.id === candidate.id);
      expect(matches, candidate.id).toHaveLength(1);
      const proposal = matches[0]!;
      expect(proposal.channel).toBe(candidate.channel);
      expect(proposal.status).toBe("proposta_emersa");
      expect(proposal.sourceUrl).toMatch(/^https:/);
      expect(proposal.institutionalRecipient?.trim()).toBeTruthy();
      expect(proposal.linkedActs).toEqual([]);
      expect(proposal.events.map((event) => event.type)).toEqual(candidate.events);
      expect(new Set(proposal.events.map((event) => event.id)).size).toBe(proposal.events.length);
      expect(proposal.events.every((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.date) && /^https:/.test(event.sourceUrl ?? ""))).toBe(true);
      const canonical = getCanonicalProposalPresentation(proposal);
      expect(getCanonicalProposalPresentationIds()).toContain(proposal.id);
      expect(canonical.proposalId).toBe(proposal.id);
      expect(canonical.title.trim()).toBeTruthy();
      expect(canonical.request.length).toBeGreaterThan(20);
      expect(canonical.measures.length).toBeGreaterThan(2);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);
    }
  });

  it("does not infer competence, formal deposit or implementation from recipient, petition signatures or a declared motion", () => {
    for (const candidate of candidates) {
      const proposal = PUBLIC_PROPOSALS.find((item) => item.id === candidate.id)!;
      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(competence.publicAddressee).not.toBe("Non indicato");
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);
      const stage = getProposalInstitutionalState(proposal);
      expect(stage.publicState).toBe("segnalata");
      expect(stage.hasFormalization).toBe(false);
      expect(stage.hasInstitutionalFollowUp).toBe(false);
      expect(stage.implementation).toBe("none");
    }
  });

  it("keeps the geography ungeoreferenced and citywide data free of inferred coordinates", () => {
    for (const candidate of candidates) {
      const geography = getProposalGeography(candidate.id)!;
      expect(geography.scope).toBe("citywide");
      expect(geography.areas).toEqual(["intera_citta"]);
      expect(geography.points).toEqual([]);
      expect(isProposalGeoreferenced(candidate.id)).toBe(false);
      expect(geography.note).toBeTruthy();
    }
  });
});
