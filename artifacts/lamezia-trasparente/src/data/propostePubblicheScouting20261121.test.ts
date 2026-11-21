import { describe, expect, it } from "vitest";
import { PUBLIC_PROPOSALS, getAllPaPublicServiceSubjects, getCanonicalProposalPresentation, getCanonicalProposalPresentationIds, getProposalPrimaryPaSubject, getProposalSecondaryPaSubjects, getProposalInstitutionalCompetence, getProposalInstitutionalState } from "./propostePubbliche";
import { getProposalGeography, isProposalGeoreferenced } from "./proposalGeography";
const expectations = [
  {
    "id": "ospedale-lamezia-spoke-sismico-dipartimenti-perri-2026",
    "primary": "2",
    "secondary": [
      "8"
    ],
    "dates": [
      "2026-09-24",
      "2026-11-20"
    ],
    "promoter": "cesare-perri"
  },
  {
    "id": "rotoli-illuminazione-mozione-vescio-muraca-2026",
    "primary": "4",
    "secondary": [
      "8",
      "12"
    ],
    "dates": [
      "2026-05-14",
      "2026-05-19",
      "2026-11-20"
    ],
    "promoter": "lidia-vescio"
  },
  {
    "id": "rotoli-illuminazione-verifiche-branca-2026",
    "primary": "4",
    "secondary": [
      "8",
      "12"
    ],
    "dates": [
      "2026-11-20"
    ],
    "promoter": "oscar-branca"
  },
  {
    "id": "via-montello-illuminazione-potature-carito-2026",
    "primary": "4",
    "secondary": [
      "8"
    ],
    "dates": [
      "2026-11-14",
      "2026-11-20"
    ],
    "promoter": "francesco-carito-partito-democratico-lamezia"
  }
];
describe("Scouting 21 novembre: copertura canonica e gate sui medesimi quattro proposal ID", () => {
 it("conserva l'intero vocabolario nazionale anche per materie non impiegate", () => {
 const v=getAllPaPublicServiceSubjects(); expect(v).toHaveLength(15); expect(new Set(v.map(x=>x.code)).size).toBe(15);
 for(const x of v){expect(x.code).toBeTruthy(); expect(x.label).toBeTruthy();expect(x.uri).toMatch(/^https:\/\//);expect(x.schemeUri).toMatch(/^https:\/\//);expect(x.authority).toBeTruthy();}
 });
 it("mantiene identità, cronologia e un'unica materia ufficiale primaria per record", () => {
 expect(new Set(PUBLIC_PROPOSALS.map(p=>p.id)).size).toBe(PUBLIC_PROPOSALS.length);
 for(const item of expectations) {
 const list=PUBLIC_PROPOSALS.filter(p=>p.id===item.id);expect(list,item.id).toHaveLength(1);
 const p=list[0]!;expect(p.promoterId).toBe(item.promoter);expect(p.events.map(e=>e.date)).toEqual(item.dates);
 expect(getProposalPrimaryPaSubject(p).code).toBe(item.primary);
 const sec=getProposalSecondaryPaSubjects(p);expect(sec.map(s=>s.code)).toEqual(item.secondary);
 expect(sec.every(s=>s.uri!==getProposalPrimaryPaSubject(p).uri)).toBe(true);
 expect(getCanonicalProposalPresentationIds()).toContain(item.id);
 const canonical=getCanonicalProposalPresentation(p); expect(canonical.proposalId).toBe(item.id);expect(canonical.title).toBeTruthy();expect(canonical.request).toBeTruthy();expect(canonical.measures.length).toBeGreaterThan(2);expect(canonical.measures.every(m=>m.length>18)).toBe(true);
 }
 });
 it("separa destinatario e competenza; dichiarazioni di mozioni e interrogazioni non provano deposito o attuazione", () => {
 for(const item of expectations){const p=PUBLIC_PROPOSALS.find(x=>x.id===item.id)!;expect(p.institutionalRecipient).toBeTruthy(); const c=getProposalInstitutionalCompetence(p);expect(c.sourceAddressee).toBe(p.institutionalRecipient);expect(c.assessmentStatus).toBe("not_assessed");expect(c.primaryAuthority).toBeUndefined();const s=getProposalInstitutionalState(p);expect(s.hasFormalization).toBe(false);expect(s.implementation).toBe("none");expect(s.publicState).toBe("segnalata");expect(p.events.every(e=>!["deposito","recepimento","petizione"].includes(e.type))).toBe(true);}
 });
 it("assicura integrità delle aree e assenza di coordinate WGS84 non verificate", () => {
 for(const item of expectations){const g=getProposalGeography(item.id)!;expect(g).toBeDefined();expect(g.areas.length).toBeGreaterThan(0);expect(g.points).toHaveLength(0);expect(isProposalGeoreferenced(item.id)).toBe(false);}
 for(const item of expectations.slice(0,3)){expect(getProposalGeography(item.id)!.scope).toBe("area");}
 });
 it("conserva gli stessi oggetti senza confondere promotori, oggetti o filoni", () => {
 const b=PUBLIC_PROPOSALS.find(p=>p.id==="rotoli-illuminazione-verifiche-branca-2026")!;const v=PUBLIC_PROPOSALS.find(p=>p.id==="rotoli-illuminazione-mozione-vescio-muraca-2026")!;expect(b.threadId).toBe(v.threadId);expect(b.promoterId).not.toBe(v.promoterId);
 expect(PUBLIC_PROPOSALS.filter(p=>p.id==="via-montello-illuminazione-potature-carito-2026")).toHaveLength(1);
 });
});
