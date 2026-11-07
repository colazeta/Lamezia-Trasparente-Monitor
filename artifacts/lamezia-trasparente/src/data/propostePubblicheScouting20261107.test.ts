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

const rows = [
  {
    id: "cimitero-nicastro-loculi-verifiche-familiari-2026",
    promoter: "familiari-defunti-cimitero-nicastro",
    date: "2026-11-06",
    primary: "5",
    secondary: ["2", "8"],
    areas: ["nicastro"],
    scope: "area",
  },
  {
    id: "decentramento-tre-municipi-casa-di-vetro-2026",
    promoter: "la-casa-di-vetro",
    date: "2026-06-14",
    primary: "GOVE",
    secondary: [],
    areas: ["intera_citta"],
    scope: "citywide",
  },
  {
    id: "regolamento-cerimoniale-casa-di-vetro-2026",
    promoter: "la-casa-di-vetro",
    date: "2026-07-18",
    primary: "GOVE",
    secondary: [],
    areas: ["intera_citta"],
    scope: "citywide",
  },
] as const;

describe("Scouting 7 novembre — stessi proposal ID in ogni gate", () => {
  it("preserva le quindici materie AgID complete nel backend anche se non usate", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map(subject => subject.code)).size).toBe(15);
    for (const subject of subjects) {
      expect(subject.label).toBeTruthy();
      expect(subject.uri).toMatch(/^https:\/\//);
      expect(subject.schemeUri).toMatch(/^https:\/\//);
      expect(subject.authority).toBeTruthy();
      expect(subject.source).toBe("schema.gov.it / AgID");
    }
  });

  for (const row of rows) {
    it("valida canone, classificazioni, destinatario, competenza, stato, timeline e geografia: " + row.id, () => {
      const hits = PUBLIC_PROPOSALS.filter(proposal => proposal.id === row.id);
      expect(hits).toHaveLength(1);
      const proposal = hits[0]!;
      expect(proposal.promoterId).toBe(row.promoter);
      expect(proposal.firstSeen).toBe(row.date);
      expect(proposal.lastUpdated).toBe(row.date);
      expect(proposal.year).toBe("2026");
      expect(proposal.status).toBe("proposta_emersa");
      expect(proposal.sourceUrl).toMatch(/^https:\/\//);
      expect(proposal.institutionalRecipient?.trim()).toBeTruthy();
      expect(proposal.verificationNote).toContain("not_assessed");
      expect(proposal.events).toHaveLength(1);
      expect(proposal.events[0]!.date).toBe(row.date);
      expect(proposal.events[0]!.type).toBe("emersione");
      expect(proposal.events[0]!.sourceUrl).toBe(proposal.sourceUrl);
      expect(new Set(proposal.events.map(event => event.id)).size).toBe(1);

      const canonical = getCanonicalProposalPresentation(proposal);
      expect(getCanonicalProposalPresentationIds()).toContain(row.id);
      expect(canonical.proposalId).toBe(row.id);
      expect(canonical.version).toBe("1.0");
      expect(canonical.title.length).toBeGreaterThan(15);
      expect(canonical.request.length).toBeGreaterThan(45);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(4);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);
      expect(canonical.measures.every(measure => measure.length > 25)).toBe(true);

      const primary = getProposalPrimaryPaSubject(proposal);
      expect(primary.code).toBe(row.primary);
      expect(primary.uri).toMatch(/^https?:\/\//);
      expect(primary.schemeUri).toMatch(/^https?:\/\//);
      expect(primary.authority).toBeTruthy();
      const secondary = getProposalSecondaryPaSubjects(proposal);
      expect(secondary.map(subject => subject.code)).toEqual([...row.secondary]);
      expect(secondary.every(subject => subject.uri !== primary.uri)).toBe(true);
      expect(new Set(secondary.map(subject => subject.uri)).size).toBe(secondary.length);

      const competence = getProposalInstitutionalCompetence(proposal);
      expect(competence.sourceAddressee).toBe(proposal.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);

      const institutionalState = getProposalInstitutionalState(proposal);
      expect(institutionalState.publicState).toBe("segnalata");
      expect(institutionalState.progressStage).toBe("emersa");
      expect(institutionalState.hasFormalization).toBe(false);
      expect(institutionalState.hasInstitutionalFollowUp).toBe(false);
      expect(institutionalState.implementation).toBe("none");

      const geography = getProposalGeography(row.id)!;
      expect(geography).toBeDefined();
      expect(geography.scope).toBe(row.scope);
      expect(geography.areas).toEqual([...row.areas]);
      expect(geography.points).toHaveLength(0);
      expect(isProposalGeoreferenced(row.id)).toBe(false);
      if (geography.scope === "citywide") {
        expect(geography.areas).toEqual(["intera_citta"]);
      }
    });
  }

  it("deduplica il promotore La Casa di Vetro senza fondere oggetti diversi", () => {
    const municipal = PUBLIC_PROPOSALS.find(proposal => proposal.id === rows[1].id)!;
    const ceremonial = PUBLIC_PROPOSALS.find(proposal => proposal.id === rows[2].id)!;
    expect(municipal.promoterId).toBe(ceremonial.promoterId);
    expect(municipal.id).not.toBe(ceremonial.id);
    expect(municipal.theme).not.toBe(ceremonial.theme);
    expect(municipal.threadId).not.toBe(ceremonial.threadId);
    expect(municipal.events).toHaveLength(1);
    expect(ceremonial.events).toHaveLength(1);
  });

  it("non attribuisce per analogia competenza o attuazione ai destinatari", () => {
    const cemetery = PUBLIC_PROPOSALS.find(proposal => proposal.id === rows[0].id)!;
    expect(cemetery.institutionalRecipient).toContain("non nominati");
    expect(cemetery.verificationNote).toContain("NON assimilato a competenza");
    for (const row of rows) {
      const proposal = PUBLIC_PROPOSALS.find(p => p.id === row.id)!;
      expect(proposal.events.every(event => event.type === "emersione")).toBe(true);
      expect(proposal.linkedActs).toHaveLength(0);
    }
  });
});
