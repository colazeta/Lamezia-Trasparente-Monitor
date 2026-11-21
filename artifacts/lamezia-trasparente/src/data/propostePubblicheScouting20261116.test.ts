import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalInstitutionalCompetence, getProposalInstitutionalState, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const cases = [
  {id: "via-montello-illuminazione-potature-carito-2026", promoter: "francesco-carito-partito-democratico-lamezia", primary: "4", secondary: ["8"], actions: ["manutenzione", "messa_in_sicurezza"]},
  {id: "bellafemmina-ente-fiera-servizi-bevilacqua-2026", promoter: "gianpaolo-bevilacqua", primary: "12", secondary: ["5", "4"], actions: ["infrastruttura", "valorizzazione", "coordinamento"]},
] as const;
describe("Scouting 16 novembre: gate end-to-end sui medesimi proposal ID", () => {
  it("preserva il vocabolario AgID completo con codici, labels, URI e autorità", () => {
    const all = getAllPaPublicServiceSubjects();
    expect(all).toHaveLength(15);
    expect(new Set(all.map(s => s.code)).size).toBe(15);
    for (const x of all) {
      expect(x.label).toBeTruthy();
      expect(x.uri.startsWith("https://")).toBe(true);
      expect(x.schemeUri.startsWith("https://")).toBe(true);
      expect(x.authority).toBeTruthy();
      expect(x.source).toBe("schema.gov.it / AgID");
    }
  });
  for (const entry of cases) {
    it(entry.id + ": acquisizione unica, canone, semantica, competenza, stato e geografia", () => {
      const found = PUBLIC_PROPOSALS.filter(p => p.id === entry.id);
      expect(found).toHaveLength(1);
      const p = found[0]!;
      expect(p.promoterId).toBe(entry.promoter);
      expect(p.institutionalRecipient).toBeTruthy();
      expect(p.firstSeen).toBe("2026-11-14");
      expect(p.lastUpdated).toBe(entry.id.startsWith("via-montello") ? "2026-11-20" : "2026-11-14");
      expect(p.channel).toBe("comunicato");
      expect(p.status).toBe("proposta_emersa");
      expect(p.evidenceLevel).toBe("fonte_stampa");
      expect(p.sourceUrl?.startsWith("https://")).toBe(true);
      expect(p.events).toHaveLength(entry.id.startsWith("via-montello") ? 2 : 1);
      if (entry.id.startsWith("via-montello")) {
        expect(p.events[1]?.type).toBe("aggiornamento");
        expect(p.events[1]?.date).toBe("2026-11-20");
        expect(p.events[1]?.sourceUrl).toContain("vescio-pd-illuminazione-area-pip");
      }
      expect(p.events[0]?.type).toBe("emersione");
      expect(p.events[0]?.date).toBe(p.firstSeen);
      expect(p.events[0]?.sourceUrl).toBe(p.sourceUrl);
      expect(p.linkedActs).toHaveLength(0);
      const canonical = getCanonicalProposalPresentation(p);
      expect(getCanonicalProposalPresentationIds()).toContain(entry.id);
      expect(canonical.proposalId).toBe(entry.id);
      expect(canonical.request.length).toBeGreaterThan(50);
      expect(canonical.measures.length).toBeGreaterThanOrEqual(3);
      expect(canonical.measures.every(m => m.length > 25)).toBe(true);
      expect(canonical.actionTypes).toEqual(entry.actions);
      expect(canonical.editorialNote).toBeTruthy();
      const primary = getProposalPrimaryPaSubject(p);
      const secondary = getProposalSecondaryPaSubjects(p);
      expect(primary.code).toBe(entry.primary);
      expect(primary.uri.startsWith("https://")).toBe(true);
      expect(secondary.map(s => s.code)).toEqual(entry.secondary);
      expect(secondary.every(s => s.uri !== primary.uri)).toBe(true);
      expect(new Set(secondary.map(s => s.uri)).size).toBe(secondary.length);
      const competence = getProposalInstitutionalCompetence(p);
      expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);
      const state = getProposalInstitutionalState(p);
      expect(state.publicState).toBe("segnalata");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");
      const g = getProposalGeography(entry.id)!;
      expect(g.scope).toBe("area");
      expect(g.areas).toContain("sant_eufemia");
      expect(g.points).toHaveLength(0);
      expect(isProposalGeoreferenced(entry.id)).toBe(false);
      expect(g.note).toContain("WGS84");
    });
  }
  it("non fonde i progetti di promotori diversi per prossimità geografica", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === cases[1].id)!;
    const n = PUBLIC_PROPOSALS.find(x => x.id === "zuccherificio-opificio-hub-polifunzionale-natrella-2026")!;
    expect(p.promoterId).not.toBe(n.promoterId);
    expect(p.threadId).not.toBe(n.threadId);
  });
});
