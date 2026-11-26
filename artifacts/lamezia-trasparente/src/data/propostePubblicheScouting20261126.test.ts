import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects, getProposalInstitutionalCompetence, getProposalInstitutionalState } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";
const cases = [
  {
    "id": "via-settembrini-illuminazione-cristiano-villella-2026",
    "promoter": "massimo-cristiano-carmine-villella-futuro-nazionale",
    "date": "2026-11-25",
    "primary": "4",
    "secondary": [
      "8"
    ],
    "count": 3,
    "area": "sambiase",
    "scope": "area",
    "assessment": "partially_verified"
  },
  {
    "id": "approdo-turistico-leggero-gruppo-pd-2026",
    "promoter": "gruppo-consiliare-pd-lamezia-terme",
    "date": "2026-11-24",
    "primary": "4",
    "secondary": [
      "7",
      "5",
      "11"
    ],
    "count": 6,
    "area": "costa",
    "scope": "area",
    "assessment": "not_assessed"
  },
  {
    "id": "prevenzione-violenza-genere-azione-lamezia-2026",
    "promoter": "azione-lamezia-terme",
    "date": "2026-11-25",
    "primary": "2",
    "secondary": [
      "1",
      "3",
      "8"
    ],
    "count": 6,
    "area": "intera_citta",
    "scope": "citywide",
    "assessment": "not_assessed"
  }
] as const;
describe("Scouting 26 novembre — gate congiunto", () => {
 it("preserva le 15 materie ufficiali e gli ID univoci", () => {
   const subjects = getAllPaPublicServiceSubjects();
   expect(subjects).toHaveLength(15);
   expect(new Set(subjects.map(s=>s.code)).size).toBe(15);
   subjects.forEach(s=>{expect(s.label && s.uri && s.schemeUri && s.authority).toBeTruthy();});
   expect(new Set(PUBLIC_PROPOSALS.map(p=>p.id)).size).toBe(PUBLIC_PROPOSALS.length);
 });
 for (const row of cases) it("verifica acquisizione, canone, tassonomia, destinatario, competenza, stato e geografia: "+row.id, () => {
   const matches=PUBLIC_PROPOSALS.filter(p=>p.id===row.id);
   expect(matches).toHaveLength(1);
   const p=matches[0]!;
   expect(p.promoterId).toBe(row.promoter);
   expect(p.firstSeen).toBe(row.date); expect(p.lastUpdated).toBe(row.date);
   expect(p.sourceUrl).toMatch(/^https:\/\//);
   expect(getCanonicalProposalPresentationIds()).toContain(row.id);
   const c=getCanonicalProposalPresentation(p);
   expect(c.proposalId).toBe(row.id); expect(c.request).toBeTruthy(); expect(c.measures).toHaveLength(row.count);
   const primary=getProposalPrimaryPaSubject(p);
   expect(primary.code).toBe(row.primary); expect(primary.source).toBe("schema.gov.it / AgID");
   const second=getProposalSecondaryPaSubjects(p);
   expect(second.map(s=>s.code)).toEqual([...row.secondary]); expect(second.every(s=>s.uri!==primary.uri)).toBe(true);
   const competence=getProposalInstitutionalCompetence(p);
   expect(competence.sourceAddressee).toBe(p.institutionalRecipient); expect(competence.publicAddressee).toBeTruthy();
   expect(competence.assessmentStatus).toBe(row.assessment); expect(competence.primaryAuthority).toBeUndefined();
   if(row.assessment==="partially_verified") expect(competence.involvedAuthorities[0]?.sourceUrl).toContain("comune.lamezia-terme.cz.it");
   else expect(competence.involvedAuthorities).toEqual([]);
   expect(p.events.map(e=>e.type)).toEqual(["emersione"]); expect(p.events.map(e=>e.date)).toEqual([row.date]); expect(p.linkedActs).toHaveLength(0);
   const state=getProposalInstitutionalState(p);
   expect(state.hasFormalization).toBe(false); expect(state.hasInstitutionalFollowUp).toBe(false); expect(state.publicState).toBe("segnalata"); expect(state.implementation).toBe("none");
   expect(getProposalInstitutionalState({...p,events:[...p.events,{...p.events[0]!,type:"petizione"}]}).hasFormalization).toBe(false);
   expect(getProposalInstitutionalState({...p,status:"recepita_parzialmente"}).implementation).toBe("none");
   const geo=getProposalGeography(row.id)!;
   expect(geo.scope).toBe(row.scope); expect(geo.areas).toEqual([row.area]); expect(geo.points).toHaveLength(0); expect(isProposalGeoreferenced(row.id)).toBe(false);
 });
 it("mantiene distinti i promotori delle candidature costiere", () => {
   const p=PUBLIC_PROPOSALS.find(p=>p.id==="porto-turistico-marinella-cafarone-ginepri-cristiano-villella-2026")!;
   const q=PUBLIC_PROPOSALS.find(p=>p.id==="approdo-turistico-leggero-gruppo-pd-2026")!;
   expect(p.promoterId).not.toBe(q.promoterId);
   expect(p.threadId).toBe(q.threadId);
 });
});
