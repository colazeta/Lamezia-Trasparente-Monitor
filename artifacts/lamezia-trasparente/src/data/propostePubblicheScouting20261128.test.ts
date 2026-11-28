import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects, getProposalInstitutionalCompetence, getProposalInstitutionalState } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";
const cases = [
  {
    "id": "sfere-terina-valorizzazione-costruttori-nautici-2026",
    "primary": "10",
    "secondary": [
      "7",
      "4"
    ],
    "count": 4,
    "area": "sant_eufemia",
    "scope": "area",
    "dates": [
      "2026-09-27",
      "2026-11-20",
      "2026-11-27"
    ],
    "events": [
      "emersione",
      "aggiornamento",
      "aggiornamento"
    ]
  },
  {
    "id": "beni-confiscati-fug-libera-lamezia-2026",
    "primary": "8",
    "secondary": [
      "9"
    ],
    "count": 1,
    "area": "intera_citta",
    "scope": "citywide",
    "dates": [
      "2026-11-25",
      "2026-11-27"
    ],
    "events": [
      "petizione",
      "aggiornamento"
    ]
  }
] as const;
describe("Scouting 28 novembre — gate congiunto", () => {
 it("preserva il catalogo ufficiale e gli ID univoci", () => {
   const subjects = getAllPaPublicServiceSubjects();
   expect(subjects).toHaveLength(15);
   expect(new Set(subjects.map(s=>s.code)).size).toBe(15);
   subjects.forEach(s=>{expect(s.label && s.uri && s.schemeUri && s.authority).toBeTruthy();});
   expect(new Set(PUBLIC_PROPOSALS.map(p=>p.id)).size).toBe(PUBLIC_PROPOSALS.length);
 });
 for (const row of cases) it("verifica acquisizione, canone, semantica, stato e geografia: "+row.id, () => {
   const matches=PUBLIC_PROPOSALS.filter(p=>p.id===row.id); expect(matches).toHaveLength(1);
   const p=matches[0]!; expect(p.sourceUrl).toMatch(/^https:\/\//);
   expect(getCanonicalProposalPresentationIds()).toContain(row.id);
   const c=getCanonicalProposalPresentation(p); expect(c.proposalId).toBe(row.id); expect(c.request).toBeTruthy(); expect(c.measures).toHaveLength(row.count);
   const primary=getProposalPrimaryPaSubject(p); expect(primary.code).toBe(row.primary); expect(primary.source).toBe("schema.gov.it / AgID");
   const second=getProposalSecondaryPaSubjects(p); expect(second.map(s=>s.code)).toEqual([...row.secondary]); expect(second.every(s=>s.uri!==primary.uri)).toBe(true);
   const competence=getProposalInstitutionalCompetence(p); expect(competence.sourceAddressee).toBe(p.institutionalRecipient); expect(competence.publicAddressee).toBeTruthy(); expect(competence.assessmentStatus).toBe("not_assessed"); expect(competence.primaryAuthority).toBeUndefined(); expect(competence.involvedAuthorities).toEqual([]);
   expect(p.events.map(e=>e.type)).toEqual([...row.events]); expect(p.events.map(e=>e.date)).toEqual([...row.dates]); expect(p.firstSeen).toBe(row.dates[0]); expect(p.lastUpdated).toBe(row.dates[row.dates.length-1]); expect(p.linkedActs).toHaveLength(0);
   const state=getProposalInstitutionalState(p); expect(state.hasFormalization).toBe(false); expect(state.hasInstitutionalFollowUp).toBe(false); expect(state.publicState).toBe("segnalata"); expect(state.implementation).toBe("none");
   expect(getProposalInstitutionalState({...p,events:[...p.events,{...p.events[0]!,type:"petizione"}]}).hasFormalization).toBe(false);
   expect(getProposalInstitutionalState({...p,status:"recepita_parzialmente"}).implementation).toBe("none");
   const geo=getProposalGeography(row.id)!; expect(geo.scope).toBe(row.scope); expect(geo.areas).toEqual([row.area]); expect(geo.points).toHaveLength(0); expect(isProposalGeoreferenced(row.id)).toBe(false);
 });
});
