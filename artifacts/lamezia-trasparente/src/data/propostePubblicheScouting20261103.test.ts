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
  {id:"corsi-acqua-manutenzione-cristiano-villella-2026", promoter:"massimo-cristiano-carmine-villella-futuro-nazionale", primary:"11", secondary:["8"], first:"2026-10-10", events:2 },
  {id:"welfare-tavoli-permanenti-forum-terzo-settore-2025", promoter:"forum-terzo-settore-lametino-reventino", primary:"2", secondary:[], first:"2025-12-10", events:4 },
] as const;

describe("Scouting 3 novembre — test congiunto per gli stessi proposal ID", () => {
  it("preserva tutte le 15 materie ufficiali e gli URI del loro schema", () => {
    const c = getAllPaPublicServiceSubjects();
    expect(c).toHaveLength(15);
    expect(new Set(c.map(x => x.code)).size).toBe(15);
    expect(c.every(x => x.code && x.label && x.uri && x.schemeUri && x.authority)).toBe(true);
  });

  for (const row of rows) {
    it("garantisce acquisizione, canone, mapping, competenza distinta, timeline e geografia per " + row.id, () => {
      const matches = PUBLIC_PROPOSALS.filter(p => p.id === row.id);
      expect(matches).toHaveLength(1);
      const p = matches[0]!;
      expect(p.promoterId).toBe(row.promoter);
      expect(p.firstSeen).toBe(row.first);
      expect(p.lastUpdated).toBe("2026-11-02");
      expect(p.status).toBe("proposta_emersa");
      expect(p.institutionalRecipient?.trim().length).toBeGreaterThan(12);
      expect(p.sourceUrl).toMatch(/^https:\/\//);
      expect(p.events).toHaveLength(row.events);
      expect(new Set(p.events.map(e=>e.id)).size).toBe(p.events.length);
      expect(p.events.every(e => e.date >= p.firstSeen && e.date <= p.lastUpdated)).toBe(true);
      expect(p.events.every(e => e.type === "emersione" || e.type === "aggiornamento")).toBe(true);
      expect(p.events.filter(e => e.type === "emersione")).toHaveLength(1);
      expect(p.verificationNote).toContain("not_assessed");

      const canon = getCanonicalProposalPresentation(p);
      expect(getCanonicalProposalPresentationIds()).toContain(row.id);
      expect(canon.proposalId).toBe(row.id);
      expect(canon.title.length).toBeGreaterThan(20);
      expect(canon.request.length).toBeGreaterThan(40);
      expect(canon.measures.length).toBeGreaterThanOrEqual(3);
      expect(canon.actionTypes.length).toBeGreaterThan(0);

      const primary = getProposalPrimaryPaSubject(p);
      expect(primary.code).toBe(row.primary);
      expect(primary.source).toBe("schema.gov.it / AgID");
      const secondary = getProposalSecondaryPaSubjects(p);
      expect(secondary.map(s => s.code)).toEqual([...row.secondary]);
      expect(secondary.every(s => s.uri !== primary.uri)).toBe(true);

      const authority = getProposalInstitutionalCompetence(p);
      expect(authority.sourceAddressee).toBe(p.institutionalRecipient);
      expect(authority.publicAddressee).toBeTruthy();
      expect(authority.assessmentStatus).toBe("not_assessed");
      expect(authority.primaryAuthority).toBeUndefined();
      expect(authority.involvedAuthorities).toEqual([]);

      const state = getProposalInstitutionalState(p);
      expect(state.publicState).toBe("segnalata");
      expect(state.progressStage).toBe("emersa");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");

      const g = getProposalGeography(row.id)!;
      expect(g.scope).toBe("citywide");
      expect(g.areas).toEqual(["intera_citta"]);
      expect(g.points).toEqual([]);
      expect(isProposalGeoreferenced(row.id)).toBe(false);
    });
  }

  it("non attribuisce all'avviso ATS del 30 ottobre recepimento o attuazione del Forum", () => {
    const p = PUBLIC_PROPOSALS.find(p => p.id === rows[1].id)!;
    const official = p.events.filter(e => e.evidenceLevel === "fonte_ufficiale");
    expect(official).toHaveLength(1);
    expect(official[0].type).toBe("aggiornamento");
    expect(official[0].sourceUrl).toContain("comune.lamezia-terme.cz.it");
    expect(p.events.some(e => e.type === "recepimento" || e.type === "deposito")).toBe(false);
    expect(p.verificationNote).toContain("nesso causale");
  });
});
