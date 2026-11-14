import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalInstitutionalCompetence, getProposalInstitutionalState, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";

const id = "area-urbana-catanzaro-lamezia-governance-giovani-2026";

describe("Scouting 14 novembre: tutti i gate per lo stesso proposal ID", () => {
  const get = () => PUBLIC_PROPOSALS.find(p => p.id === id)!;
  it("retiene il vocabolario completo di 15 materie AgID nel backend", () => {
    const all = getAllPaPublicServiceSubjects();
    expect(all).toHaveLength(15);
    expect(new Set(all.map(s => s.code)).size).toBe(15);
    for (const x of all) { expect(x.label).toBeTruthy(); expect(x.uri).toMatch(/^https:\/\//); expect(x.schemeUri).toMatch(/^https:\/\//); expect(x.authority).toBeTruthy(); }
  });
  it("acquisisce una sola proposta con fonte, promotore, data, oggetto e destinatario distinti", () => {
    expect(PUBLIC_PROPOSALS.filter(p => p.id === id)).toHaveLength(1);
    const p = get();
    expect(p.promoterId).toBe("movimento-giovanile-rilancio-area-urbana-catanzaro-lamezia");
    expect(p.promoterType).toBe("cittadino_comitato");
    expect(p.institutionalRecipient).toContain("Regione Calabria");
    expect(p.firstSeen).toBe("2026-11-09");
    expect(p.lastUpdated).toBe(p.firstSeen);
    expect(p.status).toBe("proposta_emersa");
    expect(p.channel).toBe("comunicato");
    expect(p.sourceUrl).toMatch(/^https:\/\//);
    expect(p.events).toHaveLength(1);
    expect(p.events[0]?.type).toBe("emersione");
    expect(p.events[0]?.date).toBe(p.firstSeen);
    expect(p.events[0]?.sourceUrl).toBe(p.sourceUrl);
    expect(p.events.every(e => !["deposito", "petizione", "calendarizzazione", "discussione", "risposta_istituzionale", "recepimento"].includes(e.type))).toBe(true);
    expect(p.linkedActs.some(a => a.includes("112"))).toBe(true);
  });
  it("ha presentazione canonica neutrale, misure atomiche e facet operative", () => {
    const can = getCanonicalProposalPresentation(get());
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(can.proposalId).toBe(id);
    expect(can.request.length).toBeGreaterThan(50);
    expect(can.measures.length).toBeGreaterThanOrEqual(4);
    expect(can.measures.every(m => m.length > 30)).toBe(true);
    expect(can.actionTypes).toEqual(["coordinamento","organizzazione","trasparenza"]);
  });
  it("mantiene una materia primaria ufficiale e secondarie distinte", () => {
    const p=get(), prim=getProposalPrimaryPaSubject(p), sec=getProposalSecondaryPaSubjects(p);
    expect(prim.code).toBe("GOVE");
    expect(prim.uri).toBe("http://publications.europa.eu/resource/authority/data-theme/GOVE");
    expect(prim.authority).toBeTruthy();
    expect(sec.map(s => s.code)).toEqual(["4"]);
    expect(sec.every(s => s.uri !== prim.uri)).toBe(true);
  });
  it("valuta la sola competenza regionale documentata, non quella del destinatario per deduzione", () => {
    const c=getProposalInstitutionalCompetence(get());
    expect(c.sourceAddressee).toBe(get().institutionalRecipient);
    expect(c.publicAddressee).toBeTruthy();
    expect(c.assessmentStatus).toBe("partially_verified");
    expect(c.primaryAuthority?.level).toBe("regional");
    expect(c.primaryAuthority?.sourceUrl).toMatch(/^https:\/\//);
    expect(c.assessmentNote).toMatch(/soltant|limitata|limitat/);
    expect(c.involvedAuthorities).toEqual([]);
  });
  it("non confonde un atto regionale antecedente con recepimento o attuazione", () => {
    const s=getProposalInstitutionalState(get());
    expect(s.publicState).toBe("segnalata");
    expect(s.implementation).toBe("none");
    expect(s.hasInstitutionalFollowUp).toBe(false);
    expect(s.hasFormalization).toBe(false);
  });
  it("rappresenta l'area sovracomunale senza inventare coordinate", () => {
    const g=getProposalGeography(id)!;
    expect(g.scope).toBe("area");
    expect(g.points).toHaveLength(0);
    expect(g.note).toMatch(/sovracomunale/);
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
});
