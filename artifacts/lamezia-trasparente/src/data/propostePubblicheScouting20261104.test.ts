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

const ids = ["cottola-fiala-pulizia-detriti-residenti-agricoltori-2026", "riequilibrio-piano-revoca-mascaro-2026"] as const;

describe("Scouting 4 novembre — controlli end-to-end sui medesimi proposal ID", () => {
  it("mantiene il catalogo completo di 15 materie con codici, URI, scheme e autorità", () => {
    const all = getAllPaPublicServiceSubjects();
    expect(all).toHaveLength(15);
    expect(new Set(all.map(x => x.code)).size).toBe(15);
    expect(all.every(x => x.label && x.code && x.uri && x.schemeUri && x.authority)).toBe(true);
  });

  for (const id of ids) {
    it("preserva identità, canone, profilo ufficiale, competenza distinta e timeline: " + id, () => {
      const rows = PUBLIC_PROPOSALS.filter(p => p.id === id);
      expect(rows).toHaveLength(1);
      const p = rows[0]!;
      expect(p.lastUpdated).toBe("2026-11-03");
      expect(p.institutionalRecipient).toBeTruthy();
      expect(p.verificationNote).toContain("not_assessed");
      expect(new Set(p.events.map(e => e.id)).size).toBe(p.events.length);
      expect(p.events.every(e => e.sourceUrl?.startsWith("https://"))).toBe(true);
      expect(p.events.every(e => e.date >= p.firstSeen && e.date <= p.lastUpdated)).toBe(true);
      expect(p.events.filter(e => e.type === "emersione")).toHaveLength(1);
      expect(p.events.every(e => e.type === "emersione" || e.type === "aggiornamento")).toBe(true);

      const canonical = getCanonicalProposalPresentation(p);
      expect(getCanonicalProposalPresentationIds()).toContain(id);
      expect(canonical.proposalId).toBe(id);
      expect(canonical.request.length).toBeGreaterThan(40);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(2);
      expect(canonical.actionTypes.length).toBeGreaterThan(0);
      const primary = getProposalPrimaryPaSubject(p);
      expect(primary.code).toBe(id === ids[0] ? "11" : "9");
      expect(primary.source).toBe("schema.gov.it / AgID");
      const secondary = getProposalSecondaryPaSubjects(p);
      expect(secondary.map(s => s.code)).toEqual(id === ids[0] ? ["8"] : []);
      expect(secondary.every(s => s.uri !== primary.uri)).toBe(true);

      const competence = getProposalInstitutionalCompetence(p);
      expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);

      const state = getProposalInstitutionalState(p);
      expect(state.publicState).toBe("segnalata");
      expect(state.progressStage).toBe("emersa");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");
      expect(p.status).toBe("proposta_emersa");

      const geo = getProposalGeography(id);
      expect(geo).toBeDefined();
      expect(geo!.points).toHaveLength(0);
      expect(isProposalGeoreferenced(id)).toBe(false);
    });
  }

  it("separa i residenti di Fialà dai consiglieri pur con lo stesso filone", () => {
    const residents = PUBLIC_PROPOSALS.find(p => p.id === ids[0])!;
    const councillors = PUBLIC_PROPOSALS.find(p => p.id === "corsi-acqua-manutenzione-cristiano-villella-2026")!;
    expect(residents.promoterId).not.toBe(councillors.promoterId);
    expect(residents.threadId).toBe(councillors.threadId);
    expect(residents.events).toHaveLength(1);
    expect(getProposalGeography(ids[0])!.scope).toBe("area");
  });

  it("non converte il voto sul piano in rigetto, deposito o attuazione della proposta Mascaro", () => {
    const p = PUBLIC_PROPOSALS.find(p => p.id === ids[1])!;
    expect(p.events).toHaveLength(3);
    expect(p.events.at(-1)!.sourceUrl).toContain("ansa.it");
    expect(p.events.at(-1)!.type).toBe("aggiornamento");
    expect(p.verificationNote).toContain("testo originale della deliberazione");
    expect(p.events.some(e => e.type === "recepimento" || e.type === "deposito")).toBe(false);
    expect(getProposalGeography(ids[1])!.scope).toBe("citywide");
  });
});
