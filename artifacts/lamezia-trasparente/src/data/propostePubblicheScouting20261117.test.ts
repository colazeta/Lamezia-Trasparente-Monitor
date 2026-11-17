import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalInstitutionalCompetence, getProposalInstitutionalState, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const id = "polo-sportivo-paralimpico-stretto-iona-2026";
describe("Scouting 17 novembre: proposta del polo paralimpico e sviluppo regionale", () => {
  it("preserva tutte le quindici materie ufficiali complete", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map(x => x.code)).size).toBe(15);
    for (const x of subjects) {
      expect(x.label).toBeTruthy();
      expect(x.uri.startsWith("https://")).toBe(true);
      expect(x.schemeUri.startsWith("https://")).toBe(true);
      expect(x.authority).toBeTruthy();
      expect(x.source).toBe("schema.gov.it / AgID");
    }
  });
  it("garantisce ID unico e timeline documentata senza inferire deposito", () => {
    const matches = PUBLIC_PROPOSALS.filter(p => p.id === id);
    expect(matches).toHaveLength(1);
    const p = matches[0]!;
    expect(p.promoterId).toBe("emanuele-iona");
    expect(p.promoterType).toBe("consigliere");
    expect(p.institutionalRecipient).toBe("Presidente della Regione Calabria");
    expect(p.firstSeen).toBe("2026-05-17");
    expect(p.lastUpdated).toBe("2026-11-16");
    expect(p.status).toBe("proposta_emersa");
    expect(p.linkedActs).toHaveLength(0);
    expect(p.events.map(e => e.type)).toEqual(["emersione","aggiornamento"]);
    expect(p.events.map(e => e.date)).toEqual(["2026-05-17","2026-11-16"]);
    expect(p.events[0].sourceUrl).toContain("lameziainforma.it");
    expect(p.events[1].sourceUrl).toContain("regione.calabria.it");
    expect(p.events[1].evidenceLevel).toBe("fonte_ufficiale");
  });
  it("garantisce presentazione canonica e primaria ufficiale con secondarie distinte", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    const c = getCanonicalProposalPresentation(p);
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(c.proposalId).toBe(id);
    expect(c.request.length).toBeGreaterThan(40);
    expect(c.measures.length).toBeGreaterThanOrEqual(4);
    expect(c.actionTypes).toEqual(["infrastruttura","valorizzazione","coordinamento"]);
    expect(c.editorialNote).toContain("non");
    const primary = getProposalPrimaryPaSubject(p);
    const secondary = getProposalSecondaryPaSubjects(p);
    expect(primary.code).toBe("10");
    expect(secondary.map(x => x.code)).toEqual(["2","5"]);
    expect(new Set([primary.uri,...secondary.map(x=>x.uri)]).size).toBe(3);
  });
  it("distingue destinatario dalla competenza verificata soltanto sulla delibera procedurale", () => {
    const p = PUBLIC_PROPOSALS.find(x => x.id === id)!;
    const a = getProposalInstitutionalCompetence(p);
    expect(a.sourceAddressee).toBe(p.institutionalRecipient);
    expect(a.publicAddressee).toBeTruthy();
    expect(a.assessmentStatus).toBe("partially_verified");
    expect(a.primaryAuthority?.sourceUrl).toContain("regione.calabria.it");
    expect(a.assessmentNote).toContain("non");
    const s = getProposalInstitutionalState(p);
    expect(s.hasFormalization).toBe(false);
    expect(s.implementation).toBe("none");
    expect(s.publicState).not.toBe("attuata");
  });
  it("mantiene area senza coordinate non fondate", () => {
    const g=getProposalGeography(id)!;
    expect(g.scope).toBe("area");
    expect(g.points).toHaveLength(0);
    expect(g.note).toContain("WGS84");
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
});
