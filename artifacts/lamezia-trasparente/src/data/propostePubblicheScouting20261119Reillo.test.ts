import { describe, it, expect } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects, getProposalInstitutionalCompetence, getProposalInstitutionalState } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";
const id = "villetta-reillo-albero-sicurezza-masi-2026";
describe("Recupero Reillo: gate end-to-end sullo stesso proposal ID",()=>{
  it("mantiene interamente il vocabolario ufficiale AgID a 15 concetti",()=>{
    const all=getAllPaPublicServiceSubjects();
    expect(all).toHaveLength(15);
    expect(new Set(all.map(x=>x.code)).size).toBe(15);
    for(const x of all){ expect(x.code).toBeTruthy();expect(x.label).toBeTruthy();expect(x.uri.startsWith("https://")).toBe(true);expect(x.schemeUri.startsWith("https://")).toBe(true);expect(x.authority).toBeTruthy();}
  });
  it("deduplica identità e separa il thread dell'albero da quello delle strade",()=>{
    expect(PUBLIC_PROPOSALS.filter(x=>x.id===id)).toHaveLength(1);
    expect(new Set(PUBLIC_PROPOSALS.map(x=>x.id)).size).toBe(PUBLIC_PROPOSALS.length);
    const a=PUBLIC_PROPOSALS.find(x=>x.id===id)!;
    const b=PUBLIC_PROPOSALS.find(x=>x.id==="quartiere-bella-manutenzione-masi-2026")!;
    expect(a.promoterId).toBe("gennarino-masi");
    expect(a.promoterId).toBe(b.promoterId);
    expect(a.threadId).not.toBe(b.threadId);
    expect(a.theme).not.toBe(b.theme);
  });
  it("conserva acquisizione, fonte, timeline e rappresentazione civica verificabili",()=>{
    const p=PUBLIC_PROPOSALS.find(x=>x.id===id)!;
    expect(p.sourceUrl).toBe("https://www.lameziaterme.it/quartiere-bella-masi-pd-lamezia-albero-di-20-metri-sui-tetti-delle-case/");
    expect(p.firstSeen).toBe("2026-11-15");
    expect(p.lastUpdated).toBe("2026-11-15");
    expect(p.promoterType).toBe("consigliere");
    expect(p.channel).toBe("comunicato");
    expect(p.status).toBe("proposta_emersa");
    expect(p.institutionalRecipient).toBe("Amministrazione comunale di Lamezia Terme");
    expect(p.events).toHaveLength(1);
    expect(p.events[0]?.type).toBe("emersione");
    expect(p.events[0]?.date).toBe("2026-11-15");
    expect(p.events[0]?.sourceUrl).toBe(p.sourceUrl);
    expect(p.linkedActs).toHaveLength(0);
    const c=getCanonicalProposalPresentation(p);
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(c.proposalId).toBe(id);
    expect(c.title).toBeTruthy();expect(c.request.length).toBeGreaterThan(50);
    expect(c.measures.length).toBeGreaterThanOrEqual(4);
    expect(c.measures.every(x=>x.length>20)).toBe(true);
    expect(c.actionTypes).toEqual(["messa_in_sicurezza","manutenzione","trasparenza"]);
    expect(c.expectedOutcome).toBeTruthy();expect(c.editorialNote).toBeTruthy();
  });
  it("distingue materia primaria, secondarie e competenza non inferita",()=>{
    const p=PUBLIC_PROPOSALS.find(x=>x.id===id)!;
    const primary=getProposalPrimaryPaSubject(p), secondary=getProposalSecondaryPaSubjects(p);
    expect(primary.code).toBe("11");
    expect(secondary.map(x=>x.code)).toEqual(["8"]);
    expect(secondary.every(x=>x.uri!==primary.uri)).toBe(true);
    const comp=getProposalInstitutionalCompetence(p);
    expect(comp.sourceAddressee).toBe(p.institutionalRecipient);
    expect(comp.publicAddressee).toBeTruthy();
    expect(comp.assessmentStatus).toBe("not_assessed");
    expect(comp.primaryAuthority).toBeUndefined();
    expect(comp.involvedAuthorities).toEqual([]);
  });
  it("non deduce deposito, recepimento o attuazione e mantiene geografia integra",()=>{
    const p=PUBLIC_PROPOSALS.find(x=>x.id===id)!;
    const state=getProposalInstitutionalState(p);
    expect(state.publicState).toBe("segnalata");
    expect(state.hasFormalization).toBe(false);
    expect(state.hasInstitutionalFollowUp).toBe(false);
    expect(state.implementation).toBe("none");
    const g=getProposalGeography(id)!;
    expect(g.scope).toBe("area");
    expect(g.areas).toEqual(["nicastro"]);
    expect(g.points).toHaveLength(0);
    expect(g.note).toContain("WGS84");
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
});
