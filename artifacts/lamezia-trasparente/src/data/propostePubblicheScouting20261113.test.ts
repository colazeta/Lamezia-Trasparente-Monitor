import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalInstitutionalCompetence, getProposalInstitutionalState, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const cases = [
  { id: "capizzaglie-un-passo-oltre-riattivazione-cristiano-villella-2026", promoter: "massimo-cristiano-carmine-villella-futuro-nazionale", primary: "5", secondary: ["2", "10"], recipient: "Sindaco di Lamezia Terme, Mario Murone" },
  { id: "rambaldi-de-fazio-secondo-accesso-nuovo-cdu-2026", promoter: "nuovo-cdu-lamezia-terme", primary: "4", secondary: ["1", "8"], recipient: "Provincia di Catanzaro" },
] as const;

describe("Scouting 13 novembre — gate end-to-end sul medesimo insieme di proposal ID", () => {
  it("preserva tutte le quindici materie AgID con codici e metadati ufficiali", () => {
    const all = getAllPaPublicServiceSubjects();
    expect(all).toHaveLength(15);
    expect(new Set(all.map(s => s.code)).size).toBe(15);
    for (const s of all) {
      expect(s.label).toBeTruthy();
      expect(s.uri).toMatch(/^https:\/\//);
      expect(s.schemeUri).toMatch(/^https:\/\//);
      expect(s.authority).toBeTruthy();
      expect(s.source).toBe("schema.gov.it / AgID");
    }
  });
  for (const row of cases) {
    it("verifica acquisizione, canonica, tassonomia, destinatario, stato e geografia per " + row.id, () => {
      const matches = PUBLIC_PROPOSALS.filter(p => p.id === row.id);
      expect(matches).toHaveLength(1);
      const p = matches[0]!;
      expect(p.promoterId).toBe(row.promoter);
      expect(p.institutionalRecipient).toBe(row.recipient);
      expect(p.firstSeen).toBe("2026-11-12");
      expect(p.lastUpdated).toBe("2026-11-12");
      expect(p.status).toBe("proposta_emersa");
      expect(p.verificationNote).toContain("not_assessed");
      expect(p.sourceUrl).toMatch(/^https:\/\//);
      expect(p.linkedActs).toHaveLength(0);
      expect(p.events).toHaveLength(1);
      expect(p.events[0]!.type).toBe("emersione");
      expect(p.events[0]!.date).toBe(p.firstSeen);
      expect(p.events[0]!.sourceUrl).toBe(p.sourceUrl);
      expect(p.events.every(e => !["deposito","petizione","calendarizzazione","recepimento"].includes(e.type))).toBe(true);

      const can = getCanonicalProposalPresentation(p);
      expect(getCanonicalProposalPresentationIds()).toContain(row.id);
      expect(can.proposalId).toBe(row.id);
      expect(can.version).toBe("1.0");
      expect(can.title).toBeTruthy();
      expect(can.request.length).toBeGreaterThan(45);
      expect(can.measures.length).toBeGreaterThanOrEqual(5);
      expect(can.actionTypes.length).toBeGreaterThan(0);
      expect(can.measures.every(m => m.length > 25)).toBe(true);

      const primary = getProposalPrimaryPaSubject(p);
      expect(primary.code).toBe(row.primary);
      expect(primary.uri).toMatch(/^https?:\/\//);
      expect(primary.schemeUri).toMatch(/^https?:\/\//);
      expect(primary.authority).toBeTruthy();
      const secondary = getProposalSecondaryPaSubjects(p);
      expect(secondary.map(s => s.code)).toEqual([...row.secondary]);
      expect(secondary.every(s => s.uri !== primary.uri)).toBe(true);
      expect(new Set(secondary.map(s => s.uri)).size).toBe(secondary.length);

      const competence = getProposalInstitutionalCompetence(p);
      expect(competence.sourceAddressee).toBe(row.recipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(competence.involvedAuthorities).toEqual([]);

      const state = getProposalInstitutionalState(p);
      expect(state.publicState).toBe("segnalata");
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.implementation).toBe("none");

      const g = getProposalGeography(p.id)!;
      expect(g.scope).toBe("area");
      expect(g.areas.length).toBeGreaterThan(0);
      expect(g.points).toHaveLength(0);
      expect(isProposalGeoreferenced(p.id)).toBe(false);
    });
  }
});
