import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects, getProposalInstitutionalCompetence, getProposalInstitutionalState } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";
const ids = ["partecipate-accesso-atti-flussi-informativi-masi-2026", "palestra-gatti-igiene-gestione-cestistica-2026"];
describe("Scouting 24 novembre", () => {
  it("conserva le 15 materie ufficiali e una primaria per ciascuna proposta", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map(s => s.code)).size).toBe(15);
    subjects.forEach(s => { expect(s.label).toBeTruthy(); expect(s.uri).toMatch(/^https:\/\//); expect(s.schemeUri).toMatch(/^https:\/\//); expect(s.authority).toBeTruthy(); });
    expect(new Set(PUBLIC_PROPOSALS.map(p => p.id)).size).toBe(PUBLIC_PROPOSALS.length);
  });
  ids.forEach((id, i) => {
    it("valida acquisizione, semantica, destinatario, competenza, timeline e geografia: " + id, () => {
      const matches = PUBLIC_PROPOSALS.filter(p => p.id === id);
      expect(matches).toHaveLength(1);
      const p = matches[0]!;
      expect(getCanonicalProposalPresentationIds()).toContain(id);
      const c = getCanonicalProposalPresentation(p);
      expect(c.proposalId).toBe(id);
      expect(c.request).toBeTruthy();
      expect(c.measures).toHaveLength(4);
      expect(getProposalPrimaryPaSubject(p).code).toBe(i === 0 ? "GOVE" : "10");
      expect(getProposalSecondaryPaSubjects(p).map(s => s.code)).toEqual(i === 0 ? ["9"] : ["2", "11"]);
      expect(p.institutionalRecipient).toBeTruthy();
      const competence = getProposalInstitutionalCompetence(p);
      expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
      expect(competence.assessmentStatus).toBe("partially_verified");
      expect(competence.primaryAuthority?.sourceUrl).toBeTruthy();
      expect(p.events.map(e => e.type)).toEqual(["emersione"]);
      expect(p.events.map(e => e.date)).toEqual(["2026-11-23"]);
      expect(p.linkedActs).toHaveLength(0);
      const state = getProposalInstitutionalState(p);
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.publicState).toBe("segnalata");
      expect(state.implementation).toBe("none");
      const g = getProposalGeography(id)!;
      expect(g.scope).toBe(i === 0 ? "citywide" : "area");
      expect(g.areas).toEqual(i === 0 ? ["intera_citta"] : ["nicastro"]);
      expect(g.points).toHaveLength(0);
      expect(isProposalGeoreferenced(id)).toBe(false);
    });
  });
});
