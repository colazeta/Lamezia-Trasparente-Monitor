import { describe, expect, it } from "vitest";
import {
  PUBLIC_PROPOSALS,
  getCanonicalProposalPresentation,
  getCanonicalProposalPresentationIds,
  getProposalPrimaryPaSubject,
  getProposalSecondaryPaSubjects,
  getAllPaPublicServiceSubjects,
  getProposalInstitutionalCompetence,
  getProposalInstitutionalState,
} from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const id = "stadi-renda-riga-regolarizzazione-apertura-pubblico-2026";

describe("scouting stadi Renda e Riga — 23 October 2026", () => {
  it("keeps a unique source-backed candidate without inventing formal filing", () => {
    const matches = PUBLIC_PROPOSALS.filter((proposal) => proposal.id === id);
    expect(matches).toHaveLength(1);
    const item = matches[0]!;
    expect(item.status).toBe("proposta_emersa");
    expect(item.channel).toBe("interrogazione");
    expect(item.institutionalRecipient).toBeTruthy();
    expect(item.evidenceLevel).toBe("fonte_stampa");
    expect(item.linkedActs).toHaveLength(0);
    expect(item.events.map((event) => event.type)).toEqual(["emersione"]);
    expect(item.sourceUrl).toContain("lametino.it");
  });

  it("uses one official primary subject with a separate secondary", () => {
    const proposal = PUBLIC_PROPOSALS.find((entry) => entry.id === id)!;
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);
    expect(getProposalPrimaryPaSubject(proposal).code).toBe("10");
    expect(getProposalSecondaryPaSubjects(proposal).map((concept) => concept.code)).toEqual(["5"]);
  });

  it("provides canonical copy and non-georeferenced two-area geography", () => {
    const proposal = PUBLIC_PROPOSALS.find((entry) => entry.id === id)!;
    const presentation = getCanonicalProposalPresentation(proposal);
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(presentation.proposalId).toBe(id);
    expect(presentation.measures.length).toBeGreaterThan(2);
    const geography = getProposalGeography(id)!;
    expect(geography.scope).toBe("area");
    expect(geography.areas).toEqual(["sambiase", "sant_eufemia"]);
    expect(geography.points).toEqual([]);
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
});


const octoberBatch = [
  { id: "viabilita-manutenzione-vie-vescio-2026", primary: "4", scope: "area" },
  { id: "regolamento-servizio-taxi-usb-2026", primary: "4", scope: "citywide" },
  { id: "sant-eufemia-studio-autonomia-comunale-2026", primary: "GOVE", scope: "area" },
  { id: "stadi-renda-riga-regolarizzazione-apertura-pubblico-2026", primary: "10", scope: "area" },
] as const;

describe("October civic scouting — same-ID end-to-end gates", () => {
  it("keeps all four unique acquisitions aligned across canonical, semantic, institutional and geography layers", () => {
    expect(getAllPaPublicServiceSubjects()).toHaveLength(15);

    for (const candidate of octoberBatch) {
      const matches = PUBLIC_PROPOSALS.filter((proposal) => proposal.id === candidate.id);
      expect(matches, candidate.id).toHaveLength(1);
      const proposal = matches[0]!;

      expect(proposal.sourceUrl, candidate.id).toMatch(/^https:\/\//);
      expect(proposal.institutionalRecipient?.trim(), candidate.id).toBeTruthy();
      expect(proposal.status).toBe("proposta_emersa");
      expect(proposal.events.map((event) => event.type)).toEqual(["emersione"]);
      expect(new Set(proposal.events.map((event) => event.id)).size).toBe(proposal.events.length);
      expect(proposal.events.every((event) => /^\\d{4}-\\d{2}-\\d{2}$/.test(event.date))).toBe(true);
      expect(proposal.events.every((event) => Boolean(event.sourceUrl))).toBe(true);

      const canonical = getCanonicalProposalPresentation(proposal);
      expect(getCanonicalProposalPresentationIds()).toContain(proposal.id);
      expect(canonical.proposalId).toBe(proposal.id);
      expect(canonical.title.trim().length).toBeGreaterThan(12);
      expect(canonical.request.trim().length).toBeGreaterThan(20);
      expect(canonical.measures.length).toBeGreaterThan(1);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);

      const primary = getProposalPrimaryPaSubject(proposal);
      expect(primary.code, candidate.id).toBe(candidate.primary);
      expect(primary.uri).toBeTruthy();
      expect(primary.schemeUri).toBeTruthy();
      expect(primary.authority).toBeTruthy();
      expect(getProposalSecondaryPaSubjects(proposal).every((secondary) => secondary.code !== primary.code)).toBe(true);

      const recipientAndCompetence = getProposalInstitutionalCompetence(proposal);
      expect(recipientAndCompetence.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(recipientAndCompetence.publicAddressee).not.toBe("Non indicato");
      expect(recipientAndCompetence.assessmentStatus).toBe("not_assessed");
      expect(recipientAndCompetence.primaryAuthority).toBeUndefined();

      const stage = getProposalInstitutionalState(proposal);
      expect(stage.publicState).toBe("segnalata");
      expect(stage.hasFormalization).toBe(false);
      expect(stage.hasInstitutionalFollowUp).toBe(false);
      expect(stage.implementation).toBe("none");

      const geography = getProposalGeography(proposal.id);
      expect(geography, candidate.id).toBeDefined();
      expect(geography!.scope).toBe(candidate.scope);
      expect(geography!.points).toEqual([]);
      expect(isProposalGeoreferenced(proposal.id)).toBe(false);
    }
  });
});
