import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalInstitutionalCompetence, getProposalInstitutionalState, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const id = "zuccherificio-opificio-hub-polifunzionale-natrella-2026";
const get = () => PUBLIC_PROPOSALS.find(p => p.id === id)!;
describe("Scouting 14 novembre lotto B: gate end-to-end sul medesimo proposal ID", () => {
  it("preserva l'intero catalogo delle quindici materie AgID con URI e autorità", () => {
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
  it("acquisisce una sola proposta Natrella con data, fonte, oggetto e destinatario documentati", () => {
    expect(PUBLIC_PROPOSALS.filter(p => p.id === id)).toHaveLength(1);
    const p = get();
    expect(p.promoterId).toBe("pasquale-maria-natrella-forza-italia");
    expect(p.promoterType).toBe("forza_politica");
    expect(p.firstSeen).toBe("2026-11-13");
    expect(p.lastUpdated).toBe(p.firstSeen);
    expect(p.institutionalRecipient).toBe("Amministrazione comunale di Lamezia Terme");
    expect(p.channel).toBe("comunicato");
    expect(p.status).toBe("proposta_emersa");
    expect(p.sourceUrl).toMatch(/^https:\/\//);
    expect(p.events).toHaveLength(1);
    expect(p.events[0]?.type).toBe("emersione");
    expect(p.events[0]?.date).toBe(p.firstSeen);
    expect(p.events[0]?.sourceUrl).toBe(p.sourceUrl);
    expect(p.linkedActs).toHaveLength(0);
    expect(p.events.every(e => !["deposito","petizione","calendarizzazione","recepimento","discussione","risposta_istituzionale"].includes(e.type))).toBe(true);
    expect(PUBLIC_PROPOSALS.some(q => q.promoterId === p.promoterId && q.id !== id)).toBe(true);
  });
  it("fornisce canone neutrale e misure operative senza attribuire efficacia dimostrata", () => {
    const c = getCanonicalProposalPresentation(get());
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(c.proposalId).toBe(id);
    expect(c.version).toBe("1.0");
    expect(c.title).toContain("Zuccherificio");
    expect(c.request.length).toBeGreaterThan(60);
    expect(c.measures).toHaveLength(6);
    expect(c.measures.every(m => m.length > 35)).toBe(true);
    expect(c.actionTypes).toEqual(["coordinamento","riuso","valorizzazione","infrastruttura"]);
    expect(c.editorialNote).toMatch(/non risult|non sono/i);
  });
  it("una sola materia primaria ufficiale e secondarie disgiunte, actionTypes solo facet", () => {
    const p = get(), primary = getProposalPrimaryPaSubject(p), secondaries = getProposalSecondaryPaSubjects(p);
    expect(primary.code).toBe("5");
    expect(primary.uri).toMatch(/^https:\/\//);
    expect(primary.schemeUri).toMatch(/^https:\/\//);
    expect(primary.authority).toBeTruthy();
    expect(secondaries.map(s => s.code)).toEqual(["12","4","10"]);
    expect(secondaries.every(s => s.uri !== primary.uri)).toBe(true);
    expect(new Set(secondaries.map(s => s.uri)).size).toBe(secondaries.length);
  });
  it("non inferisce competenza dal destinatario, dallo scopo o dal tema", () => {
    const c = getProposalInstitutionalCompetence(get());
    expect(c.sourceAddressee).toBe(get().institutionalRecipient);
    expect(c.publicAddressee).toBeTruthy();
    expect(c.assessmentStatus).toBe("not_assessed");
    expect(c.primaryAuthority).toBeUndefined();
    expect(c.involvedAuthorities).toEqual([]);
  });
  it("stato pubblico derivato non scambia emersione con deposito, petizione, risposta, recepimento o attuazione", () => {
    const s = getProposalInstitutionalState(get());
    expect(s.publicState).toBe("segnalata");
    expect(s.hasFormalization).toBe(false);
    expect(s.hasInstitutionalFollowUp).toBe(false);
    expect(s.implementation).toBe("none");
  });
  it("area nominata di Sant'Eufemia senza coordinate arbitrarie", () => {
    const g = getProposalGeography(id)!;
    expect(g.scope).toBe("area");
    expect(g.areas).toEqual(["sant_eufemia"]);
    expect(g.points).toHaveLength(0);
    expect(isProposalGeoreferenced(id)).toBe(false);
    expect(g.note).toMatch(/WGS84/);
  });
});
