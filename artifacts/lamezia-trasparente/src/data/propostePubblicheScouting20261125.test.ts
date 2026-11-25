import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects, getProposalInstitutionalCompetence, getProposalInstitutionalState } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";
import { applyScoutingUpdates20261125CorsiAcqua } from "./propostePubblicheScouting20261125";
const cases = [
  { id: "verde-urbano-adattamento-caldo-isde-2026", primary: "11", secondary: ["2","5"], count: 4 },
  { id: "prevenzione-violenza-genere-lamezia-bene-comune-2026", primary: "2", secondary: ["1","3","8"], count: 3 },
] as const;
describe("Scouting 25 novembre 2026", () => {
  it("preserves official vocabulary and unique proposal ids", () => {
    const subjects = getAllPaPublicServiceSubjects();
    expect(subjects).toHaveLength(15);
    expect(new Set(subjects.map(s=>s.code)).size).toBe(15);
    subjects.forEach(s=>{expect(s.label).toBeTruthy(); expect(s.uri).toMatch(/^https:\/\//); expect(s.schemeUri).toMatch(/^https:\/\//); expect(s.authority).toBeTruthy();});
    expect(new Set(PUBLIC_PROPOSALS.map(p=>p.id)).size).toBe(PUBLIC_PROPOSALS.length);
  });
  cases.forEach(({id,primary,secondary,count}) => {
    it("validates acquisition, canonical presentation, semantic profile, geography and institutional state: "+id, () => {
      const matches = PUBLIC_PROPOSALS.filter(p=>p.id===id);
      expect(matches).toHaveLength(1);
      const p = matches[0]!;
      expect(getCanonicalProposalPresentationIds()).toContain(id);
      const c = getCanonicalProposalPresentation(p);
      expect(c.proposalId).toBe(id);
      expect(c.request).toBeTruthy();
      expect(c.measures).toHaveLength(count);
      expect(getProposalPrimaryPaSubject(p).code).toBe(primary);
      expect(getProposalSecondaryPaSubjects(p).map(s=>s.code)).toEqual(secondary);
      expect(p.institutionalRecipient).toBeTruthy();
      const competence = getProposalInstitutionalCompetence(p);
      expect(competence.sourceAddressee).toBe(p.institutionalRecipient);
      expect(competence.publicAddressee).toBeTruthy();
      expect(competence.assessmentStatus).toBe("not_assessed");
      expect(competence.primaryAuthority).toBeUndefined();
      expect(p.events.map(e=>e.type)).toEqual(["emersione"]);
      expect(p.events.map(e=>e.date)).toEqual(["2026-11-24"]);
      expect(p.linkedActs).toHaveLength(0);
      const state = getProposalInstitutionalState(p);
      expect(state.hasFormalization).toBe(false);
      expect(state.hasInstitutionalFollowUp).toBe(false);
      expect(state.publicState).toBe("segnalata");
      expect(state.implementation).toBe("none");
      expect(getProposalInstitutionalState({...p, events:[...p.events,{...p.events[0]!,type:"petizione"}]}).hasFormalization).toBe(false);
      expect(getProposalInstitutionalState({...p,status:"recepita_parzialmente"}).implementation).toBe("none");
      const g = getProposalGeography(id)!;
      expect(g.scope).toBe("citywide");
      expect(g.areas).toEqual(["intera_citta"]);
      expect(g.points).toHaveLength(0);
      expect(isProposalGeoreferenced(id)).toBe(false);
    });
  });
  it("updates the original watercourse proposal without duplicating it or inferring implementation", () => {
    const id = "corsi-acqua-manutenzione-cristiano-villella-2026";
    const matches = PUBLIC_PROPOSALS.filter(p=>p.id===id);
    expect(matches).toHaveLength(1);
    const p = matches[0]!;
    expect(getCanonicalProposalPresentationIds()).toContain(id);
    expect(getCanonicalProposalPresentation(p).proposalId).toBe(id);
    expect(getProposalPrimaryPaSubject(p).code).toBeTruthy();
    expect(p.institutionalRecipient).toBeTruthy();
    expect(getProposalInstitutionalCompetence(p).sourceAddressee).toBe(p.institutionalRecipient);
    const events = p.events.filter(e=>e.id==="corsi-acqua-presentazione-accordo-calabria-verde-2026-11-24");
    expect(events).toHaveLength(1);
    expect(events[0]!.type).toBe("aggiornamento");
    expect(events[0]!.date).toBe("2026-11-24");
    expect(p.lastUpdated).toBe("2026-11-24");
    expect(applyScoutingUpdates20261125CorsiAcqua(p)).toBe(p);
    expect(getProposalInstitutionalState(p).implementation).toBe("none");
    expect(getProposalGeography(id)?.scope).toBe("citywide");
    expect(isProposalGeoreferenced(id)).toBe(false);
  });
});
